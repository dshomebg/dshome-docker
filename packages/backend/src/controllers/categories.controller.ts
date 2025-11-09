import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { categories, productCategories } from '../db/schema';
import { eq, desc, ilike, isNull, count } from 'drizzle-orm';
import { AppError } from '../middleware/error.middleware';
import { logger } from '../utils/logger';

// Helper function to build tree structure from flat categories
const buildCategoryTree = (cats: any[], parentId: string | null = null): any[] => {
  return cats
    .filter(cat => cat.parentId === parentId)
    .map(cat => ({
      ...cat,
      children: buildCategoryTree(cats, cat.id)
    }));
};

// Get all categories with optional search and pagination
export const getCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, page = '1', limit = '20', status, tree = 'false' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;
    const wantTree = tree === 'true';

    let query = db.select().from(categories);

    // Apply filters
    const conditions = [];
    if (search) {
      conditions.push(ilike(categories.name, `%${search}%`));
    }
    if (status) {
      conditions.push(eq(categories.status, status as any));
    }

    if (conditions.length > 0) {
      query = query.where(conditions[0]) as any;
    }

    // If tree view requested, get all categories without pagination
    if (wantTree) {
      const allCategories = await query.orderBy(categories.position, categories.name);
      const tree = buildCategoryTree(allCategories);
      
      logger.info(`Fetched ${allCategories.length} categories as tree`);
      
      return res.json({
        data: tree,
        pagination: {
          page: 1,
          limit: allCategories.length,
          total: allCategories.length,
          totalPages: 1
        }
      });
    }

    // Regular paginated list
    const categoriesList = await query
      .orderBy(desc(categories.createdAt))
      .limit(limitNum)
      .offset(offset);

    const [{ value: totalCount }] = await db
      .select({ value: count() })
      .from(categories);

    logger.info(`Fetched ${categoriesList.length} categories`);

    res.json({
      data: categoriesList,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount || 0,
        totalPages: Math.ceil((totalCount || 0) / limitNum)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get single category by ID
export const getCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const [category] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id));

    if (!category) {
      throw new AppError(404, 'Category not found');
    }

    logger.info(`Fetched category: ${category.name}`);
    res.json({ data: category });
  } catch (error) {
    next(error);
  }
};

// Create new category
export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      name,
      slug,
      description,
      image,
      parentId,
      status,
      style,
      h1,
      metaTitle,
      metaDescription,
      canonicalUrl
    } = req.body;

    if (!name || !slug) {
      throw new AppError(400, 'Name and slug are required');
    }

    // Check if slug already exists
    const [existing] = await db
      .select()
      .from(categories)
      .where(eq(categories.slug, slug));

    if (existing) {
      throw new AppError(400, 'Slug already exists');
    }

    const [newCategory] = await db
      .insert(categories)
      .values({
        name,
        slug,
        description: description || null,
        image: image || null,
        parentId: parentId || null,
        status: status || 'active',
        style: style || 'product',
        h1: h1 || null,
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
        canonicalUrl: canonicalUrl || null,
      })
      .returning();

    logger.info(`Created category: ${newCategory.name}`);
    res.status(201).json({ data: newCategory });
  } catch (error) {
    next(error);
  }
};

// Update category
export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const {
      name,
      slug,
      description,
      image,
      parentId,
      status,
      style,
      h1,
      metaTitle,
      metaDescription,
      canonicalUrl
    } = req.body;

    // Check if category exists
    const [existing] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id));

    if (!existing) {
      throw new AppError(404, 'Category not found');
    }

    // Prevent circular reference
    if (parentId === id) {
      throw new AppError(400, 'Category cannot be its own parent');
    }

    // Check if slug is taken by another category
    if (slug && slug !== existing.slug) {
      const [slugExists] = await db
        .select()
        .from(categories)
        .where(eq(categories.slug, slug));

      if (slugExists && slugExists.id !== id) {
        throw new AppError(400, 'Slug already exists');
      }
    }

    const [updatedCategory] = await db
      .update(categories)
      .set({
        name: name || existing.name,
        slug: slug || existing.slug,
        description: description !== undefined ? description : existing.description,
        image: image !== undefined ? image : existing.image,
        parentId: parentId !== undefined ? parentId : existing.parentId,
        status: status || existing.status,
        style: style || existing.style,
        h1: h1 !== undefined ? h1 : existing.h1,
        metaTitle: metaTitle !== undefined ? metaTitle : existing.metaTitle,
        metaDescription: metaDescription !== undefined ? metaDescription : existing.metaDescription,
        canonicalUrl: canonicalUrl !== undefined ? canonicalUrl : existing.canonicalUrl,
        updatedAt: new Date(),
      })
      .where(eq(categories.id, id))
      .returning();

    logger.info(`Updated category: ${updatedCategory.name}`);
    res.json({ data: updatedCategory });
  } catch (error) {
    next(error);
  }
};

// Delete category
export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const [category] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id));

    if (!category) {
      throw new AppError(404, 'Category not found');
    }

    // Check if category has children
    const children = await db
      .select()
      .from(categories)
      .where(eq(categories.parentId, id));

    if (children.length > 0) {
      throw new AppError(400, 'Cannot delete category with subcategories');
    }

    await db
      .delete(categories)
      .where(eq(categories.id, id));

    logger.info(`Deleted category: ${category.name}`);
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Get category tree (all categories in hierarchical structure)
export const getCategoryTree = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.query;

    let query = db.select().from(categories);

    if (status) {
      query = query.where(eq(categories.status, status as any)) as any;
    }

    const allCategories = await query.orderBy(categories.position, categories.name);

    // Get product counts for each category
    const categoriesWithCounts = await Promise.all(
      allCategories.map(async (category) => {
        const [result] = await db
          .select({ count: count() })
          .from(productCategories)
          .where(eq(productCategories.categoryId, category.id));

        return {
          ...category,
          productCount: result?.count || 0,
        };
      })
    );

    const tree = buildCategoryTree(categoriesWithCounts);

    logger.info(`Built category tree with ${allCategories.length} categories`);
    res.json({ data: tree });
  } catch (error) {
    next(error);
  }
};
