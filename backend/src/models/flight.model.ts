import mongoose, { Schema, Document } from 'mongoose';

export enum FlightStatus {
  SCHEDULED = 'SCHEDULED',
  BOARDING = 'BOARDING',
  DELAYED = 'DELAYED',
  DEPARTED = 'DEPARTED',
  ARRIVED = 'ARRIVED',
  CANCELLED = 'CANCELLED'
}

export interface IFlight extends Document {
  flightNumber: string;
  origin: string; // IATA
  destination: string; // IATA
  departure: Date;
  arrival: Date;
  aircraft: mongoose.Types.ObjectId;
  status: FlightStatus;
  totalCapacity: number;
  basePrice: number;
}

const FlightSchema: Schema = new Schema(
  {
    flightNumber: { type: String, required: true, index: true },
    origin: { type: String, required: true },
    destination: { type: String, required: true },
    departure: { type: Date, required: true },
    arrival: { type: Date, required: true },
    aircraft: { type: Schema.Types.ObjectId, ref: 'Aircraft', required: true },
    status: { type: String, enum: Object.values(FlightStatus), default: FlightStatus.SCHEDULED },
    totalCapacity: { type: Number, default: 0 },
    basePrice: { type: Number, default: 0 }
  },
  { timestamps: true }
);

FlightSchema.index({ flightNumber: 1, departure: 1 });

export const Flight = mongoose.model<IFlight>('Flight', FlightSchema);
