import { Router } from 'express';
import companyRouter from '../controllers/company.controller';

const router = Router();
router.use('/', companyRouter);
export default router;
