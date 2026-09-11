import { Request, Response } from 'express';
import { User } from '../models/user.model';

export const listUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find().select('-password').limit(200);
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: 'Failed to list users' });
  }
};

export const getUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get user' });
  }
};

export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const { role } = req.body;
    if (!role) return res.status(400).json({ message: 'Role required' });
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.role = role;
    await user.save();
    res.json({ user: { id: user._id, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update role' });
  }
};
