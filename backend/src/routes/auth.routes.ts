import { Router } from 'express';
import { register, login, getMe, refresh, uploadProfilePhoto, removeProfilePhoto } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.get('/me', authenticate, getMe);
router.post('/profile-photo', authenticate, uploadProfilePhoto);
router.delete('/profile-photo', authenticate, removeProfilePhoto);

export default router;
