import { Request, Response } from 'express';
import { Airport } from '../../models/airport.model';

export const listAirports = async (req: Request, res: Response) => {
  const q = (req.query.q as string) || '';
  try {
    const filter = q ? { $or: [{ name: new RegExp(q, 'i') }, { iata: new RegExp(q, 'i') }, { city: new RegExp(q, 'i') }] } : {};
    const airports = await Airport.find(filter).limit(100);
    res.json({ airports });
  } catch (err) {
    res.status(500).json({ message: 'Failed to list airports' });
  }
};

export const createAirport = async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    const existing = await Airport.findOne({ iata: payload.iata.toUpperCase() });
    if (existing) return res.status(409).json({ message: 'Airport already exists' });
    const airport = new Airport({ ...payload, iata: payload.iata.toUpperCase() });
    await airport.save();
    res.json({ airport });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create airport' });
  }
};

export const getAirport = async (req: Request, res: Response) => {
  try {
    const airport = await Airport.findById(req.params.id);
    if (!airport) return res.status(404).json({ message: 'Airport not found' });
    res.json({ airport });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get airport' });
  }
};

export const updateAirport = async (req: Request, res: Response) => {
  try {
    const airport = await Airport.findById(req.params.id);
    if (!airport) return res.status(404).json({ message: 'Airport not found' });
    Object.assign(airport, req.body);
    await airport.save();
    res.json({ airport });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update airport' });
  }
};

export const deleteAirport = async (req: Request, res: Response) => {
  try {
    await Airport.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete airport' });
  }
};
