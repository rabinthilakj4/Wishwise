import { PrismaClient, ProductStatus } from '@prisma/client';

const prisma = new PrismaClient();

export async function findSimilarProducts(productId: string, limit = 3) {
  const targetProduct = await prisma.product.findUnique({
    where: { id: productId },
    include: { category: true }
  });

  if (!targetProduct) return [];

  // Find candidate products in the same category or brand, excluding current product
  const candidates = await prisma.product.findMany({
    where: {
      id: { not: productId },
      availabilityStatus: { in: [ProductStatus.AVAILABLE, ProductStatus.LOW_STOCK] },
      OR: [
        { categoryId: targetProduct.categoryId },
        { brand: targetProduct.brand }
      ]
    },
    include: {
      category: true,
      images: true,
    },
    take: 10,
  });

  // Calculate similarity score based on category match, brand match, price proximity, rating
  const scored = candidates.map((cand) => {
    let matchScore = 0;
    const reasons: string[] = [];

    if (cand.categoryId === targetProduct.categoryId) {
      matchScore += 40;
      reasons.push(`Same category (${cand.category.name})`);
    }

    if (cand.brand.toLowerCase() === targetProduct.brand.toLowerCase()) {
      matchScore += 30;
      reasons.push(`Same brand (${cand.brand})`);
    }

    const priceRatio = Math.min(cand.currentPrice, targetProduct.currentPrice) / Math.max(cand.currentPrice, targetProduct.currentPrice);
    matchScore += priceRatio * 20;
    if (priceRatio > 0.8) {
      reasons.push(`Similar price point (₹${cand.currentPrice.toLocaleString('en-IN')})`);
    }

    if (cand.rating >= 4.5) {
      matchScore += 10;
      reasons.push(`Highly rated (${cand.rating}⭐)`);
    }

    return {
      product: cand,
      similarityScore: Math.round(matchScore),
      recommendationReason: reasons.join(' • '),
    };
  });

  scored.sort((a, b) => b.similarityScore - a.similarityScore);
  return scored.slice(0, limit);
}
