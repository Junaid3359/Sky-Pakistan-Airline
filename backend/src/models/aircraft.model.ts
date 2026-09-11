import mongoose, { Schema, Document } from 'mongoose';

export interface IAircraft extends Document {
  model: string;
  registration: string;
  capacity: number;
  seatLayout: any; // keep flexible for now
}

const AircraftSchema: Schema = new Schema(
  {
    model: { type: String, required: true },
    registration: { type: String, required: true, unique: true },
    capacity: { type: Number, required: true },
    seatLayout: { type: Schema.Types.Mixed }
  },
  { timestamps: true }
);

export const Aircraft = mongoose.model<IAircraft>('Aircraft', AircraftSchema);
