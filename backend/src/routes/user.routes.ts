import { Router } from 'express';
import { listUsers, getUser, updateUserRole } from '../controllers/user.controller';
import { requireAuth, requireRole } from '../middleware/auth.middleware';

const router = Router();

router.use(requireAuth);
router.get('/', requireRole('ADMIN'), listUsers);
router.get('/:id', requireRole('ADMIN'), getUser);
router.patch('/:id/role', requireRole('ADMIN'), updateUserRole);

export default router;
