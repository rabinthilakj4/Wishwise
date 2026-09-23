import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { sendSuccess, sendError } from '../utils/apiResponse';

const prisma = new PrismaClient();

export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        subcategories: {
          orderBy: { name: 'asc' },
          include: {
            _count: { select: { products: true } }
          }
        },
        _count: {
          select: { products: true }
        }
      },
      orderBy: { name: 'asc' },
    });
    return sendSuccess(res, categories, 'Categories retrieved');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to fetch categories', 500);
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, description, image } = req.body;
    if (!name) return sendError(res, 'Category name is required', 400);

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const category = await prisma.category.create({
      data: {
        name,
        slug: `${slug}-${Date.now().toString().slice(-4)}`,
        description,
        image: image || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=600',
      }
    });

    return sendSuccess(res, category, 'Category created successfully', 201);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to create category', 500);
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, image, isActive } = req.body;

    const category = await prisma.category.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(image && { image }),
        ...(isActive !== undefined && { isActive }),
      }
    });

    return sendSuccess(res, category, 'Category updated');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to update category', 500);
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.category.delete({ where: { id } });
    return sendSuccess(res, null, 'Category deleted');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to delete category', 500);
  }
};
