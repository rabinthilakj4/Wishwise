import { Router } from 'express';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../controllers/category.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/rbac.middleware';
import { Role } from '@prisma/client';

const router = Router();

router.get('/', getCategories);
router.post('/', authenticate, authorize([Role.ADMIN, Role.MANAGER]), createCategory);
router.put('/:id', authenticate, authorize([Role.ADMIN, Role.MANAGER]), updateCategory);
router.delete('/:id', authenticate, authorize([Role.ADMIN, Role.MANAGER]), deleteCategory);

export default router;
