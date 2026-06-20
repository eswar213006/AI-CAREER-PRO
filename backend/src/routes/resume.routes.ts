import { Router } from 'express';
import { analyzeResume, generateResume, extractResume } from '../controllers/resume.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';

const router = Router();

// Analyze uploaded PDF against ATS requirements
router.post('/analyze', authenticateToken as any, upload.single('resume'), analyzeResume as any);

// Generate AI resume — optionally accept a PDF to extract candidate name from it
router.post('/generate', authenticateToken as any, upload.single('resume'), generateResume as any);

// Extract raw text from old PDF resume and parse into structured JSON
router.post('/extract', authenticateToken as any, upload.single('resume'), extractResume as any);

export default router;
