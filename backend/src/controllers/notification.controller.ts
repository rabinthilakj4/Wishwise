import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { sendSuccess, sendError } from '../utils/apiResponse';

const prisma = new PrismaClient();

export const getNotifications = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);

    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const unreadCount = await prisma.notification.count({
      where: { userId: req.user.userId, read: false }
    });

    return sendSuccess(res, { notifications, unreadCount }, 'Notifications retrieved');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to fetch notifications', 500);
  }
};

export const markNotificationRead = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updated = await prisma.notification.update({
      where: { id },
      data: { read: true }
    });
    return sendSuccess(res, updated, 'Notification marked as read');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to update notification', 500);
  }
};

export const markAllNotificationsRead = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);

    await prisma.notification.updateMany({
      where: { userId: req.user.userId, read: false },
      data: { read: true }
    });

    return sendSuccess(res, null, 'All notifications marked as read');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to mark all as read', 500);
  }
};
