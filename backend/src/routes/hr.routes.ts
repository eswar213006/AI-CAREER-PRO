import { Router } from 'express';
import hrRouter from '../controllers/hr.controller';

const router = Router();
router.use('/', hrRouter);
export default router;
