import { Response } from 'express';
import { PrismaClient, OrderStatus } from '@prisma/client';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { sendSuccess, sendError } from '../utils/apiResponse';

const prisma = new PrismaClient();

export const createOrder = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);
    const { shippingAddress, paymentMethod = 'CARD' } = req.body;

    const cart = await prisma.cart.findUnique({
      where: { userId: req.user.userId },
      include: {
        items: {
          include: { product: true }
        }
      }
    });

    if (!cart || cart.items.length === 0) {
      return sendError(res, 'Cart is empty. Add products before placing an order.', 400);
    }

    const totalAmount = cart.items.reduce((sum, item) => sum + (item.product.currentPrice * item.quantity), 0);
    const orderNumber = `ORD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: req.user.userId,
        totalAmount,
        status: OrderStatus.CONFIRMED,
        shippingAddress: shippingAddress || 'Default Customer Address',
        paymentMethod,
        items: {
          create: cart.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.product.currentPrice,
          }))
        }
      },
      include: {
        items: {
          include: { product: { include: { images: true } } }
        }
      }
    });

    // Clear cart items
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

    // Decrement stock for ordered products
    for (const item of cart.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stockQuantity: { decrement: item.quantity }
        }
      });
    }

    return sendSuccess(res, order, 'Order created successfully', 201);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to place order', 500);
  }
};

export const getUserOrders = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);

    const orders = await prisma.order.findMany({
      where: { userId: req.user.userId },
      include: {
        items: {
          include: { product: { include: { images: true } } }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return sendSuccess(res, orders, 'User orders retrieved');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to fetch orders', 500);
  }
};
