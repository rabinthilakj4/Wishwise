import { Request, Response } from 'express';
import { PrismaClient, Role } from '@prisma/client';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { getDemandIntelligence } from '../services/demand.service';

const prisma = new PrismaClient();

export const getAdminDashboardStats = async (req: Request, res: Response) => {
  try {
    const [
      totalUsers,
      totalProducts,
      totalWishlists,
      totalWishlistItems,
      totalOrders,
      orderRevenue,
      mostWishlisted,
      lowStockProducts,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.product.count(),
      prisma.wishlist.count(),
      prisma.wishlistItem.count(),
      prisma.order.count(),
      prisma.order.aggregate({ _sum: { totalAmount: true } }),
      prisma.product.findMany({
        take: 5,
        orderBy: { wishlistItems: { _count: 'desc' } },
        include: {
          category: true,
          _count: { select: { wishlistItems: true, cartItems: true } }
        }
      }),
      prisma.product.findMany({
        where: { stockQuantity: { lte: 5 } },
        take: 5,
        include: { category: true, _count: { select: { wishlistItems: true } } }
      })
    ]);

    // Conversion rate: (Cart Items or Orders created from Wishlist) / Wishlist Items
    const cartCount = await prisma.cartItem.count();
    const conversionRate = totalWishlistItems > 0 ? ((cartCount / totalWishlistItems) * 100).toFixed(1) : '0.0';

    return sendSuccess(res, {
      kpi: {
        totalUsers,
        totalProducts,
        totalWishlists,
        totalWishlistItems,
        totalOrders,
        totalRevenue: orderRevenue._sum.totalAmount || 0,
        conversionRate: `${conversionRate}%`,
      },
      mostWishlisted,
      lowStockProducts,
    }, 'Admin dashboard metrics retrieved');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to fetch admin stats', 500);
  }
};

export const getAdminUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        lastLoginAt: true,
        _count: {
          select: { wishlists: true, orders: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return sendSuccess(res, users, 'Admin user list retrieved');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to fetch users', 500);
  }
};

export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { role, status } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(role && { role: role as Role }),
        ...(status && { status }),
      },
      select: { id: true, name: true, email: true, role: true, status: true }
    });

    return sendSuccess(res, user, 'User role/status updated');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to update user', 500);
  }
};

export const getDemandReportHandler = async (req: Request, res: Response) => {
  try {
    const demandReport = await getDemandIntelligence();
    return sendSuccess(res, demandReport, 'Demand intelligence report generated');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to fetch demand report', 500);
  }
};

export const getAuditLogs = async (req: Request, res: Response) => {
  try {
    const logs = await prisma.auditLog.findMany({
      include: {
        actor: { select: { id: true, name: true, email: true, role: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return sendSuccess(res, logs, 'Audit logs fetched');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to fetch audit logs', 500);
  }
};
