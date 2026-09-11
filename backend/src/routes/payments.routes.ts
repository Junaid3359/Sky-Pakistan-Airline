import { Router } from 'express';
import { createPayment, verifyPayment, getPayment } from '../controllers/payments.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.post('/create', requireAuth, createPayment);
router.post('/verify', requireAuth, verifyPayment);
router.get('/:paymentId', requireAuth, getPayment);

export default router;
