import { Router } from 'express';
import {
  getUserWishlists,
  getWishlistById,
  createWishlist,
  updateWishlist,
  deleteWishlist,
  addItemToWishlist,
  updateWishlistItem,
  removeItemFromWishlist,
  togglePlanningToBuy,
  moveItemToCart,
  addWishlistMember,
} from '../controllers/wishlist.controller';
import { authenticate, optionalAuthenticate } from '../middleware/auth.middleware';

const router = Router();

// Wishlists CRUD
router.get('/', authenticate, getUserWishlists);
router.post('/', authenticate, createWishlist);
router.get('/:id', optionalAuthenticate, getWishlistById);
router.put('/:id', authenticate, updateWishlist);
router.delete('/:id', authenticate, deleteWishlist);

// Items CRUD & Actions
router.post('/items', authenticate, addItemToWishlist);
router.put('/items/:id', authenticate, updateWishlistItem);
router.delete('/items/:id', authenticate, removeItemFromWishlist);
router.post('/items/:id/toggle-planning-buy', authenticate, togglePlanningToBuy);
router.post('/items/:id/move-to-cart', authenticate, moveItemToCart);

// Collaboration & Members
router.post('/:id/members', authenticate, addWishlistMember);

export default router;
