import mongoose, { Schema, Document } from 'mongoose';

export enum RefundStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED'
}

export interface IRefund extends Document {
  refundId: string;
  bookingId: string;
  amount: number;
  status: RefundStatus;
}

const RefundSchema: Schema = new Schema(
  {
    refundId: { type: String, required: true, unique: true },
    bookingId: { type: String, required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: Object.values(RefundStatus), default: RefundStatus.PENDING }
  },
  { timestamps: true }
);

export const Refund = mongoose.model<IRefund>('Refund', RefundSchema);
