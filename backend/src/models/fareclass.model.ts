import mongoose, { Schema, Document } from 'mongoose';

export interface IFareClass extends Document {
  code: string; // ECON, PE, BUS
  name: string;
  baseMultiplier: number; // multiplier over base price
  baggageKg: number;
}

const FareClassSchema: Schema = new Schema(
  {
    code: { type: String, required: true, uppercase: true, index: true },
    name: { type: String, required: true },
    baseMultiplier: { type: Number, required: true },
    baggageKg: { type: Number, default: 20 }
  },
  { timestamps: true }
);

export const FareClass = mongoose.model<IFareClass>('FareClass', FareClassSchema);
