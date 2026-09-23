import { ProductStatus } from '@prisma/client';

export interface HealthScoreResult {
  score: number;
  status: 'Excellent' | 'Healthy' | 'Needs Attention' | 'Action Required';
  breakdown: {
    totalItems: number;
    availableCount: number;
    lowStockCount: number;
    outOfStockCount: number;
    discontinuedCount: number;
    targetPriceReachedCount: number;
    staleCount: number;
  };
  suggestions: string[];
}

export function calculateWishlistHealth(items: any[]): HealthScoreResult {
  if (!items || items.length === 0) {
    return {
      score: 100,
      status: 'Healthy',
      breakdown: {
        totalItems: 0,
        availableCount: 0,
        lowStockCount: 0,
        outOfStockCount: 0,
        discontinuedCount: 0,
        targetPriceReachedCount: 0,
        staleCount: 0,
      },
      suggestions: ['Your wishlist is empty. Add products to start tracking availability and discounts!'],
    };
  }

  let basePoints = 100;
  const total = items.length;

  let availableCount = 0;
  let lowStockCount = 0;
  let outOfStockCount = 0;
  let discontinuedCount = 0;
  let targetPriceReachedCount = 0;
  let staleCount = 0;

  const suggestions: string[] = [];

  for (const item of items) {
    const product = item.product;
    if (!product) continue;

    // Availability status evaluation
    if (product.availabilityStatus === ProductStatus.AVAILABLE) {
      availableCount++;
    } else if (product.availabilityStatus === ProductStatus.LOW_STOCK) {
      lowStockCount++;
      basePoints -= (10 / total);
    } else if (product.availabilityStatus === ProductStatus.OUT_OF_STOCK) {
      outOfStockCount++;
      basePoints -= (20 / total);
    } else if (product.availabilityStatus === ProductStatus.DISCONTINUED || product.availabilityStatus === ProductStatus.REMOVED) {
      discontinuedCount++;
      basePoints -= (30 / total);
    }

    // Target price bonus/status
    if (item.targetPrice && product.currentPrice <= item.targetPrice) {
      targetPriceReachedCount++;
      basePoints += (5 / total);
    }

    // Stale item status
    if (item.isStale) {
      staleCount++;
      basePoints -= (15 / total);
    }
  }

  const score = Math.max(0, Math.min(100, Math.round(basePoints)));

  let status: HealthScoreResult['status'] = 'Healthy';
  if (score >= 85) status = 'Excellent';
  else if (score >= 70) status = 'Healthy';
  else if (score >= 50) status = 'Needs Attention';
  else status = 'Action Required';

  if (discontinuedCount > 0) {
    suggestions.push(`${discontinuedCount} item(s) are discontinued. Check out smart alternative recommendations.`);
  }
  if (outOfStockCount > 0) {
    suggestions.push(`${outOfStockCount} item(s) are currently out of stock. Monitor for restock alerts.`);
  }
  if (staleCount > 0) {
    suggestions.push(`${staleCount} item(s) have been saved for over 90 days without action. Consider reviewing or archiving.`);
  }
  if (targetPriceReachedCount > 0) {
    suggestions.push(`🎯 ${targetPriceReachedCount} item(s) reached your target price! Great time to move them to cart.`);
  }

  return {
    score,
    status,
    breakdown: {
      totalItems: total,
      availableCount,
      lowStockCount,
      outOfStockCount,
      discontinuedCount,
      targetPriceReachedCount,
      staleCount,
    },
    suggestions,
  };
}
