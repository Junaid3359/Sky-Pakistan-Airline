import { Request, Response } from 'express';
import { randomUUID } from 'crypto';

import { Booking, BookingStatus } from '../models/booking.model';
import {
  SeatInventory,
  SeatStatus,
} from '../models/seatInventory.model';
import { assignPNR } from '../services/pnr.service';
import { Payment } from '../models/payment.model';
import { recordAudit } from '../services/audit.service';

// Initiate booking: hold seats
export const initiateBooking = async (
  req: Request,
  res: Response
) => {
  const {
    flightId,
    seats = [],
    passengers = [],
    totalPrice = 0,
  } = req.body;

  if (!flightId || !seats.length) {
    return res.status(400).json({
      message: 'flightId and seats required',
    });
  }

  try {
    const now = new Date();

    const holdSeconds = parseInt(
      process.env.SEAT_HOLD_SECONDS || '300',
      10
    );

    const heldUntil = new Date(
      Date.now() + holdSeconds * 1000
    );

    const updatedSeats: string[] = [];

    // Get authenticated user safely
    const userId = (req as any).user?.id;

    for (const seat of seats) {
      const q = {
        flight: flightId,
        seatNumber: seat,
        $or: [
          {
            status: SeatStatus.AVAILABLE,
          },
          {
            status: SeatStatus.HELD,
            heldUntil: {
              $lte: now,
            },
          },
        ],
      } as any;

      const upd = {
        $set: {
          status: SeatStatus.HELD,
          heldBy: userId,
          heldUntil,
        },
      };

      const si = await SeatInventory.findOneAndUpdate(
        q,
        upd,
        {
          new: true,
        }
      );

      if (!si) {
        throw new Error(
          `Seat ${seat} is not available`
        );
      }

      updatedSeats.push(seat);
    }

    // Generate booking ID without uuid package
    const bookingId = randomUUID();

    const booking = new Booking({
      bookingId,
      user: userId,
      flight: flightId,
      passengers,
      seats: updatedSeats,
      totalPrice,
      status: BookingStatus.PENDING_PAYMENT,
    });

    await booking.save();

    return res.json({
      bookingId,
      seats: updatedSeats,
      expiresAt: heldUntil,
    });
  } catch (err: any) {
    return res.status(400).json({
      message:
        err.message || 'Failed to hold seats',
    });
  }
};

// Confirm booking after payment
export const confirmBooking = async (
  req: Request,
  res: Response
) => {
  const {
    bookingId,
    paymentId,
  } = req.body;

  if (!bookingId || !paymentId) {
    return res.status(400).json({
      message:
        'bookingId and paymentId required',
    });
  }

  try {
    const booking = await Booking.findOne({
      bookingId,
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    if (
      booking.status !==
      BookingStatus.PENDING_PAYMENT
    ) {
      throw new Error(
        'Invalid booking status'
      );
    }

    // Verify payment
    const payment = await Payment.findOne({
      paymentId,
    });

    if (!payment) {
      throw new Error('Payment not found');
    }

    if (payment.status !== 'SUCCESS') {
      throw new Error(
        'Payment not successful'
      );
    }

    const now = new Date();

    const failedSeats: string[] = [];

    for (const seat of booking.seats) {
      const q: any = {
        flight: booking.flight,
        seatNumber: seat,
        status: SeatStatus.HELD,
      };

      q.$or = [
        {
          heldBy: booking.user,
        },
        {
          heldUntil: {
            $gt: now,
          },
        },
      ];

      const si =
        await SeatInventory.findOneAndUpdate(
          q,
          {
            $set: {
              status: SeatStatus.BOOKED,
              heldBy: null,
              heldUntil: null,
            },
          }
        );

      if (!si) {
        failedSeats.push(seat);
      }
    }

    if (failedSeats.length) {
      throw new Error(
        `Seats no longer available: ${failedSeats.join(
          ', '
        )}`
      );
    }

    // Assign PNR
    const pnr = await assignPNR(
      bookingId
    );

    booking.pnr = pnr;
    booking.status =
      BookingStatus.CONFIRMED;

    await booking.save();

    payment.bookingId = bookingId;

    await payment.save();

    // Audit
    try {
      await recordAudit({
        user: (req as any).user?.id,
        action: 'BOOKING_CONFIRMED',
        resource: bookingId,
        details: {
          pnr,
        },
        ip: req.ip,
      });
    } catch (e) {
      // Audit failure should not fail booking
    }

    return res.json({
      bookingId,
      pnr,
    });
  } catch (err: any) {
    return res.status(400).json({
      message:
        err.message ||
        'Failed to confirm booking',
    });
  }
};

// Verify booking holds before payment
export const verifyBooking = async (
  req: Request,
  res: Response
) => {
  const { bookingId } = req.body;

  if (!bookingId) {
    return res.status(400).json({
      message: 'bookingId required',
    });
  }

  try {
    const booking = await Booking.findOne({
      bookingId,
    });

    if (!booking) {
      return res.status(404).json({
        message: 'Booking not found',
      });
    }

    const now = new Date();

    const failed: string[] = [];

    for (const seat of booking.seats) {
      const si = await SeatInventory.findOne({
        flight: booking.flight,
        seatNumber: seat,
      });

      if (!si) {
        failed.push(seat);
        continue;
      }

      if (si.status !== SeatStatus.HELD) {
        failed.push(seat);
        continue;
      }

      if (
        si.heldBy &&
        si.heldBy.toString() !==
          (booking.user as any)?.toString() &&
        (!si.heldUntil ||
          si.heldUntil <= now)
      ) {
        failed.push(seat);
        continue;
      }
    }

    if (failed.length) {
      return res.json({
        ok: false,
        failedSeats: failed,
      });
    }

    return res.json({
      ok: true,
    });
  } catch (err: any) {
    return res.status(500).json({
      message:
        'Failed to verify booking',
    });
  }
};

// Get booking by booking ID
export const getBooking = async (
  req: Request,
  res: Response
) => {
  try {
    const booking =
      await Booking.findOne({
        bookingId:
          req.params.bookingId,
      })
        .populate('flight')
        .select('-__v');

    if (!booking) {
      return res.status(404).json({
        message: 'Booking not found',
      });
    }

    return res.json({
      booking,
    });
  } catch (err) {
    return res.status(500).json({
      message:
        'Failed to get booking',
    });
  }
};