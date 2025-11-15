import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { blogCategories, blogPosts } from '../db/schema';
import { eq, desc, and, sql, count, or, isNull } from 'drizzle-orm';
import { AppError } from '../middleware/error.middleware';
import { logger } from '../utils/logger';

// Get all blog categories with optional filters
export const getBlogCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      status,
      parentId,
      search,
      page = 1,
      limit = 20
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);

    // Build conditions
    const conditions = [];
    if (status) {
      conditions.push(eq(blogCategories.status, status as "active" | "inactive"));
    }
    if (parentId === 'null' || parentId === '') {
      conditions.push(isNull(blogCategories.parentId));
    } else if (parentId) {
      conditions.push(eq(blogCategories.parentId, parentId as string));
    }
    if (search) {
      conditions.push(
        or(
          sql`${blogCategories.name} ILIKE ${`%${search}%`}`,
          sql`${blogCategories.slug} ILIKE ${`%${search}%`}`
        )
      );
    }

    // Get categories
    const categories = await db.select()
      .from(blogCategories)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(blogCategories.position, desc(blogCategories.createdAt))
      .limit(Number(limit))
      .offset(offset);

    // Get total count
    const [{ total }] = await db
      .select({ total: count() })
      .from(blogCategories)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    logger.info(`Fetched ${categories.length} blog categories`);

    res.json({
      success: true,
      data: categories,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: Number(total),
        totalPages: Math.ceil(Number(total) / Number(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get blog category by ID
export const getBlogCategoryById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const [category] = await db.select()
      .from(blogCategories)
      .where(eq(blogCategories.id, id))
      .limit(1);

    if (!category) {
      throw new AppError(404, 'Blog category not found', 'CATEGORY_NOT_FOUND');
    }

    // Get posts count
    const [{ postsCount }] = await db
      .select({ postsCount: count() })
      .from(blogPosts)
      .where(eq(blogPosts.categoryId, id));

    logger.info(`Fetched blog category: ${category.name}`);

    res.json({
      success: true,
      data: {
        ...category,
        postsCount: Number(postsCount)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get blog category by slug
export const getBlogCategoryBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;

    const [category] = await db.select()
      .from(blogCategories)
      .where(eq(blogCategories.slug, slug))
      .limit(1);

    if (!category) {
      throw new AppError(404, 'Blog category not found', 'CATEGORY_NOT_FOUND');
    }

    logger.info(`Fetched blog category by slug: ${slug}`);

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    next(error);
  }
};

// Create blog category
export const createBlogCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      name,
      slug,
      description,
      image,
      parentId,
      position = 0,
      status = 'active',
      metaTitle,
      metaDescription,
      canonicalUrl,
      robotsIndex = true,
      robotsFollow = true
    } = req.body;

    // Validation
    if (!name || !slug) {
      throw new AppError(400, 'Name and slug are required', 'MISSING_REQUIRED_FIELDS');
    }

    // Check if slug already exists
    const [existingCategory] = await db.select()
      .from(blogCategories)
      .where(eq(blogCategories.slug, slug))
      .limit(1);

    if (existingCategory) {
      throw new AppError(400, 'Category with this slug already exists', 'SLUG_EXISTS');
    }

    // Create category
    const [category] = await db.insert(blogCategories)
      .values({
        name,
        slug,
        description,
        image,
        parentId: parentId || null,
        position,
        status,
        metaTitle,
        metaDescription,
        canonicalUrl,
        robotsIndex,
        robotsFollow,
        updatedAt: new Date()
      })
      .returning();

    logger.info(`Created blog category: ${category.name}`);

    res.status(201).json({
      success: true,
      data: category
    });
  } catch (error) {
    next(error);
  }
};

// Update blog category
export const updateBlogCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const {
      name,
      slug,
      description,
      image,
      parentId,
      position,
      status,
      metaTitle,
      metaDescription,
      canonicalUrl,
      robotsIndex,
      robotsFollow
    } = req.body;

    // Check if category exists
    const [existingCategory] = await db.select()
      .from(blogCategories)
      .where(eq(blogCategories.id, id))
      .limit(1);

    if (!existingCategory) {
      throw new AppError(404, 'Blog category not found', 'CATEGORY_NOT_FOUND');
    }

    // Check if new slug conflicts with another category
    if (slug && slug !== existingCategory.slug) {
      const [slugConflict] = await db.select()
        .from(blogCategories)
        .where(eq(blogCategories.slug, slug))
        .limit(1);

      if (slugConflict) {
        throw new AppError(400, 'Category with this slug already exists', 'SLUG_EXISTS');
      }
    }

    // Update category
    const [updatedCategory] = await db.update(blogCategories)
      .set({
        ...(name !== undefined && { name }),
        ...(slug !== undefined && { slug }),
        ...(description !== undefined && { description }),
        ...(image !== undefined && { image }),
        ...(parentId !== undefined && { parentId: parentId || null }),
        ...(position !== undefined && { position }),
        ...(status !== undefined && { status }),
        ...(metaTitle !== undefined && { metaTitle }),
        ...(metaDescription !== undefined && { metaDescription }),
        ...(canonicalUrl !== undefined && { canonicalUrl }),
        ...(robotsIndex !== undefined && { robotsIndex }),
        ...(robotsFollow !== undefined && { robotsFollow }),
        updatedAt: new Date()
      })
      .where(eq(blogCategories.id, id))
      .returning();

    logger.info(`Updated blog category: ${updatedCategory.name}`);

    res.json({
      success: true,
      data: updatedCategory
    });
  } catch (error) {
    next(error);
  }
};

