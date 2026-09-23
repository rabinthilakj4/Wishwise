import { Response } from 'express';
import { PrismaClient, Priority, Visibility, MemberPermission, ProductStatus } from '@prisma/client';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { calculateWishlistHealth } from '../services/healthScore.service';

const prisma = new PrismaClient();

export const getUserWishlists = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);
    const userId = req.user.userId;

    const wishlists = await prisma.wishlist.findMany({
      where: {
        OR: [
          { userId },
          { members: { some: { userId } } }
        ]
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true,
                subcategory: true,
                images: true,
                priceHistory: {
                  orderBy: { createdAt: 'desc' },
                  take: 5,
                }
              }
            },
            variant: true,
          },
          orderBy: { addedAt: 'desc' }
        },
        members: {
          include: {
            user: { select: { id: true, name: true, email: true, avatar: true } }
          }
        },
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: {
          select: { items: true }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    // Attach computed Health Score for each wishlist
    const formatted = wishlists.map(w => {
      const health = calculateWishlistHealth(w.items);
      return {
        ...w,
        healthScore: health,
      };
    });

    return sendSuccess(res, formatted, 'Wishlists fetched successfully');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to fetch wishlists', 500);
  }
};

export const getWishlistById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const wishlist = await prisma.wishlist.findFirst({
      where: {
        OR: [
          { id },
          { shareToken: id }
        ]
      },
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
        items: {
          include: {
            product: {
              include: {
                category: true,
                subcategory: true,
                images: true,
                priceHistory: {
                  orderBy: { createdAt: 'asc' },
                }
              }
            },
            variant: true,
          },
          orderBy: { addedAt: 'desc' }
        },
        members: {
          include: {
            user: { select: { id: true, name: true, email: true, avatar: true } }
          }
        },
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        }
      }
    });

    if (!wishlist) return sendError(res, 'Wishlist not found', 404);

    const healthScore = calculateWishlistHealth(wishlist.items);

    return sendSuccess(res, { ...wishlist, healthScore }, 'Wishlist retrieved');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to get wishlist', 500);
  }
};

export const createWishlist = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);
    const { name, description, visibility } = req.body;

    if (!name) return sendError(res, 'Wishlist name is required', 400);

    const shareToken = visibility !== Visibility.PRIVATE ? `wl-${Date.now()}-${Math.floor(Math.random()*1000)}` : null;

    const wishlist = await prisma.wishlist.create({
      data: {
        userId: req.user.userId,
        name,
        description,
        visibility: visibility || Visibility.PRIVATE,
        shareToken,
        activities: {
          create: {
            userId: req.user.userId,
            action: 'WISHLIST_CREATED',
            details: `Created wishlist "${name}"`,
          }
        }
      }
    });

    return sendSuccess(res, wishlist, 'Wishlist created successfully', 201);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to create wishlist', 500);
  }
};

export const updateWishlist = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, visibility } = req.body;

    const shareToken = visibility && visibility !== Visibility.PRIVATE ? `wl-${Date.now()}-${Math.floor(Math.random()*1000)}` : undefined;

    const updated = await prisma.wishlist.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(visibility && { visibility, shareToken }),
      }
    });

    return sendSuccess(res, updated, 'Wishlist updated');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to update wishlist', 500);
  }
};

export const deleteWishlist = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.wishlist.delete({ where: { id } });
    return sendSuccess(res, null, 'Wishlist deleted');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to delete wishlist', 500);
  }
};

// Wishlist Items CRUD & Actions
export const addItemToWishlist = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);
    const { wishlistId, productId, variantId, selectedVariant, priority = Priority.MEDIUM, notes, targetPrice } = req.body;

    if (!productId) return sendError(res, 'ProductId is required', 400);

    // Default to user's first wishlist if wishlistId not provided
    let targetWishlistId = wishlistId;
    if (!targetWishlistId) {
      const defaultList = await prisma.wishlist.findFirst({
        where: { userId: req.user.userId },
        orderBy: { createdAt: 'asc' }
      });
      if (defaultList) {
        targetWishlistId = defaultList.id;
      } else {
        const newList = await prisma.wishlist.create({
          data: {
            userId: req.user.userId,
            name: 'My Wishlist ❤️',
          }
        });
        targetWishlistId = newList.id;
      }
    }

    // Check duplicate (same product and variant)
    const existing = await prisma.wishlistItem.findFirst({
      where: {
        wishlistId: targetWishlistId,
        productId,
        variantId: variantId || null,
      }
    });

    if (existing) {
      return sendError(res, 'This product variant already exists in your wishlist.', 409);
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return sendError(res, 'Product not found', 404);

    let variant = null;
    if (variantId) {
      variant = await prisma.productVariant.findUnique({ where: { id: variantId } });
    }

    const item = await prisma.wishlistItem.create({
      data: {
        wishlistId: targetWishlistId,
        productId,
        variantId: variantId || null,
        selectedVariant: selectedVariant || (variant ? variant.attributes : null),
        priority: priority as Priority,
        notes,
        targetPrice: targetPrice ? parseFloat(targetPrice) : null,
      },
      include: {
        product: { include: { category: true, images: true } },
        variant: true,
      }
    });

    // Record Activity
    await prisma.wishlistActivity.create({
      data: {
        wishlistId: targetWishlistId,
        userId: req.user.userId,
        action: 'ITEM_ADDED',
        details: `Added ${product.name}${variant ? ` (${variant.name})` : ''} to wishlist`,
      }
    });

    return sendSuccess(res, item, 'Product added to wishlist', 201);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to add item to wishlist', 500);
  }
};

