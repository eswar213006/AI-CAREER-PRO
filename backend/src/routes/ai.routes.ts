import { Router } from 'express';
import {
  reviewCode,
  explainCode,
  compareCode,
  analyzeComplexity,
  dryRun,
  getHint,
  generateTestCases,
  startInterview,
  evaluateInterview,
  chat,
  scoreCode,
} from '../controllers/ai.controller';

const router = Router();

router.post('/review', reviewCode);
router.post('/explain', explainCode);
router.post('/compare', compareCode);
router.post('/complexity', analyzeComplexity);
router.post('/dryrun', dryRun);
router.post('/hint', getHint);
router.post('/testcases', generateTestCases);
router.post('/interview', startInterview);
router.post('/interview/evaluate', evaluateInterview);
router.post('/chat', chat);
router.post('/score', scoreCode);

export default router;