// Delete blog category
export const deleteBlogCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Check if category exists
    const [category] = await db.select()
      .from(blogCategories)
      .where(eq(blogCategories.id, id))
      .limit(1);

    if (!category) {
      throw new AppError(404, 'Blog category not found', 'CATEGORY_NOT_FOUND');
    }

    // Check if category has posts
    const [{ postsCount }] = await db
      .select({ postsCount: count() })
      .from(blogPosts)
      .where(eq(blogPosts.categoryId, id));

    if (Number(postsCount) > 0) {
      throw new AppError(400, 'Cannot delete category with existing posts', 'CATEGORY_HAS_POSTS');
    }

    // Check if category has children
    const [{ childrenCount }] = await db
      .select({ childrenCount: count() })
      .from(blogCategories)
      .where(eq(blogCategories.parentId, id));

    if (Number(childrenCount) > 0) {
      throw new AppError(400, 'Cannot delete category with subcategories', 'CATEGORY_HAS_CHILDREN');
    }

    // Delete category
    await db.delete(blogCategories)
      .where(eq(blogCategories.id, id));

    logger.info(`Deleted blog category: ${category.name}`);

    res.json({
      success: true,
      message: 'Blog category deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get blog category tree (hierarchical structure)
export const getBlogCategoryTree = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get all active categories
    const allCategories = await db.select()
      .from(blogCategories)
      .where(eq(blogCategories.status, 'active'))
      .orderBy(blogCategories.position);

    // Build tree structure
    const categoryMap = new Map();
    const tree: any[] = [];

    // First pass: create map
    allCategories.forEach(cat => {
      categoryMap.set(cat.id, { ...cat, children: [] });
    });

    // Second pass: build tree
    allCategories.forEach(cat => {
      const category = categoryMap.get(cat.id);
      if (cat.parentId && categoryMap.has(cat.parentId)) {
        categoryMap.get(cat.parentId).children.push(category);
      } else {
        tree.push(category);
      }
    });

    logger.info(`Built blog category tree with ${tree.length} root categories`);

    res.json({
      success: true,
      data: tree
    });
  } catch (error) {
    next(error);
  }
};
