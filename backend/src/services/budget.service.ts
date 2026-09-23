import { Priority, ProductStatus } from '@prisma/client';

export interface BudgetPlanItem {
  wishlistItemId: string;
  productId: string;
  name: string;
  brand: string;
  currentPrice: number;
  priority: Priority;
  targetPrice: number | null;
  targetReached: boolean;
  stockStatus: ProductStatus;
  urgencyScore: number;
  recommendationReason: string;
  selectedForBudget: boolean;
}

export interface BudgetPlanResult {
  monthlyBudget: number;
  totalWishlistValue: number;
  budgetDifference: number; // positive = under budget, negative = over budget
  affordableItemsCount: number;
  suggestedItems: BudgetPlanItem[];
  unaffordableItems: BudgetPlanItem[];
  summaryMessage: string;
}

const priorityWeight: Record<Priority, number> = {
  MUST_BUY: 40,
  HIGH: 30,
  MEDIUM: 20,
  LOW: 10,
};

export function calculateBudgetPlan(items: any[], monthlyBudget: number): BudgetPlanResult {
  let totalWishlistValue = 0;

  const analyzedItems: BudgetPlanItem[] = items.map((item) => {
    const p = item.product;
    const price = p.currentPrice;
    totalWishlistValue += price;

    let score = priorityWeight[item.priority as Priority] || 20;
    const reasons: string[] = [];

    reasons.push(`${item.priority.replace('_', ' ')} priority`);

    // Target price bonus
    const targetReached = !!(item.targetPrice && price <= item.targetPrice);
    if (targetReached) {
      score += 25;
      reasons.push('Target price reached 🎯');
    }

    // Stock urgency
    if (p.availabilityStatus === ProductStatus.LOW_STOCK) {
      score += 20;
      reasons.push('Only few units left in stock ⚠️');
    }

    // Discount bonus
    if (p.discount && p.discount > 10) {
      score += Math.min(15, p.discount);
      reasons.push(`${p.discount.toFixed(1)}% discount`);
    }

    return {
      wishlistItemId: item.id,
      productId: p.id,
      name: p.name,
      brand: p.brand,
      currentPrice: price,
      priority: item.priority,
      targetPrice: item.targetPrice,
      targetReached,
      stockStatus: p.availabilityStatus,
      urgencyScore: score,
      recommendationReason: reasons.join(' • '),
      selectedForBudget: false,
    };
  });

  // Sort descending by urgency score
  analyzedItems.sort((a, b) => b.urgencyScore - a.urgencyScore);

  let remaining = monthlyBudget;
  const suggestedItems: BudgetPlanItem[] = [];
  const unaffordableItems: BudgetPlanItem[] = [];

  for (const item of analyzedItems) {
    if (item.stockStatus === ProductStatus.OUT_OF_STOCK || item.stockStatus === ProductStatus.DISCONTINUED) {
      unaffordableItems.push(item);
      continue;
    }

    if (item.currentPrice <= remaining) {
      item.selectedForBudget = true;
      suggestedItems.push(item);
      remaining -= item.currentPrice;
    } else {
      unaffordableItems.push(item);
    }
  }

  const budgetDifference = monthlyBudget - totalWishlistValue;

  let summaryMessage = '';
  if (budgetDifference >= 0) {
    summaryMessage = `Great news! Your monthly budget of ₹${monthlyBudget.toLocaleString('en-IN')} fully covers all ${items.length} items in your wishlist with ₹${budgetDifference.toLocaleString('en-IN')} remaining.`;
  } else {
    summaryMessage = `Your wishlist total (₹${totalWishlistValue.toLocaleString('en-IN')}) exceeds your monthly budget by ₹${Math.abs(budgetDifference).toLocaleString('en-IN')}. We selected ${suggestedItems.length} top-priority item(s) fitting your budget.`;
  }

  return {
    monthlyBudget,
    totalWishlistValue,
    budgetDifference,
    affordableItemsCount: suggestedItems.length,
    suggestedItems,
    unaffordableItems,
    summaryMessage,
  };
}
