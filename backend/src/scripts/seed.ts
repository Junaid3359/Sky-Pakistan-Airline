import dotenv from 'dotenv';
import { connectDB } from '../config/db';
import { User, Role } from '../models/user.model';
import bcrypt from 'bcrypt';

dotenv.config();

async function seed() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/sky_pakistan';
  await connectDB(uri);
  // Create roles users if not exists
  const adminEmail = 'admin@skypakistan.test';
  const fmEmail = 'fm@skypakistan.test';
  const supportEmail = 'support@skypakistan.test';

  const users = [
    { email: adminEmail, password: 'password', role: Role.ADMIN, name: 'Admin User' },
    { email: fmEmail, password: 'password', role: Role.FLIGHT_MANAGER, name: 'Flight Manager' },
    { email: supportEmail, password: 'password', role: Role.SUPPORT_AGENT, name: 'Support Agent' }
  ];

  for (const u of users) {
    const existing = await User.findOne({ email: u.email });
    if (!existing) {
      const hashed = await bcrypt.hash(u.password, 10);
      const user = new User({ email: u.email, password: hashed, role: u.role, name: u.name, verified: true });
      await user.save();
      console.log('Created', u.email);
    } else {
      console.log('Exists', u.email);
    }
  }
  // Seed some airports and a sample aircraft + flight
  const Airport = (await import('../models/airport.model')).Airport;
  const Aircraft = (await import('../models/aircraft.model')).Aircraft;
  const Flight = (await import('../models/flight.model')).Flight;

  const demoAirports = [
    { name: 'Allama Iqbal International', iata: 'LHE', city: 'Lahore', country: 'Pakistan' },
    { name: 'Jinnah International', iata: 'KHI', city: 'Karachi', country: 'Pakistan' },
    { name: 'Benazir Bhutto International', iata: 'ISB', city: 'Islamabad', country: 'Pakistan' },
    { name: 'Skardu Airport', iata: 'SKT', city: 'Skardu', country: 'Pakistan' }
  ];

  for (const a of demoAirports) {
    const ex = await Airport.findOne({ iata: a.iata });
    if (!ex) await new Airport(a).save();
  }

  let ac = await Aircraft.findOne({ registration: 'AP-BACK' });
  if (!ac) {
    ac = await new Aircraft({ model: 'Airbus A320', registration: 'AP-BACK', capacity: 180, seatLayout: {} }).save();
  }

  // create sample flight
  const existingFlight = await Flight.findOne({ flightNumber: 'SKP100' });
  if (!existingFlight) {
    await new Flight({ flightNumber: 'SKP100', origin: 'LHE', destination: 'DXB', departure: new Date(Date.now() + 24 * 3600 * 1000), arrival: new Date(Date.now() + 24 * 3600 * 1000 + 3 * 3600 * 1000), aircraft: ac._id, totalCapacity: ac.capacity }).save();
  }
  // seed fare classes
  const FareClass = (await import('../models/fareclass.model')).FareClass;
  const fares = [
    { code: 'ECON', name: 'Economy', baseMultiplier: 1.0, baggageKg: 20 },
    { code: 'PE', name: 'Premium Economy', baseMultiplier: 1.5, baggageKg: 25 },
    { code: 'BUS', name: 'Business', baseMultiplier: 2.5, baggageKg: 30 }
  ];
  for (const fc of fares) {
    const ex = await FareClass.findOne({ code: fc.code });
    if (!ex) await new FareClass(fc).save();
  }

  // seed seat inventory for sample flight
  const seatModel = (await import('../models/seatInventory.model')).SeatInventory;
  const flight = await Flight.findOne({ flightNumber: 'SKP100' });
  if (flight) {
    const existingSeats = await seatModel.findOne({ flight: flight._id });
    if (!existingSeats) {
      const seats: any[] = [];
      const rows = 30;
      const layout = ['A','B','C','D','E','F'];
      for (let r=1;r<=rows;r++){
        for (const c of layout) {
          seats.push({ flight: flight._id, seatNumber: `${r}${c}`, cabin: r<=3? 'BUS' : r<=8? 'PE' : 'ECON', fareCode: r<=3? 'BUS' : r<=8? 'PE' : 'ECON' });
        }
      }
      await seatModel.insertMany(seats.slice(0, 180));
      console.log('Seeded seats for flight', flight.flightNumber);
    }
  }
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
