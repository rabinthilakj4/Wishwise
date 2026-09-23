import { Router } from 'express';
import { getCart, addToCart, updateCartItemQuantity, removeFromCart } from '../controllers/cart.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticate, getCart);
router.post('/items', authenticate, addToCart);
router.put('/items/:id', authenticate, updateCartItemQuantity);
router.delete('/items/:id', authenticate, removeFromCart);

export default router;