export const updateWishlistItem = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { priority, notes, targetPrice, archivedAt } = req.body;

    const updated = await prisma.wishlistItem.update({
      where: { id },
      data: {
        ...(priority && { priority: priority as Priority }),
        ...(notes !== undefined && { notes }),
        ...(targetPrice !== undefined && { targetPrice: targetPrice ? parseFloat(targetPrice) : null }),
        ...(archivedAt !== undefined && { archivedAt: archivedAt ? new Date(archivedAt) : null }),
      },
      include: { product: true }
    });

    return sendSuccess(res, updated, 'Wishlist item updated');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to update item', 500);
  }
};

export const removeItemFromWishlist = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.wishlistItem.delete({ where: { id } });
    return sendSuccess(res, null, 'Item removed from wishlist');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to remove item', 500);
  }
};

export const togglePlanningToBuy = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);
    const { id } = req.params;

    const item = await prisma.wishlistItem.findUnique({
      where: { id },
      include: { product: true, wishlist: true }
    });
    if (!item) return sendError(res, 'Wishlist item not found', 404);

    const isCurrentlyPlanning = item.planningToBuyUserId === req.user.userId;

    const updated = await prisma.wishlistItem.update({
      where: { id },
      data: {
        planningToBuyUserId: isCurrentlyPlanning ? null : req.user.userId,
        planningToBuyName: isCurrentlyPlanning ? null : req.user.email.split('@')[0],
      }
    });

    // Record activity
    await prisma.wishlistActivity.create({
      data: {
        wishlistId: item.wishlistId,
        userId: req.user.userId,
        action: isCurrentlyPlanning ? 'CANCELLED_BUY_PLAN' : 'MARKED_PLANNING_TO_BUY',
        details: isCurrentlyPlanning
          ? `Cancelled purchase plan for ${item.product.name}`
          : `Marked planning to buy ${item.product.name} (Duplicate Gift Prevention)`,
      }
    });

    return sendSuccess(res, updated, isCurrentlyPlanning ? 'Purchase plan cleared' : 'Marked as planning to buy');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to toggle purchase plan', 500);
  }
};

export const moveItemToCart = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);
    const { id } = req.params; // WishlistItem ID
    const { removeFromWishlist = false } = req.body;

    const wishlistItem = await prisma.wishlistItem.findUnique({
      where: { id },
      include: { product: true, variant: true }
    });

    if (!wishlistItem) return sendError(res, 'Wishlist item not found', 404);
    const product = wishlistItem.product;

    if (product.availabilityStatus === ProductStatus.OUT_OF_STOCK || product.availabilityStatus === ProductStatus.DISCONTINUED) {
      return sendError(res, 'Product is currently unavailable and cannot be moved to cart.', 400);
    }

    if (product.stockQuantity < 1) {
      return sendError(res, 'Product is out of stock.', 400);
    }

    // Get or create user Cart
    let cart = await prisma.cart.findUnique({ where: { userId: req.user.userId } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId: req.user.userId } });
    }

    // Check existing cart item for same product & variant
    const existingCartItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: product.id,
        variantId: wishlistItem.variantId || null,
      }
    });

    let cartItem;
    if (existingCartItem) {
      cartItem = await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: { increment: 1 } },
        include: { product: { include: { images: true } }, variant: true }
      });
    } else {
      cartItem = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: product.id,
          variantId: wishlistItem.variantId || null,
          selectedVariant: (wishlistItem.selectedVariant as any) || (wishlistItem.variant ? (wishlistItem.variant.attributes as any) : null),
          quantity: 1,
          priceSnapshot: wishlistItem.variant ? wishlistItem.variant.price : product.currentPrice,
        },
        include: { product: { include: { images: true } }, variant: true }
      });
    }

    if (removeFromWishlist) {
      await prisma.wishlistItem.delete({ where: { id } });
    }

    return sendSuccess(res, cartItem, `Moved ${product.name} to Cart successfully`);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to move item to cart', 500);
  }
};

export const addWishlistMember = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params; // wishlistId
    const { email, permission = MemberPermission.VIEW } = req.body;

    const targetUser = await prisma.user.findUnique({ where: { email } });
    if (!targetUser) return sendError(res, 'User with specified email not found', 404);

    const member = await prisma.wishlistMember.create({
      data: {
        wishlistId: id,
        userId: targetUser.id,
        permission: permission as MemberPermission,
      },
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } }
      }
    });

    return sendSuccess(res, member, 'Member invited to collaborative wishlist');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to add member', 500);
  }
};
