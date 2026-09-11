import crypto from 'crypto';
import { Booking } from '../models/booking.model';

export function generatePNR() {
  // 6 alphanumeric uppercase
  return crypto.randomBytes(4).toString('hex').toUpperCase().slice(0,6);
}

export async function assignPNR(bookingId: string) {
  let pnr: string;
  // try to ensure uniqueness
  for (let i = 0; i < 5; i++) {
    pnr = generatePNR();
    const exists = await Booking.findOne({ pnr });
    if (!exists) {
      await Booking.findOneAndUpdate({ bookingId }, { pnr });
      return pnr;
    }
  }
  throw new Error('Failed to generate unique PNR');
}
