import { Response } from 'express';
import { PrismaClient, ProductStatus } from '@prisma/client';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { sendSuccess, sendError } from '../utils/apiResponse';

const prisma = new PrismaClient();

export const getCart = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);

    let cart = await prisma.cart.findUnique({
      where: { userId: req.user.userId },
      include: {
        items: {
          include: {
            product: {
              include: { category: true, images: true }
            },
            variant: true,
          },
          orderBy: { addedAt: 'desc' }
        }
      }
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: req.user.userId },
        include: {
          items: {
            include: { product: { include: { category: true, images: true } }, variant: true }
          }
        }
      });
    }

    const subtotal = cart.items.reduce((sum, item) => {
      const price = item.variant ? item.variant.price : item.product.currentPrice;
      return sum + (price * item.quantity);
    }, 0);

    return sendSuccess(res, { ...cart, subtotal }, 'Cart retrieved');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to fetch cart', 500);
  }
};

export const addToCart = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);
    const { productId, variantId, selectedVariant, quantity = 1 } = req.body;

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return sendError(res, 'Product not found', 404);

    if (product.availabilityStatus === ProductStatus.OUT_OF_STOCK || product.availabilityStatus === ProductStatus.DISCONTINUED) {
      return sendError(res, 'Product is unavailable', 400);
    }

    let variant = null;
    if (variantId) {
      variant = await prisma.productVariant.findUnique({ where: { id: variantId } });
    }

    let cart = await prisma.cart.findUnique({ where: { userId: req.user.userId } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId: req.user.userId } });
    }

    const existingCartItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId,
        variantId: variantId || null,
      }
    });

    let cartItem;
    const addQty = parseInt(quantity, 10);
    const itemPrice = variant ? variant.price : product.currentPrice;

    if (existingCartItem) {
      cartItem = await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: { increment: addQty } },
        include: { product: { include: { images: true } }, variant: true }
      });
    } else {
      cartItem = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          variantId: variantId || null,
          selectedVariant: selectedVariant || (variant ? variant.attributes : null),
          quantity: addQty,
          priceSnapshot: itemPrice,
        },
        include: { product: { include: { images: true } }, variant: true }
      });
    }

    return sendSuccess(res, cartItem, 'Added to cart', 201);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to add to cart', 500);
  }
};

export const updateCartItemQuantity = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (quantity <= 0) {
      await prisma.cartItem.delete({ where: { id } });
      return sendSuccess(res, null, 'Item removed from cart');
    }

    const updated = await prisma.cartItem.update({
      where: { id },
      data: { quantity: parseInt(quantity, 10) },
      include: { product: true }
    });

    return sendSuccess(res, updated, 'Cart quantity updated');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to update cart', 500);
  }
};

export const removeFromCart = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.cartItem.delete({ where: { id } });
    return sendSuccess(res, null, 'Item removed from cart');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to remove cart item', 500);
  }
};
