import { Request, Response } from 'express';
import { PrismaClient, ProductStatus } from '@prisma/client';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { findSimilarProducts } from '../services/recommendation.service';

const prisma = new PrismaClient();

export const getProducts = async (req: Request, res: Response) => {
  try {
    const {
      search,
      category,
      subcategory,
      brand,
      minPrice,
      maxPrice,
      availability,
      minRating,
      sort = 'newest',
      page = '1',
      limit = '12',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.max(1, parseInt(limit as string, 10));
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (search) {
      const s = (search as string).trim();
      where.OR = [
        { name: { contains: s, mode: 'insensitive' } },
        { brand: { contains: s, mode: 'insensitive' } },
        { description: { contains: s, mode: 'insensitive' } },
        { tags: { has: s.toLowerCase() } },
      ];
    }

    if (category) {
      where.OR = [
        { categoryId: category as string },
        { category: { slug: category as string } }
      ];
    }

    if (subcategory) {
      where.OR = [
        { subcategoryId: subcategory as string },
        { subcategory: { slug: subcategory as string } }
      ];
    }

    if (brand) {
      where.brand = { equals: brand as string, mode: 'insensitive' };
    }

    if (minPrice || maxPrice) {
      where.currentPrice = {};
      if (minPrice) where.currentPrice.gte = parseFloat(minPrice as string);
      if (maxPrice) where.currentPrice.lte = parseFloat(maxPrice as string);
    }

    if (availability) {
      where.availabilityStatus = availability as ProductStatus;
    }

    if (minRating) {
      where.rating = { gte: parseFloat(minRating as string) };
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'price_low') orderBy = { currentPrice: 'asc' };
    else if (sort === 'price_high') orderBy = { currentPrice: 'desc' };
    else if (sort === 'rating') orderBy = { rating: 'desc' };
    else if (sort === 'discount') orderBy = { discount: 'desc' };
    else if (sort === 'popular') orderBy = { reviewCount: 'desc' };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          subcategory: true,
          variants: true,
          images: { orderBy: { sortOrder: 'asc' } },
          priceHistory: {
            orderBy: { createdAt: 'desc' },
            take: 5,
          },
          _count: {
            select: { wishlistItems: true }
          }
        },
        orderBy,
        skip,
        take: limitNum,
      }),
      prisma.product.count({ where }),
    ]);

    return sendSuccess(res, products, 'Products retrieved successfully', 200, {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to fetch products', 500);
  }
};

export const getNewlyLaunchedProducts = async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      where: { isNewLaunch: true },
      include: {
        category: true,
        subcategory: true,
        variants: true,
        images: { orderBy: { sortOrder: 'asc' } },
        priceHistory: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
      orderBy: [
        { isFeaturedLaunch: 'desc' },
        { launchDate: 'desc' },
        { createdAt: 'desc' }
      ],
    });

    return sendSuccess(res, products, 'Newly launched products retrieved successfully');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to fetch newly launched products', 500);
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findFirst({
      where: {
        OR: [
          { id },
          { slug: id },
          { sku: id }
        ]
      },
      include: {
        category: true,
        subcategory: true,
        variants: {
          include: {
            images: true,
          }
        },
        images: { orderBy: { sortOrder: 'asc' } },
        inventory: true,
        priceHistory: {
          orderBy: { createdAt: 'asc' },
        },
        reviews: {
          include: {
            user: { select: { id: true, name: true, avatar: true } }
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: { wishlistItems: true }
        }
      }
    });

    if (!product) return sendError(res, 'Product not found', 404);

    return sendSuccess(res, product, 'Product details retrieved');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to fetch product details', 500);
  }
};

export const compareProducts = async (req: Request, res: Response) => {
  try {
    const { productIds } = req.body;
    if (!Array.isArray(productIds) || productIds.length === 0) {
      return sendError(res, 'Array of productIds required for comparison.', 400);
    }

    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      include: {
        category: true,
        subcategory: true,
        variants: true,
        images: { orderBy: { sortOrder: 'asc' } },
      }
    });

    return sendSuccess(res, products, 'Comparison data generated');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to compare products', 500);
  }
};

