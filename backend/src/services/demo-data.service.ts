import { Aircraft } from '../models/aircraft.model';
import { Airport } from '../models/airport.model';
import bcrypt from 'bcrypt';
import { FareClass } from '../models/fareclass.model';
import { Flight } from '../models/flight.model';
import { Role, User } from '../models/user.model';

const origins = [
  ['ISB', 'Islamabad International', 'Islamabad', 'Pakistan'],
  ['MUX', 'Multan International', 'Multan', 'Pakistan'],
  ['KHI', 'Jinnah International', 'Karachi', 'Pakistan']
];

const destinations = [
  ['DXB', 'Dubai International', 'Dubai', 'United Arab Emirates', 520], ['LHR', 'Heathrow Airport', 'London', 'United Kingdom', 1350],
  ['IST', 'Istanbul Airport', 'Istanbul', 'Türkiye', 620], ['KUL', 'Kuala Lumpur International', 'Kuala Lumpur', 'Malaysia', 850],
  ['YYZ', 'Toronto Pearson', 'Toronto', 'Canada', 1700], ['MLE', 'Velana International', 'Male', 'Maldives', 700],
  ['DOH', 'Hamad International', 'Doha', 'Qatar', 480], ['JED', 'King Abdulaziz International', 'Jeddah', 'Saudi Arabia', 560],
  ['RUH', 'King Khalid International', 'Riyadh', 'Saudi Arabia', 540], ['BKK', 'Suvarnabhumi Airport', 'Bangkok', 'Thailand', 920],
  ['SIN', 'Changi Airport', 'Singapore', 'Singapore', 980], ['BOM', 'Chhatrapati Shivaji Airport', 'Mumbai', 'India', 360],
  ['DEL', 'Indira Gandhi Airport', 'New Delhi', 'India', 390], ['KTM', 'Tribhuvan International', 'Kathmandu', 'Nepal', 410],
  ['BJS', 'Beijing Capital Airport', 'Beijing', 'China', 1050], ['PEK', 'Capital International', 'Beijing', 'China', 1050],
  ['HKG', 'Hong Kong International', 'Hong Kong', 'Hong Kong', 1120], ['NRT', 'Narita International', 'Tokyo', 'Japan', 1450],
  ['ICN', 'Incheon International', 'Seoul', 'South Korea', 1400], ['SYD', 'Sydney Kingsford Smith', 'Sydney', 'Australia', 1850],
  ['JFK', 'John F Kennedy International', 'New York', 'United States', 1650], ['IAD', 'Dulles International', 'Washington', 'United States', 1680],
  ['CDG', 'Charles de Gaulle Airport', 'Paris', 'France', 1420], ['FCO', 'Leonardo da Vinci Airport', 'Rome', 'Italy', 1380],
  ['FRA', 'Frankfurt Airport', 'Frankfurt', 'Germany', 1320], ['AMS', 'Schiphol Airport', 'Amsterdam', 'Netherlands', 1370],
  ['MAN', 'Manchester Airport', 'Manchester', 'United Kingdom', 1400], ['JNB', 'OR Tambo International', 'Johannesburg', 'South Africa', 1450],
  ['CAI', 'Cairo International', 'Cairo', 'Egypt', 680], ['BOS', 'Logan International', 'Boston', 'United States', 1700]
];

export async function ensureDemoData() {
  const demoPassword = await bcrypt.hash('password', 10);
  await User.findOneAndUpdate(
    { email: 'admin@skypakistan.test' },
    { email: 'admin@skypakistan.test', password: demoPassword, role: Role.ADMIN, name: 'Demo Admin', verified: true },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  const aircraft = await Aircraft.findOneAndUpdate({ registration: 'AP-BACK' }, { model: 'Airbus A320', registration: 'AP-BACK', capacity: 180, seatLayout: {} }, { upsert: true, new: true, setDefaultsOnInsert: true });
  await Promise.all([
    { code: 'ECON', name: 'Economy', baseMultiplier: 1, baggageKg: 20 },
    { code: 'PE', name: 'Premium Economy', baseMultiplier: 1.5, baggageKg: 25 },
    { code: 'BUS', name: 'Business', baseMultiplier: 2.5, baggageKg: 30 }
  ].map((fare) => FareClass.findOneAndUpdate({ code: fare.code }, fare, { upsert: true, new: true, setDefaultsOnInsert: true })));

  await Promise.all([...origins, ...destinations.map(([iata, name, city, country]) => [iata, name, city, country])].map(([iata, name, city, country]) => Airport.findOneAndUpdate({ iata }, { iata, name, city, country }, { upsert: true, new: true, setDefaultsOnInsert: true })));

  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const flightOperations: any[] = [];
  for (let day = 0; day < 14; day += 1) {
    const departureDate = new Date(start);
    departureDate.setDate(start.getDate() + day);
    for (const [originIndex, origin] of origins.entries()) {
      for (const [destinationIndex, destination] of destinations.entries()) {
        const [originCode] = origin;
        const [destinationCode, , , , basePrice] = destination;
        const departure = new Date(departureDate);
        departure.setHours(7 + ((originIndex + destinationIndex) % 12), 0, 0, 0);
        const flightNumber = `SKP${100 + originIndex * 100 + destinationIndex}`;
        flightOperations.push({ updateOne: {
          filter: { flightNumber, departure },
          update: { flightNumber, origin: originCode, destination: destinationCode, departure, arrival: new Date(departure.getTime() + 3 * 60 * 60 * 1000), aircraft: aircraft._id, totalCapacity: 180, basePrice },
          upsert: true
        } });
      }
    }
    }
  if (flightOperations.length) await Flight.bulkWrite(flightOperations, { ordered: false });
  }
