import { Request, Response } from 'express';
import { Flight } from '../../models/flight.model';

export const listFlights = async (req: Request, res: Response) => {
  try {
    const flights = await Flight.find().populate('aircraft').limit(200);
    res.json({ flights });
  } catch (err) {
    res.status(500).json({ message: 'Failed to list flights' });
  }
};

export const createFlight = async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    const flight = new Flight(payload);
    await flight.save();
    res.json({ flight });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create flight' });
  }
};

export const getFlight = async (req: Request, res: Response) => {
  try {
    const f = await Flight.findById(req.params.id).populate('aircraft');
    if (!f) return res.status(404).json({ message: 'Flight not found' });
    res.json({ flight: f });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get flight' });
  }
};

export const updateFlight = async (req: Request, res: Response) => {
  try {
    const f = await Flight.findById(req.params.id);
    if (!f) return res.status(404).json({ message: 'Flight not found' });
    Object.assign(f, req.body);
    await f.save();
    res.json({ flight: f });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update flight' });
  }
};

export const deleteFlight = async (req: Request, res: Response) => {
  try {
    await Flight.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete flight' });
  }
};
