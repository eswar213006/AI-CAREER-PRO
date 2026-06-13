import { Router } from 'express';
import {
  generateInterview,
  submitAnswer,
  completeInterview,
  getHistory,
} from '../controllers/interview.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.post('/generate', authenticateToken as any, generateInterview as any);
router.post('/answer', authenticateToken as any, submitAnswer as any);
router.post('/complete', authenticateToken as any, completeInterview as any);
router.get('/history', authenticateToken as any, getHistory as any);

export default router;
