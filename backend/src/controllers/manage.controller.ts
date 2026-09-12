import { Request, Response } from 'express';
import { randomUUID } from 'crypto';

import {
  Booking,
  BookingStatus,
} from '../models/booking.model';

import {
  SeatInventory,
  SeatStatus,
} from '../models/seatInventory.model';

import { Refund } from '../models/refund.model';

export const cancelBooking = async (
  req: Request,
  res: Response
) => {
  try {
    const { bookingId, reason } = req.body;

    if (!bookingId) {
      return res.status(400).json({
        message: 'bookingId required',
      });
    }

    const booking = await Booking.findOne({
      bookingId,
    });

    if (!booking) {
      return res.status(404).json({
        message: 'Booking not found',
      });
    }

    // Check if already cancelled
    if (
      booking.status ===
      ('CANCELLED' as BookingStatus)
    ) {
      return res.status(400).json({
        message: 'Already cancelled',
      });
    }

    // Release seats
    for (const seat of booking.seats) {
      await SeatInventory.findOneAndUpdate(
        {
          flight: booking.flight,
          seatNumber: seat,
        },
        {
          $set: {
            status: SeatStatus.AVAILABLE,
            heldBy: null,
            heldUntil: null,
          },
        }
      );
    }

    // Mark booking as cancelled
    booking.status =
      'CANCELLED' as BookingStatus;

    await booking.save();

    // Get flight information
    const { Flight } = await import(
      '../models/flight.model'
    );

    const flight = await Flight.findById(
      booking.flight
    );

    // Simple refund policy:
    // 90% refund if cancelled more than 24 hours
    // before departure, otherwise 50%.
    let refundAmount =
      Number(booking.totalPrice) * 0.5;

    if (flight) {
      const diff =
        (flight.departure.getTime() -
          Date.now()) /
        (1000 * 60 * 60);

      if (diff > 24) {
        refundAmount =
          Number(booking.totalPrice) * 0.9;
      }
    }

    // Generate refund ID using Node.js crypto
    // instead of uuid package.
    const refundId = `RF-${randomUUID()}`;

    const refund = new Refund({
      refundId,
      bookingId: booking.bookingId,
      amount: Math.round(refundAmount),
      status: 'PENDING',
      reason: reason || undefined,
    });

    await refund.save();

    // Audit
    try {
      const { recordAudit } = await import(
        '../services/audit.service'
      );

      await recordAudit({
        user: (req as any).user?.id,
        action: 'BOOKING_CANCELLED',
        resource: bookingId,
        details: {
          refundId: refund.refundId,
        },
        ip: req.ip,
      });
    } catch (e) {
      // Audit failure should not fail cancellation
    }

    return res.json({
      success: true,
      refundId: refund.refundId,
      amount: refund.amount,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: 'Failed to cancel booking',
    });
  }
};

export const modifyBooking = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      bookingId,
      changes,
    } = req.body;

    if (!bookingId || !changes) {
      return res.status(400).json({
        message:
          'bookingId and changes required',
      });
    }

    const booking = await Booking.findOne({
      bookingId,
    });

    if (!booking) {
      return res.status(404).json({
        message: 'Booking not found',
      });
    }

    Object.assign(booking, changes);

    await booking.save();

    return res.json({
      booking,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message:
        'Failed to modify booking',
    });
  }
};

export const retrieveByPNR = async (
  req: Request,
  res: Response
) => {
  try {
    const { pnr } = req.query as {
      pnr?: string;
    };

    if (!pnr) {
      return res.status(400).json({
        message: 'pnr required',
      });
    }

    const booking = await Booking.findOne({
      pnr,
    }).populate('flight');

    if (!booking) {
      return res.status(404).json({
        message: 'Booking not found',
      });
    }

    return res.json({
      booking,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message:
        'Failed to retrieve booking',
    });
  }
};