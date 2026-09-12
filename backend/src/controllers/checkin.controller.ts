import { Request, Response } from 'express';
import { Booking } from '../models/booking.model';
import { BoardingPass } from '../models/boardingpass.model';
import QRCode from 'qrcode';
import { randomUUID } from 'crypto';

export const checkIn = async (req: Request, res: Response) => {
  try {
    const { bookingId, passengerIndex, seat } = req.body;

    if (!bookingId || typeof passengerIndex !== 'number') {
      return res.status(400).json({
        message: 'bookingId and passengerIndex required',
      });
    }

    const booking = await Booking.findOne({
      bookingId,
    }).populate('user');

    if (!booking) {
      return res.status(404).json({
        message: 'Booking not found',
      });
    }

    if (booking.status !== 'CONFIRMED') {
      return res.status(400).json({
        message: 'Booking not confirmed',
      });
    }

    // assign seat if provided
    if (seat) {
      booking.seats[passengerIndex] = seat;
      await booking.save();
    }

    const bpNumber = `BP-${randomUUID()}`;

    const customerEmail =
      (booking.user as any)?.email ||
      booking.passengers?.[passengerIndex]?.email ||
      '';

    const qrData = JSON.stringify({
      bpNumber,
      bookingId,
      passengerIndex,
      customerEmail,
    });

    const qrBuffer = await QRCode.toDataURL(qrData);

    const bp = new BoardingPass({
      bookingId,
      passengerIndex,
      bpNumber,
      seat:
        booking.seats[passengerIndex] || seat,
      qrData,
    });

    await bp.save();

    res.json({
      bpNumber,
      qr: qrBuffer,
      seat: bp.seat,
      customerEmail,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: 'Failed to check-in',
    });
  }
};