import mongoose, { Schema, Document } from 'mongoose';

export enum SeatStatus {
  AVAILABLE = 'AVAILABLE',
  HELD = 'HELD',
  BOOKED = 'BOOKED'
}

export interface ISeatInventory extends Document {
  flight: mongoose.Types.ObjectId;
  seatNumber: string; // e.g., 12A
  cabin: string;
  fareCode?: string;
  status: SeatStatus;
  heldBy?: mongoose.Types.ObjectId; // user who holds
  heldUntil?: Date;
}

const SeatInventorySchema: Schema = new Schema(
  {
    flight: { type: Schema.Types.ObjectId, ref: 'Flight', required: true, index: true },
    seatNumber: { type: String, required: true },
    cabin: { type: String },
    fareCode: { type: String },
    status: { type: String, enum: Object.values(SeatStatus), default: SeatStatus.AVAILABLE },
    heldBy: { type: Schema.Types.ObjectId, ref: 'User' },
    heldUntil: { type: Date }
  },
  { timestamps: true }
);

SeatInventorySchema.index({ flight: 1, seatNumber: 1 }, { unique: true });

export const SeatInventory = mongoose.model<ISeatInventory>('SeatInventory', SeatInventorySchema);