export const getSimilarProductsHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const similar = await findSimilarProducts(id, 4);
    return sendSuccess(res, similar, 'Similar products found');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to get similar products', 500);
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const {
      name,
      description,
      brand,
      categoryId,
      subcategoryId,
      modelNumber,
      mrp,
      currentPrice,
      originalPrice,
      stockQuantity,
      imageUrl,
      imageUrls,
      specifications,
      tags,
      variants,
    } = req.body;

    const sku = `PROD-${Date.now().toString().slice(-6)}`;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const calculatedMrp = mrp ? parseFloat(mrp) : (originalPrice ? parseFloat(originalPrice) : parseFloat(currentPrice));
    const origPrice = originalPrice ? parseFloat(originalPrice) : calculatedMrp;
    const currPrice = parseFloat(currentPrice);
    const discount = origPrice > currPrice ? ((origPrice - currPrice) / origPrice) * 100 : 0;

    const galleryUrls: string[] = Array.isArray(imageUrls) && imageUrls.length > 0
      ? imageUrls
      : [imageUrl || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&q=80&w=800'];

    const product = await prisma.product.create({
      data: {
        sku,
        name,
        slug: `${slug}-${Math.floor(Math.random() * 1000)}`,
        description,
        brand,
        categoryId,
        subcategoryId: subcategoryId || null,
        modelNumber: modelNumber || null,
        mrp: calculatedMrp,
        currentPrice: currPrice,
        originalPrice: origPrice,
        discount,
        stockQuantity: parseInt(stockQuantity, 10) || 10,
        availabilityStatus: stockQuantity > 0 ? ProductStatus.AVAILABLE : ProductStatus.OUT_OF_STOCK,
        specifications: specifications || {},
        tags: tags || [],
        images: {
          create: galleryUrls.map((url, idx) => ({
            url,
            isPrimary: idx === 0,
            sortOrder: idx,
          }))
        },
        inventory: {
          create: {
            stockQuantity: parseInt(stockQuantity, 10) || 10,
          }
        },
        priceHistory: {
          create: {
            previousPrice: calculatedMrp,
            newPrice: currPrice,
            changePercentage: -discount,
          }
        }
      },
      include: { category: true, subcategory: true, images: true, variants: true }
    });

    if (Array.isArray(variants) && variants.length > 0) {
      for (const v of variants) {
        await prisma.productVariant.create({
          data: {
            productId: product.id,
            sku: v.sku || `${product.sku}-${Math.floor(Math.random()*1000)}`,
            name: v.name,
            price: parseFloat(v.price),
            mrp: v.mrp ? parseFloat(v.mrp) : product.mrp,
            stockQuantity: parseInt(v.stockQuantity, 10) || 10,
            attributes: v.attributes || {},
          }
        });
      }
    }

    const reFetched = await prisma.product.findUnique({
      where: { id: product.id },
      include: { category: true, subcategory: true, images: true, variants: true }
    });

    return sendSuccess(res, reFetched, 'Product created successfully', 201);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to create product', 500);
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, brand, currentPrice, originalPrice, mrp, stockQuantity, availabilityStatus, categoryId, subcategoryId, modelNumber, description } = req.body;

    const existingProduct = await prisma.product.findUnique({ where: { id } });
    if (!existingProduct) return sendError(res, 'Product not found', 404);

    const updateData: any = {};
    if (name) updateData.name = name;
    if (brand) updateData.brand = brand;
    if (description) updateData.description = description;
    if (categoryId) updateData.categoryId = categoryId;
    if (subcategoryId !== undefined) updateData.subcategoryId = subcategoryId || null;
    if (modelNumber !== undefined) updateData.modelNumber = modelNumber || null;
    if (mrp !== undefined) updateData.mrp = parseFloat(mrp);

    if (stockQuantity !== undefined) {
      updateData.stockQuantity = parseInt(stockQuantity, 10);
      if (updateData.stockQuantity === 0) {
        updateData.availabilityStatus = ProductStatus.OUT_OF_STOCK;
      } else if (updateData.stockQuantity <= existingProduct.lowStockThreshold) {
        updateData.availabilityStatus = ProductStatus.LOW_STOCK;
      } else {
        updateData.availabilityStatus = ProductStatus.AVAILABLE;
      }
    }

    if (availabilityStatus) {
      updateData.availabilityStatus = availabilityStatus as ProductStatus;
    }

    // Price change tracking
    if (currentPrice !== undefined && parseFloat(currentPrice) !== existingProduct.currentPrice) {
      const newP = parseFloat(currentPrice);
      const prevP = existingProduct.currentPrice;
      const changePct = ((newP - prevP) / prevP) * 100;

      updateData.currentPrice = newP;
      const orig = originalPrice ? parseFloat(originalPrice) : existingProduct.originalPrice;
      updateData.originalPrice = orig;
      updateData.discount = orig > newP ? ((orig - newP) / orig) * 100 : 0;

      await prisma.priceHistory.create({
        data: {
          productId: id,
          previousPrice: prevP,
          newPrice: newP,
          changePercentage: changePct,
        }
      });
    }

    const updated = await prisma.product.update({
      where: { id },
      data: updateData,
      include: { category: true, subcategory: true, images: true, variants: true, inventory: true }
    });

    return sendSuccess(res, updated, 'Product updated successfully');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to update product', 500);
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // Soft delete to preserve historical wishlist reference
    const updated = await prisma.product.update({
      where: { id },
      data: {
        availabilityStatus: ProductStatus.REMOVED,
        stockQuantity: 0,
      }
    });

    return sendSuccess(res, updated, 'Product marked as REMOVED (soft deleted)');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to delete product', 500);
  }
};
