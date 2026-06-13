import { Router } from 'express';
import {
  getMcqs,
  getProgress,
  submitMcqResult,
  updateGoal,
  generatePersonalizedRoadmap,
} from '../controllers/learning.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.get('/mcqs', getMcqs);
router.get('/progress', authenticateToken as any, getProgress as any);
router.post('/mcq/submit', authenticateToken as any, submitMcqResult as any);
router.post('/goal/update', authenticateToken as any, updateGoal as any);
router.post('/roadmap/generate', authenticateToken as any, generatePersonalizedRoadmap as any);

export default router;
