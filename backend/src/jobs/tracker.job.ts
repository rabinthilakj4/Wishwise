import { PrismaClient, ProductStatus, NotificationType } from '@prisma/client';
import cron from 'node-cron';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export async function runWishlistMonitoringScan() {
  logger.info('Starting scheduled Wishlist Intelligence Background Scan...');

  try {
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

    // 1. Scan for Stale Items (> 90 days without update)
    const staleItems = await prisma.wishlistItem.findMany({
      where: {
        addedAt: { lte: ninetyDaysAgo },
        isStale: false,
      },
      include: {
        wishlist: true,
        product: true,
      }
    });

    for (const item of staleItems) {
      await prisma.wishlistItem.update({
        where: { id: item.id },
        data: { isStale: true }
      });

      await prisma.notification.create({
        data: {
          userId: item.wishlist.userId,
          type: NotificationType.STALE_WISHLIST,
          title: '🕐 Stale Wishlist Item Review',
          message: `"${item.product.name}" has been in your wishlist for over 90 days. Would you like to keep or archive it?`,
          relatedProductId: item.productId,
          relatedWishlistId: item.wishlistId,
        }
      });
    }

    // 2. Scan Target Prices Reached
    const itemsWithTargetPrice = await prisma.wishlistItem.findMany({
      where: {
        targetPrice: { not: null },
      },
      include: {
        wishlist: true,
        product: true,
      }
    });

    for (const item of itemsWithTargetPrice) {
      if (item.targetPrice && item.product.currentPrice <= item.targetPrice) {
        // Prevent duplicate notification within 24 hours
        const recentNotif = await prisma.notification.findFirst({
          where: {
            userId: item.wishlist.userId,
            relatedProductId: item.productId,
            type: NotificationType.TARGET_PRICE_REACHED,
            createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
          }
        });

        if (!recentNotif) {
          await prisma.notification.create({
            data: {
              userId: item.wishlist.userId,
              type: NotificationType.TARGET_PRICE_REACHED,
              title: '🎯 Target Price Reached!',
              message: `"${item.product.name}" current price (₹${item.product.currentPrice.toLocaleString('en-IN')}) reached your target price of ₹${item.targetPrice.toLocaleString('en-IN')}!`,
              relatedProductId: item.productId,
              relatedWishlistId: item.wishlistId,
            }
          });
        }
      }
    }

    logger.info(`Wishlist scan complete. Evaluated ${staleItems.length} stale item(s) and target price status.`);
  } catch (error) {
    logger.error('Error during wishlist background monitoring scan:', error);
  }
}

export function startBackgroundJobs() {
  // Run every hour in background
  cron.schedule('0 * * * *', () => {
    runWishlistMonitoringScan();
  });
  logger.info('Background cron jobs scheduled (runs hourly).');
}
