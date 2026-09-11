import { Request, Response } from 'express';
import { Booking } from '../models/booking.model';
import { SeatInventory, SeatStatus } from '../models/seatInventory.model';
import { Refund } from '../models/refund.model';
import { v4 as uuidv4 } from 'uuid';

export const cancelBooking = async (req: Request, res: Response) => {
  try {
    const { bookingId, reason } = req.body;
    if (!bookingId) return res.status(400).json({ message: 'bookingId required' });
    const booking = await Booking.findOne({ bookingId });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.status === 'CANCELLED') return res.status(400).json({ message: 'Already cancelled' });

    // release seats
    for (const seat of booking.seats) {
      await SeatInventory.findOneAndUpdate({ flight: booking.flight, seatNumber: seat }, { $set: { status: SeatStatus.AVAILABLE, heldBy: null, heldUntil: null } });
    }

    booking.status = 'CANCELLED';
    await booking.save();

    // simple refund policy: 90% refund if cancelled >24h before departure, else 50%
    const flight = await (await import('../models/flight.model')).Flight.findById(booking.flight);
    let refundAmount = booking.totalPrice * 0.5;
    if (flight) {
      const diff = (flight.departure.getTime() - Date.now()) / (1000 * 60 * 60);
      if (diff > 24) refundAmount = booking.totalPrice * 0.9;
    }

    const refundId = `RF-${uuidv4()}`;
    const refund = new Refund({ refundId, bookingId: booking.bookingId, amount: Math.round(refundAmount), status: 'PENDING' });
    await refund.save();
    // audit
    try { await (await import('../services/audit.service')).recordAudit({ user: req.user?.id, action: 'BOOKING_CANCELLED', resource: bookingId, details: { refundId: refund.refundId }, ip: req.ip }); } catch(e){}
    res.json({ success: true, refundId: refund.refundId, amount: refund.amount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to cancel booking' });
  }
};

export const modifyBooking = async (req: Request, res: Response) => {
  try {
    const { bookingId, changes } = req.body;
    if (!bookingId || !changes) return res.status(400).json({ message: 'bookingId and changes required' });
    const booking = await Booking.findOne({ bookingId });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    Object.assign(booking, changes);
    await booking.save();
    res.json({ booking });
  } catch (err) {
    res.status(500).json({ message: 'Failed to modify booking' });
  }
};

export const retrieveByPNR = async (req: Request, res: Response) => {
  try {
    const { pnr } = req.query as any;
    if (!pnr) return res.status(400).json({ message: 'pnr required' });
    const booking = await Booking.findOne({ pnr }).populate('flight');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json({ booking });
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve booking' });
  }
};
