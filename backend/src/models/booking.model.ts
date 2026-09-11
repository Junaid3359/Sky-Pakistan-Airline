import mongoose, { Schema, Document } from 'mongoose';

export enum BookingStatus {
  INITIATED = 'INITIATED',
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED'
}

export interface IBooking extends Document {
  bookingId: string;
  pnr?: string;
  user?: mongoose.Types.ObjectId;
  flight: mongoose.Types.ObjectId;
  passengers: any[];
  seats: string[];
  totalPrice: number;
  status: BookingStatus;
}

const BookingSchema: Schema = new Schema(
  {
    bookingId: { type: String, required: true, unique: true, index: true },
    pnr: { type: String, unique: true, sparse: true },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    flight: { type: Schema.Types.ObjectId, ref: 'Flight', required: true },
    passengers: { type: [Schema.Types.Mixed], default: [] },
    seats: { type: [String], default: [] },
    totalPrice: { type: Number, default: 0 },
    status: { type: String, enum: Object.values(BookingStatus), default: BookingStatus.INITIATED }
  },
  { timestamps: true }
);

export const Booking = mongoose.model<IBooking>('Booking', BookingSchema);
