import mongoose, { Schema, Document } from 'mongoose';

export interface IAirport extends Document {
  name: string;
  iata: string;
  icao?: string;
  city: string;
  country: string;
  timezone?: string;
  terminals?: string[];
}

const AirportSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    iata: { type: String, required: true, uppercase: true, index: true },
    icao: { type: String },
    city: { type: String, required: true },
    country: { type: String, required: true },
    timezone: { type: String },
    terminals: { type: [String], default: [] }
  },
  { timestamps: true }
);

AirportSchema.index({ iata: 1 }, { unique: true });

export const Airport = mongoose.model<IAirport>('Airport', AirportSchema);
