import { Router } from 'express';
import { analyzeResume, generateResume } from '../controllers/resume.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';

const router = Router();

router.post('/analyze', authenticateToken as any, upload.single('resume'), analyzeResume as any);
router.post('/generate', authenticateToken as any, generateResume as any);

export default router;
