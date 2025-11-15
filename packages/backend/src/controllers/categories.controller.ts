import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { categories, productCategories, categoryFeatureWeights, featureGroups, featureValues } from '../db/schema';
import { eq, desc, ilike, isNull, count, and, inArray } from 'drizzle-orm';
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

    // TODO: Add product counts when productCategories table is ready
    const categoriesWithCounts = allCategories.map((category) => ({
      ...category,
      productCount: 0,
    }));

    const tree = buildCategoryTree(categoriesWithCounts);

    logger.info(`Built category tree with ${allCategories.length} categories`);
    res.json({ data: tree });
  } catch (error) {
    next(error);
  }
};

// Get category feature weights
export const getCategoryFeatureWeights = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Check if category exists
    const [category] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id));

    if (!category) {
      throw new AppError(404, 'Category not found');
    }

    // Get feature weights with feature group names
    const weights = await db
      .select({
        id: categoryFeatureWeights.id,
        categoryId: categoryFeatureWeights.categoryId,
        featureGroupId: categoryFeatureWeights.featureGroupId,
        featureGroupName: featureGroups.name,
        weightType: categoryFeatureWeights.weightType,
        weight: categoryFeatureWeights.weight,
        position: categoryFeatureWeights.position,
        createdAt: categoryFeatureWeights.createdAt,
        updatedAt: categoryFeatureWeights.updatedAt,
      })
      .from(categoryFeatureWeights)
      .leftJoin(featureGroups, eq(categoryFeatureWeights.featureGroupId, featureGroups.id))
      .where(eq(categoryFeatureWeights.categoryId, id))
      .orderBy(categoryFeatureWeights.position);

    // Calculate total weight
    const totalWeight = weights.reduce((sum, w) => sum + (w.weight || 0), 0);

    logger.info(`Fetched ${weights.length} feature weights for category ${category.name}`);

    res.json({
      success: true,
      data: {
        categoryId: id,
        categoryName: category.name,
        weights: weights.map(w => ({
          id: w.id,
          type: w.weightType,
          featureGroupId: w.featureGroupId,
          featureGroupName: w.featureGroupName,
          weight: w.weight,
          position: w.position,
        })),
        totalWeight,
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update category feature weights
export const updateCategoryFeatureWeights = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { weights } = req.body;

    // Check if category exists
    const [category] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id));

    if (!category) {
      throw new AppError(404, 'Category not found');
    }

    if (!Array.isArray(weights)) {
      throw new AppError(400, 'Weights must be an array');
    }

    // Validate total weight
    const totalWeight = weights.reduce((sum, w) => sum + (w.weight || 0), 0);
    if (totalWeight > 100) {
      throw new AppError(400, `Total weight cannot exceed 100% (current: ${totalWeight}%)`);
    }

    // Validate unique feature groups
    const featureGroupIds = weights
      .filter(w => w.type === 'feature_group' && w.featureGroupId)
      .map(w => w.featureGroupId);

    if (new Set(featureGroupIds).size !== featureGroupIds.length) {
      throw new AppError(400, 'Duplicate feature groups are not allowed');
    }

    // Validate only one price weight
    const priceWeights = weights.filter(w => w.type === 'price');
    if (priceWeights.length > 1) {
      throw new AppError(400, 'Only one price weight is allowed');
    }

    // Validate weight values
    for (const w of weights) {
      if (typeof w.weight !== 'number' || w.weight < 0 || w.weight > 100) {
        throw new AppError(400, `Invalid weight value: ${w.weight}. Must be between 0 and 100`);
      }
      if (w.type !== 'price' && w.type !== 'feature_group') {
        throw new AppError(400, `Invalid weight type: ${w.type}. Must be 'price' or 'feature_group'`);
      }
      if (w.type === 'feature_group' && !w.featureGroupId) {
        throw new AppError(400, 'Feature group ID is required for feature_group type');
      }
    }

    // Delete existing weights for this category
    await db
      .delete(categoryFeatureWeights)
      .where(eq(categoryFeatureWeights.categoryId, id));

    // Insert new weights
    if (weights.length > 0) {
      const newWeights = weights.map((w, index) => ({
        categoryId: id,
        featureGroupId: w.featureGroupId || null,
        weightType: w.type,
        weight: w.weight,
        position: index,
      }));

      await db
        .insert(categoryFeatureWeights)
        .values(newWeights);
    }

    logger.info(`Updated feature weights for category ${category.name}: ${weights.length} weights, total ${totalWeight}%`);

    res.json({
      success: true,
      message: 'Feature weights updated successfully',
      data: {
        categoryId: id,
        totalWeight,
        weightsCount: weights.length,
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get allowed feature groups for a category (for filtering in product edit)
export const getAllowedFeatureGroups = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Check if category exists
    const [category] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id));

    if (!category) {
      throw new AppError(404, 'Category not found');
    }

    // Get feature weights for this category
    const weights = await db
      .select({
        featureGroupId: categoryFeatureWeights.featureGroupId,
        featureGroupName: featureGroups.name,
        weight: categoryFeatureWeights.weight,
      })
      .from(categoryFeatureWeights)
      .leftJoin(featureGroups, eq(categoryFeatureWeights.featureGroupId, featureGroups.id))
      .where(
        and(
          eq(categoryFeatureWeights.categoryId, id),
          eq(categoryFeatureWeights.weightType, 'feature_group')
        )
      )
      .orderBy(categoryFeatureWeights.position);

    // If no weights configured, return empty array (frontend will show all groups as fallback)
    if (weights.length === 0 || weights.every(w => !w.featureGroupId)) {
      logger.info(`No feature weights configured for category ${category.name}`);
      return res.json({
        success: true,
        data: {
          categoryId: id,
          categoryName: category.name,
          allowedGroups: [],
          hasConfiguration: false,
        }
      });
    }

    // Get feature values for each allowed group
    const groupIds = weights.map(w => w.featureGroupId).filter(Boolean) as string[];

    const values = await db
      .select({
        id: featureValues.id,
        name: featureValues.name,
        featureGroupId: featureValues.featureGroupId,
        position: featureValues.position,
      })
      .from(featureValues)
      .where(inArray(featureValues.featureGroupId, groupIds))
      .orderBy(featureValues.position, featureValues.name);

    // Group values by feature group
    const valuesByGroup = values.reduce((acc, val) => {
      if (!acc[val.featureGroupId]) {
        acc[val.featureGroupId] = [];
      }
      acc[val.featureGroupId].push({
        id: val.id,
        name: val.name,
        position: val.position,
      });
      return acc;
    }, {} as Record<string, any[]>);

    const allowedGroups = weights
      .filter(w => w.featureGroupId)
      .map(w => ({
        id: w.featureGroupId,
        name: w.featureGroupName,
        weight: w.weight,
        features: valuesByGroup[w.featureGroupId!] || [],
      }));

    logger.info(`Fetched ${allowedGroups.length} allowed feature groups for category ${category.name}`);

    res.json({
      success: true,
      data: {
        categoryId: id,
        categoryName: category.name,
        allowedGroups,
        hasConfiguration: true,
      }
    });
  } catch (error) {
    next(error);
  }
};
