import mongoose, { Schema, Document } from 'mongoose';

export enum PaymentStatus {
  CREATED = 'CREATED',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED'
}

export interface IPayment extends Document {
  paymentId: string;
  bookingId?: string;
  amount: number;
  method: string;
  status: PaymentStatus;
  meta?: any;
}

const PaymentSchema: Schema = new Schema(
  {
    paymentId: { type: String, required: true, unique: true, index: true },
    bookingId: { type: String },
    amount: { type: Number, required: true },
    method: { type: String, required: true },
    status: { type: String, enum: Object.values(PaymentStatus), default: PaymentStatus.CREATED },
    meta: { type: Schema.Types.Mixed }
  },
  { timestamps: true }
);

export const Payment = mongoose.model<IPayment>('Payment', PaymentSchema);
