import { Request, Response } from 'express';
import { Aircraft } from '../../models/aircraft.model';

export const listAircraft = async (req: Request, res: Response) => {
  try {
    const list = await Aircraft.find().limit(200);
    res.json({ aircraft: list });
  } catch (err) {
    res.status(500).json({ message: 'Failed to list aircraft' });
  }
};

export const createAircraft = async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    const existing = await Aircraft.findOne({ registration: payload.registration });
    if (existing) return res.status(409).json({ message: 'Registration exists' });
    const aircraft = new Aircraft(payload);
    await aircraft.save();
    res.json({ aircraft });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create aircraft' });
  }
};

export const getAircraft = async (req: Request, res: Response) => {
  try {
    const a = await Aircraft.findById(req.params.id);
    if (!a) return res.status(404).json({ message: 'Aircraft not found' });
    res.json({ aircraft: a });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get aircraft' });
  }
};

export const updateAircraft = async (req: Request, res: Response) => {
  try {
    const a = await Aircraft.findById(req.params.id);
    if (!a) return res.status(404).json({ message: 'Aircraft not found' });
    Object.assign(a, req.body);
    await a.save();
    res.json({ aircraft: a });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update aircraft' });
  }
};

export const deleteAircraft = async (req: Request, res: Response) => {
  try {
    await Aircraft.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete aircraft' });
  }
};
