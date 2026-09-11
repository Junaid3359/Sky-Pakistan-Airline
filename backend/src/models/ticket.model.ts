import mongoose, { Schema, Document } from 'mongoose';

export interface ITicket extends Document {
  booking: mongoose.Types.ObjectId;
  ticketNumber: string;
  passenger: any;
  issuedAt: Date;
}

const TicketSchema: Schema = new Schema(
  {
    booking: { type: Schema.Types.ObjectId, ref: 'Booking', required: true },
    ticketNumber: { type: String, required: true, unique: true },
    passenger: { type: Schema.Types.Mixed },
    issuedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export const Ticket = mongoose.model<ITicket>('Ticket', TicketSchema);
