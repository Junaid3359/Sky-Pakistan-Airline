import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '../models/user.model';

const JWT_SECRET = process.env.JWT_SECRET || 'change_me';

export interface AuthRequest extends Request {
  user?: { id?: string; role?: string };
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ message: 'Authorization required' });
  const parts = auth.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ message: 'Invalid auth format' });
  try {
    const payload = jwt.verify(parts[1], JWT_SECRET) as any;
    req.user = { id: payload.id, role: payload.role };
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

export function requireRole(...requiredRoles: (Role | string)[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ message: 'Authorization required' });
    const userRole = req.user.role as string | undefined;
    if (!userRole) return res.status(403).json({ message: 'Forbidden' });
    // Admin bypass
    if (userRole === Role.ADMIN) return next();
    for (const r of requiredRoles) {
      if (userRole === r) return next();
    }
    return res.status(403).json({ message: 'Forbidden' });
  };
}

export function requireAnyRole(roles: (Role | string)[]) {
  return requireRole(...roles);
}
