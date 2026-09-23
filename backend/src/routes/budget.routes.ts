import { Router } from 'express';
import { getBudgetPlan } from '../controllers/budget.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticate, getBudgetPlan);

export default router;
