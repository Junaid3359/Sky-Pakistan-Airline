import { Router } from 'express';
import { checkIn } from '../controllers/checkin.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.post('/', requireAuth, checkIn);

export default router;
