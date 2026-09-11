import mongoose, { Schema, Document } from 'mongoose';

export interface IBoardingPass extends Document {
  bookingId: string;
  passengerIndex: number;
  bpNumber: string;
  seat: string;
  gate?: string;
  boardingTime?: Date;
  qrData?: string;
}

const BoardingPassSchema: Schema = new Schema(
  {
    bookingId: { type: String, required: true, index: true },
    passengerIndex: { type: Number, required: true },
    bpNumber: { type: String, required: true, unique: true },
    seat: { type: String, required: true },
    gate: { type: String },
    boardingTime: { type: Date },
    qrData: { type: String }
  },
  { timestamps: true }
);

export const BoardingPass = mongoose.model<IBoardingPass>('BoardingPass', BoardingPassSchema);
