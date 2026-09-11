import { Router } from 'express';
import { generateTickets } from '../controllers/tickets.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.post('/generate', requireAuth, generateTickets);

export default router;
