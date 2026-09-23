import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { calculateBudgetPlan } from '../services/budget.service';

const prisma = new PrismaClient();

export const getBudgetPlan = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);
    const { budgetAmount = '10000', wishlistId } = req.query;

    const monthlyBudget = parseFloat(budgetAmount as string) || 10000;

    const whereClause: any = { userId: req.user.userId };
    if (wishlistId) whereClause.id = wishlistId as string;

    const wishlists = await prisma.wishlist.findMany({
      where: whereClause,
      include: {
        items: {
          include: {
            product: { include: { category: true } }
          }
        }
      }
    });

    const allItems = wishlists.flatMap(w => w.items);
    const plan = calculateBudgetPlan(allItems, monthlyBudget);

    return sendSuccess(res, plan, 'Budget plan generated');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to generate budget plan', 500);
  }
};
