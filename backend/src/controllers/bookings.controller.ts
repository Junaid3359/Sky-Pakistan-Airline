import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Booking, BookingStatus } from '../models/booking.model';
import { SeatInventory, SeatStatus } from '../models/seatInventory.model';
import { assignPNR } from '../services/pnr.service';
import { v4 as uuidv4 } from 'uuid';
import { Payment } from '../models/payment.model';
import { recordAudit } from '../services/audit.service';

// Initiate booking: hold seats
export const initiateBooking = async (req: Request, res: Response) => {
  const { flightId, seats = [], passengers = [], totalPrice = 0 } = req.body;
  // basic validation
  if (!flightId || !seats.length) return res.status(400).json({ message: 'flightId and seats required' });

  try {
    // attempt to hold each seat atomically
    const now = new Date();
    const holdSeconds = parseInt(process.env.SEAT_HOLD_SECONDS || '300', 10);
    const heldUntil = new Date(Date.now() + holdSeconds * 1000);

    const updatedSeats: string[] = [];
    for (const seat of seats) {
      const q = { flight: flightId, seatNumber: seat, $or: [{ status: SeatStatus.AVAILABLE }, { status: SeatStatus.HELD, heldUntil: { $lte: now } }] } as any;
      const upd = { $set: { status: SeatStatus.HELD, heldBy: req.user?.id, heldUntil } };
      const si = await SeatInventory.findOneAndUpdate(q, upd, { new: true });
      if (!si) {
        throw new Error(`Seat ${seat} is not available`);
      }
      updatedSeats.push(seat);
    }

    const bookingId = uuidv4();
    const booking = new Booking({ bookingId, user: req.user?.id, flight: flightId, passengers, seats: updatedSeats, totalPrice, status: BookingStatus.PENDING_PAYMENT });
    await booking.save();
    res.json({ bookingId, seats: updatedSeats, expiresAt: heldUntil });
  } catch (err: any) {
    res.status(400).json({ message: err.message || 'Failed to hold seats' });
  }
};

// Confirm booking after payment: mark seats BOOKED, assign PNR
export const confirmBooking = async (req: Request, res: Response) => {
  const { bookingId, paymentId } = req.body;
  if (!bookingId || !paymentId) return res.status(400).json({ message: 'bookingId and paymentId required' });
  try {
    const booking = await Booking.findOne({ bookingId });
    if (!booking) throw new Error('Booking not found');
    if (booking.status !== BookingStatus.PENDING_PAYMENT) throw new Error('Invalid booking status');

    // verify payment
    const payment = await Payment.findOne({ paymentId });
    if (!payment) throw new Error('Payment not found');
    if (payment.status !== 'SUCCESS') throw new Error('Payment not successful');

    // verify held seats still belong to this booking (heldBy or heldUntil valid) and mark booked
    const now = new Date();
    const failedSeats: string[] = [];
    for (const seat of booking.seats) {
      const q: any = { flight: booking.flight, seatNumber: seat, status: SeatStatus.HELD };
      // ensure the hold is still valid for this user/booking
      q.$or = [{ heldBy: booking.user }, { heldUntil: { $gt: now } }];
      const si = await SeatInventory.findOneAndUpdate(q, { $set: { status: SeatStatus.BOOKED, heldBy: null, heldUntil: null } });
      if (!si) {
        failedSeats.push(seat);
      }
    }
    if (failedSeats.length) {
      throw new Error(`Seats no longer available: ${failedSeats.join(',')}`);
    }

    // assign PNR
    const pnr = await assignPNR(bookingId);
    booking.pnr = pnr;
    booking.status = BookingStatus.CONFIRMED;
    await booking.save();
    payment.bookingId = bookingId;
    await payment.save();
    // audit
    try { await recordAudit({ user: req.user?.id, action: 'BOOKING_CONFIRMED', resource: bookingId, details: { pnr } , ip: req.ip }); } catch(e){}
    res.json({ bookingId, pnr });
  } catch (err: any) {
    res.status(400).json({ message: err.message || 'Failed to confirm booking' });
  }
};

// Verify booking holds before payment — lightweight preflight check
export const verifyBooking = async (req: Request, res: Response) => {
  const { bookingId } = req.body;
  if (!bookingId) return res.status(400).json({ message: 'bookingId required' });
  try {
    const booking = await Booking.findOne({ bookingId });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    const now = new Date();
    const failed: string[] = [];
    for (const seat of booking.seats) {
      const si = await SeatInventory.findOne({ flight: booking.flight, seatNumber: seat });
      if (!si) { failed.push(seat); continue; }
      // must be HELD and by same user or still within heldUntil
      if (si.status !== SeatStatus.HELD) { failed.push(seat); continue; }
      if (si.heldBy && si.heldBy.toString() !== (booking.user as any)?.toString() && (!si.heldUntil || si.heldUntil <= now)) { failed.push(seat); continue; }
    }
    if (failed.length) return res.json({ ok: false, failedSeats: failed });
    return res.json({ ok: true, expiresAt: booking.seats && booking.seats.length ? undefined : undefined });
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to verify booking' });
  }
};

export const getBooking = async (req: Request, res: Response) => {
  try {
    const b = await Booking.findOne({ bookingId: req.params.bookingId }).populate('flight').select('-__v');
    if (!b) return res.status(404).json({ message: 'Booking not found' });
    res.json({ booking: b });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get booking' });
  }
};
