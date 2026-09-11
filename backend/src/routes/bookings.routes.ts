import { Router } from 'express';
import { initiateBooking, confirmBooking, getBooking, verifyBooking } from '../controllers/bookings.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.post('/initiate', requireAuth, initiateBooking);
router.post('/verify', requireAuth, verifyBooking);
router.post('/confirm', requireAuth, confirmBooking);
router.get('/:bookingId', requireAuth, getBooking);

export default router;
