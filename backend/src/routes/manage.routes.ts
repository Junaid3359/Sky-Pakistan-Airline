import { Router } from 'express';
import { cancelBooking, modifyBooking, retrieveByPNR } from '../controllers/manage.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.post('/cancel', requireAuth, cancelBooking);
router.post('/modify', requireAuth, modifyBooking);
router.get('/by-pnr', retrieveByPNR);

export default router;
