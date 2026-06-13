import { Router } from 'express';
import {
  getProblems,
  runCode,
  submitCode,
  getSubmissions,
} from '../controllers/coding.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.get('/problems', getProblems);
router.post('/run', runCode);
router.post('/submit', authenticateToken as any, submitCode as any);
router.get('/submissions', authenticateToken as any, getSubmissions as any);

export default router;
