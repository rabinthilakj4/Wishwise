import { Router } from 'express';
import {
  getProducts,
  getNewlyLaunchedProducts,
  getProductById,
  compareProducts,
  getSimilarProductsHandler,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/product.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/rbac.middleware';
import { Role } from '@prisma/client';

const router = Router();

router.get('/', getProducts);
router.get('/newly-launched', getNewlyLaunchedProducts);
router.post('/compare', compareProducts);
router.get('/:id', getProductById);
router.get('/:id/similar', getSimilarProductsHandler);

// Admin / Manager product routes
router.post('/', authenticate, authorize([Role.ADMIN, Role.MANAGER]), createProduct);
router.put('/:id', authenticate, authorize([Role.ADMIN, Role.MANAGER]), updateProduct);
router.delete('/:id', authenticate, authorize([Role.ADMIN, Role.MANAGER]), deleteProduct);

export default router;
