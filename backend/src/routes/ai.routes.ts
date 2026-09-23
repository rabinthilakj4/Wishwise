import { Router } from 'express';
import { handleAiChat } from '../controllers/ai.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/chat', authenticate, handleAiChat);

export default router;
