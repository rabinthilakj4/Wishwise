import { PrismaClient, Priority, ProductStatus } from '@prisma/client';

const prisma = new PrismaClient();

export async function processAiAssistantChat(userId: string, prompt: string, budgetInput?: number) {
  // Fetch user wishlists and items
  const wishlists = await prisma.wishlist.findMany({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            include: {
              category: true,
              priceHistory: {
                orderBy: { createdAt: 'desc' },
                take: 3,
              }
            }
          }
        }
      }
    }
  });

  const allItems = wishlists.flatMap(w => w.items);

  // Parse potential budget from prompt if not explicitly passed
  let budget = budgetInput;
  if (!budget) {
    const budgetMatch = prompt.match(/(?:budget|have|spend|around|₹|\$)\s*:?\s*₹?\s*([\d,]+)/i);
    if (budgetMatch && budgetMatch[1]) {
      budget = parseInt(budgetMatch[1].replace(/,/g, ''), 10);
    }
  }

  const cleanPrompt = prompt.toLowerCase();

  let replyHeading = '';
  let recommendations: any[] = [];
  let detailedExplanation = '';
  let suggestedActions: string[] = [];

  if (cleanPrompt.includes('budget') || cleanPrompt.includes('buy first') || cleanPrompt.includes('recommend') || budget) {
    const effectiveBudget = budget || 50000;
    replyHeading = `🤖 AI Wishlist Assistant Analysis (Budget: ₹${effectiveBudget.toLocaleString('en-IN')})`;

    // Filter available items
    const purchaseCandidates = allItems
      .filter(item => item.product.availabilityStatus === ProductStatus.AVAILABLE || item.product.availabilityStatus === ProductStatus.LOW_STOCK)
      .map(item => {
        const p = item.product;
        let score = 0;
        const reasons: string[] = [];

        if (item.priority === Priority.MUST_BUY) {
          score += 40;
          reasons.push('Assigned as 🔴 Must Buy');
        } else if (item.priority === Priority.HIGH) {
          score += 30;
          reasons.push('Assigned as 🟠 High Priority');
        }

        if (item.targetPrice && p.currentPrice <= item.targetPrice) {
          score += 25;
          reasons.push(`Target price (₹${item.targetPrice.toLocaleString('en-IN')}) reached!`);
        }

        if (p.discount && p.discount > 10) {
          score += 15;
          reasons.push(`Significant discount of ${p.discount.toFixed(1)}%`);
        }

        if (p.availabilityStatus === ProductStatus.LOW_STOCK) {
          score += 20;
          reasons.push(`Low stock alert: Only ${p.stockQuantity} remaining!`);
        }

        return { item, score, reasons, price: p.currentPrice };
      });

    purchaseCandidates.sort((a, b) => b.score - a.score);

    let currentRemaining = effectiveBudget;
    const selected = [];

    for (const cand of purchaseCandidates) {
      if (cand.price <= currentRemaining) {
        selected.push(cand);
        currentRemaining -= cand.price;
      }
    }

    recommendations = selected.map(s => ({
      name: s.item.product.name,
      price: s.item.product.currentPrice,
      priority: s.item.priority,
      reason: s.reasons.join(' • '),
    }));

    if (selected.length > 0) {
      detailedExplanation = `Based on your live wishlist data, price trends, target prices, and priorities, here is your optimal purchase sequence:
${selected.map((s, idx) => `${idx + 1}. **${s.item.product.name}** (₹${s.item.product.currentPrice.toLocaleString('en-IN')}): ${s.reasons.join(', ')}`).join('\n')}

**Total Cost:** ₹${(effectiveBudget - currentRemaining).toLocaleString('en-IN')} | **Remaining Budget:** ₹${currentRemaining.toLocaleString('en-IN')}`;
      suggestedActions = ['Move recommended items to Cart', 'Adjust Budget', 'View Price History'];
    } else {
      detailedExplanation = `Your current budget of ₹${effectiveBudget.toLocaleString('en-IN')} is lower than the price of individual items in your wishlist. Consider setting a target price alert or allocating a slightly higher budget.`;
      suggestedActions = ['Set Target Price Alerts', 'Browse Lower Priced Alternatives'];
    }
  } else if (cleanPrompt.includes('price') || cleanPrompt.includes('discount') || cleanPrompt.includes('deal')) {
    replyHeading = `📉 AI Price Drop & Deal Insights`;
    const discountedItems = allItems.filter(i => i.product.discount && i.product.discount > 0);
    
    if (discountedItems.length > 0) {
      detailedExplanation = `Here are the top discounted items currently in your wishlists:\n` +
        discountedItems.map(i => `• **${i.product.name}**: Now ₹${i.product.currentPrice.toLocaleString('en-IN')} (Original: ₹${i.product.originalPrice.toLocaleString('en-IN')}, Save ${i.product.discount.toFixed(1)}%)`).join('\n');
      suggestedActions = ['Add to Cart', 'View Price History Charts'];
    } else {
      detailedExplanation = `None of your current wishlist items have an active discount. We are monitoring price changes 24/7 and will notify you when price drops occur!`;
      suggestedActions = ['Set Target Prices', 'View Recommendations'];
    }
  } else {
    replyHeading = `💡 WishWise Intelligent Assistance`;
    detailedExplanation = `Hello! I am your WishWise AI Assistant. You currently have **${allItems.length}** saved item(s) across **${wishlists.length}** wishlist(s).
    
I can help you:
1. Optimize purchase orders for any budget ("I have ₹15,000 budget, what should I buy?")
2. Evaluate target price readiness & discount deals
3. Find smart alternatives for out-of-stock items
4. Analyze product specs and priority urgency`;
    suggestedActions = ['Suggest purchases for ₹25,000 budget', 'Show price drop deals', 'Check Wishlist Health'];
  }

  return {
    replyHeading,
    detailedExplanation,
    recommendations,
    suggestedActions,
    totalSavedItemsCount: allItems.length,
    mode: process.env.AI_API_KEY ? 'HYBRID_LLM' : 'RULE_BASED_INTELLIGENCE',
  };
}
