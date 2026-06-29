import { Router } from 'express';
import {
  getProblems,
  runCode,
  submitCode,
  getSubmissions,
  getSolution,
} from '../controllers/coding.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.get('/problems', getProblems);
router.post('/run', runCode);
router.post('/submit', authenticateToken as any, submitCode as any);
router.get('/submissions', authenticateToken as any, getSubmissions as any);
router.post('/solution', getSolution);

export default router;
