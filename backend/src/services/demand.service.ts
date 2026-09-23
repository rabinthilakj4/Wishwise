import { PrismaClient, ProductStatus } from '@prisma/client';

const prisma = new PrismaClient();

export async function getDemandIntelligence() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const products = await prisma.product.findMany({
    include: {
      category: true,
      wishlistItems: {
        select: {
          addedAt: true,
        },
      },
      cartItems: true,
      orderItems: true,
    },
  });

  const demandReport = products.map((p) => {
    const totalWishlistSaves = p.wishlistItems.length;
    const recentSaves = p.wishlistItems.filter((i) => i.addedAt >= thirtyDaysAgo).length;
    const totalCartAdds = p.cartItems.reduce((acc, item) => acc + item.quantity, 0);
    const totalOrders = p.orderItems.reduce((acc, item) => acc + item.quantity, 0);

    // Calculate Demand Score formula:
    // Demand Score = (totalWishlistSaves * 2) + (recentSaves * 4) + (totalCartAdds * 3) + (totalOrders * 5)
    const demandScore = (totalWishlistSaves * 2) + (recentSaves * 4) + (totalCartAdds * 3) + (totalOrders * 5);

    let demandStatus: 'CRITICAL_RESTOCK' | 'HIGH_DEMAND' | 'MODERATE' | 'LOW' = 'LOW';
    let riskFlag = false;

    if (totalWishlistSaves > 0 && p.stockQuantity <= p.lowStockThreshold) {
      demandStatus = 'CRITICAL_RESTOCK';
      riskFlag = true;
    } else if (demandScore >= 15) {
      demandStatus = 'HIGH_DEMAND';
    } else if (demandScore >= 5) {
      demandStatus = 'MODERATE';
    }

    return {
      productId: p.id,
      sku: p.sku,
      name: p.name,
      brand: p.brand,
      categoryName: p.category.name,
      currentPrice: p.currentPrice,
      stockQuantity: p.stockQuantity,
      lowStockThreshold: p.lowStockThreshold,
      availabilityStatus: p.availabilityStatus,
      wishlistSaves: totalWishlistSaves,
      recentSaves30d: recentSaves,
      cartAdditions: totalCartAdds,
      ordersCount: totalOrders,
      demandScore,
      demandStatus,
      riskFlag,
    };
  });

  demandReport.sort((a, b) => {
    if (a.riskFlag && !b.riskFlag) return -1;
    if (!a.riskFlag && b.riskFlag) return 1;
    return b.demandScore - a.demandScore;
  });

  return demandReport;
}
