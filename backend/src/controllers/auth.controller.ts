import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model';

const JWT_SECRET = process.env.JWT_SECRET || 'change_me';

function isValidEmail(email?: string) {
  return typeof email === 'string' && email.includes('@') && email.length > 5;
}

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;
    if (!isValidEmail(email) || !password || password.length < 6) return res.status(400).json({ message: 'Invalid email or password too short' });
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ message: 'Email already in use' });
    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ email: email.toLowerCase(), password: hashed, name });
    await user.save();
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!isValidEmail(email) || !password) return res.status(400).json({ message: 'Email and password required' });
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.password as string);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: 'Login failed' });
  }
};

export const me = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const user = await User.findById(userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user' });
  }
};
