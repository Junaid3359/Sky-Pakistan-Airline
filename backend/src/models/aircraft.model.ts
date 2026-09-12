import mongoose, { Schema } from 'mongoose';

export interface IAircraft {
  model: string;
  registration: string;
  capacity: number;
  seatLayout: any;
}

const AircraftSchema = new Schema<IAircraft>(
  {
    model: { type: String, required: true },
    registration: { type: String, required: true, unique: true },
    capacity: { type: Number, required: true },
    seatLayout: { type: Schema.Types.Mixed }
  },
  { timestamps: true }
);

export const Aircraft = mongoose.model<IAircraft>(
  'Aircraft',
  AircraftSchema
);