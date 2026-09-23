import { Router } from 'express';
import {
  getAdminDashboardStats,
  getAdminUsers,
  updateUserRole,
  getDemandReportHandler,
  getAuditLogs
} from '../controllers/admin.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/rbac.middleware';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);
router.use(authorize([Role.ADMIN, Role.MANAGER]));

router.get('/dashboard', getAdminDashboardStats);
router.get('/users', authorize([Role.ADMIN]), getAdminUsers);
router.put('/users/:id/role', authorize([Role.ADMIN]), updateUserRole);
router.get('/demand', getDemandReportHandler);
router.get('/audit-logs', authorize([Role.ADMIN]), getAuditLogs);

export default router;
