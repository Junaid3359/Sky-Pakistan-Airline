import { Request, Response } from 'express';
import { Flight } from '../models/flight.model';
import { FareClass } from '../models/fareclass.model';
import { SeatInventory } from '../models/seatInventory.model';
import { Aircraft } from '../models/aircraft.model';

const demoPrices: Record<string, number> = { DXB: 520, LHR: 1350, IST: 620, KUL: 850, YYZ: 1700, MLE: 700, DOH: 480, JED: 560, RUH: 540, BKK: 920, SIN: 980, BOM: 360, DEL: 390, KTM: 410, BJS: 1050, HKG: 1120, NRT: 1450, ICN: 1400, SYD: 1850, JFK: 1650, IAD: 1680, CDG: 1420, FCO: 1380, FRA: 1320, AMS: 1370, MAN: 1400, JNB: 1450, CAI: 680, BOS: 1700 };

function calculateTaxes(base: number) {
  const tax = Math.round(base * 0.12); // 12% taxes
  const airport = Math.round(base * 0.05); // 5% airport charges
  const service = 50; // flat service fee
  return { tax, airport, service, totalExtras: tax + airport + service };
}

export const searchFlights = async (req: Request, res: Response) => {
  try {
    const { origin, destination, departureDate, passengers = 1, cabin = 'ECON' } = req.query as any;
    if (!origin || !destination || !departureDate) return res.status(400).json({ message: 'origin, destination and departureDate required' });

    const dep = new Date(departureDate);
    const start = new Date(dep);
    start.setHours(0, 0, 0, 0);
    const end = new Date(dep);
    end.setHours(23, 59, 59, 999);

    let flights = await Flight.find({ origin: origin.toUpperCase(), destination: destination.toUpperCase(), departure: { $gte: start, $lte: end } }).populate('aircraft');
    if (!flights.length && demoPrices[destination.toUpperCase()]) {
      const aircraft = await Aircraft.findOneAndUpdate({ registration: 'AP-BACK' }, { model: 'Airbus A320', registration: 'AP-BACK', capacity: 180, seatLayout: {} }, { upsert: true, new: true, setDefaultsOnInsert: true });
      const departure = new Date(start);
      departure.setHours(10, 0, 0, 0);
      const flight = await Flight.findOneAndUpdate(
        { origin: origin.toUpperCase(), destination: destination.toUpperCase(), departure },
        { flightNumber: `SKP-${origin.toUpperCase()}-${destination.toUpperCase()}`, origin: origin.toUpperCase(), destination: destination.toUpperCase(), departure, arrival: new Date(departure.getTime() + 3 * 60 * 60 * 1000), aircraft: aircraft._id, totalCapacity: 180, basePrice: demoPrices[destination.toUpperCase()] },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      flights = [await flight.populate('aircraft')];
    }
    const fareClasses = await FareClass.find();

    const results = flights.map((f) => {
      const basePrice = f.basePrice || 100 + (f.totalCapacity || 100) * 0.5;
      const fares = fareClasses.sort((a, b) => ['ECON', 'PE', 'BUS'].indexOf(a.code) - ['ECON', 'PE', 'BUS'].indexOf(b.code)).map((fc) => {
        const base = Math.round(basePrice * fc.baseMultiplier);
        const taxes = calculateTaxes(base);
        const totalPerPassenger = base + taxes.totalExtras;
        return { code: fc.code, name: fc.name, base, taxes, totalPerPassenger, baggageKg: fc.baggageKg };
      });
      return {
        id: f._id,
        flightNumber: f.flightNumber,
        origin: f.origin,
        destination: f.destination,
        departure: f.departure,
        arrival: f.arrival,
        aircraft: f.aircraft,
        status: f.status,
        totalCapacity: f.totalCapacity,
        fares
      };
    });

    res.json({ results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Search failed' });
  }
};

export const getFlightDetails = async (req: Request, res: Response) => {
  try {
    const f = await Flight.findById(req.params.id).populate('aircraft');
    if (!f) return res.status(404).json({ message: 'Flight not found' });
    let seats = await SeatInventory.find({ flight: f._id }).sort({ seatNumber: 1 });
    if (seats.length === 0) {
      const newSeats: any[] = [];
      for (let row = 1; row <= 30; row += 1) for (const column of ['A', 'B', 'C', 'D', 'E', 'F']) {
        const cabin = row <= 3 ? 'BUS' : row <= 8 ? 'PE' : 'ECON';
        newSeats.push({ flight: f._id, seatNumber: `${row}${column}`, cabin, fareCode: cabin });
      }
      await SeatInventory.insertMany(newSeats);
      seats = await SeatInventory.find({ flight: f._id }).sort({ seatNumber: 1 });
    }
    // attach fare summary
    const fareClasses = await FareClass.find();
    const basePrice = f.basePrice || 100 + (f.totalCapacity || 100) * 0.5;
    const fares = fareClasses.sort((a, b) => ['ECON', 'PE', 'BUS'].indexOf(a.code) - ['ECON', 'PE', 'BUS'].indexOf(b.code)).map((fc) => {
      const base = Math.round(basePrice * fc.baseMultiplier);
      const taxes = calculateTaxes(base);
      return { code: fc.code, name: fc.name, base, taxes, totalPerPassenger: base + taxes.totalExtras };
    });
    res.json({
      flight: f,
      fares,
      seatMap: seats.map((seat) => ({
        id: seat.seatNumber,
        label: seat.seatNumber,
        status: seat.status === 'AVAILABLE' ? 'AVAILABLE' : 'OCCUPIED'
      }))
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get flight details' });
  }
};
