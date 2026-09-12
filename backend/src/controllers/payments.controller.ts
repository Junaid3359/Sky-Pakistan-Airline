import { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { Payment, PaymentStatus } from '../models/payment.model';

// Create a mock payment intent
export const createPayment = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      bookingId,
      amount,
      method = 'MOCK',
    } = req.body;

    if (!amount || !bookingId) {
      return res.status(400).json({
        message:
          'bookingId and amount required',
      });
    }

    const paymentId = `MOCK_${randomUUID()}`;

    const payment = new Payment({
      paymentId,
      bookingId,
      amount,
      method,
      status: PaymentStatus.CREATED,
    });

    await payment.save();

    res.json({
      paymentId,
      status: payment.status,
      next: '/api/payments/verify',
    });
  } catch (err) {
    res.status(500).json({
      message:
        'Failed to create payment',
    });
  }
};

// Verify or simulate successful payment
export const verifyPayment = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      paymentId,
      success = true,
    } = req.body;

    if (!paymentId) {
      return res.status(400).json({
        message: 'paymentId required',
      });
    }

    const p = await Payment.findOne({
      paymentId,
    });

    if (!p) {
      return res.status(404).json({
        message: 'Payment not found',
      });
    }

    p.status = success
      ? PaymentStatus.SUCCESS
      : PaymentStatus.FAILED;

    await p.save();

    res.json({
      paymentId: p.paymentId,
      status: p.status,
    });
  } catch (err) {
    res.status(500).json({
      message:
        'Failed to verify payment',
    });
  }
};

export const getPayment = async (
  req: Request,
  res: Response
) => {
  try {
    const p = await Payment.findOne({
      paymentId:
        req.params.paymentId,
    });

    if (!p) {
      return res.status(404).json({
        message: 'Payment not found',
      });
    }

    res.json({
      payment: p,
    });
  } catch (err) {
    res.status(500).json({
      message:
        'Failed to fetch payment',
    });
  }
};