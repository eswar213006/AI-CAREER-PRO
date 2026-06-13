import { Router } from 'express';
import { getStats, getUsers, updateUserRole } from '../controllers/admin.controller';
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

// Apply auth + admin protections to all admin routes
router.use(authenticateToken as any);
router.use(requireAdmin as any);

router.get('/stats', getStats as any);
router.get('/users', getUsers as any);
router.put('/user/role', updateUserRole as any);

export default router;
