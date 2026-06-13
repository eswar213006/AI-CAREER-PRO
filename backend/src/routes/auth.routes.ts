import { Router } from 'express';
import {
  register,
  login,
  refresh,
  logout,
  getProfile,
  updateProfile,
  forgotPassword,
  resetPassword,
  verifyEmail,
} from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Email verification (GET link from email)
router.get('/verify-email', verifyEmail as any);

// Protected profile routes
router.get('/profile', authenticateToken as any, getProfile as any);
router.put('/profile', authenticateToken as any, updateProfile as any);

export default router;
