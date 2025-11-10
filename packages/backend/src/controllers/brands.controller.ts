import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { brands } from '../db/schema';
import { eq, desc, ilike, or, count } from 'drizzle-orm';
import { AppError } from '../middleware/error.middleware';
import { logger } from '../utils/logger';

// Get all brands with optional search and pagination
export const getBrands = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, page = '1', limit = '20', status } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    let query = db.select().from(brands);

    // Apply filters
    const conditions = [];
    if (search) {
      conditions.push(
        or(
          ilike(brands.name, `%${search}%`),
          ilike(brands.slug, `%${search}%`)
        )
      );
    }
    if (status) {
      conditions.push(eq(brands.status, status as any));
    }

    if (conditions.length > 0) {
      query = query.where(conditions[0]) as any;
    }

    // Build count query with same filters
    let countQuery = db.select({ count: count() }).from(brands);
    if (conditions.length > 0) {
      countQuery = countQuery.where(conditions[0]) as any;
    }

    const [brandsList, countResult] = await Promise.all([
      query
        .orderBy(desc(brands.createdAt))
        .limit(limitNum)
        .offset(offset),
      countQuery
    ]);

    const totalCount = Number(countResult[0]?.count || 0);

    logger.info(`Fetched ${brandsList.length} brands`);

    res.json({
      data: brandsList,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limitNum)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get single brand by ID
export const getBrand = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const [brand] = await db.select().from(brands).where(eq(brands.id, id)).limit(1);

    if (!brand) {
      throw new AppError(404, 'Brand not found', 'BRAND_NOT_FOUND');
    }

    res.json({ data: brand });
  } catch (error) {
    next(error);
  }
};

// Create new brand
export const createBrand = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, slug, logo, description, status, metaTitle, metaDescription, metaKeywords, canonicalUrl } = req.body;

    // Check if slug already exists
    const [existingBrand] = await db.select().from(brands).where(eq(brands.slug, slug)).limit(1);
    if (existingBrand) {
      throw new AppError(400, 'Brand with this slug already exists', 'SLUG_EXISTS');
    }

    const [newBrand] = await db.insert(brands).values({
      name,
      slug,
      logo,
      description,
      status: status || 'active',
      metaTitle,
      metaDescription,
      metaKeywords,
      canonicalUrl,
      updatedAt: new Date()
    }).returning();

    logger.info(`Brand created: ${newBrand.name} (${newBrand.id})`);

    res.status(201).json({ data: newBrand });
  } catch (error) {
    next(error);
  }
};

// Update brand
export const updateBrand = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, slug, logo, description, status, metaTitle, metaDescription, metaKeywords, canonicalUrl } = req.body;

    // Check if brand exists
    const [existingBrand] = await db.select().from(brands).where(eq(brands.id, id)).limit(1);
    if (!existingBrand) {
      throw new AppError(404, 'Brand not found', 'BRAND_NOT_FOUND');
    }

    // Check if slug is taken by another brand
    if (slug && slug !== existingBrand.slug) {
      const [brandWithSlug] = await db.select().from(brands).where(eq(brands.slug, slug)).limit(1);
      if (brandWithSlug && brandWithSlug.id !== id) {
        throw new AppError(400, 'Brand with this slug already exists', 'SLUG_EXISTS');
      }
    }

    const [updatedBrand] = await db.update(brands)
      .set({
        name,
        slug,
        logo,
        description,
        status,
        metaTitle,
        metaDescription,
        metaKeywords,
        canonicalUrl,
        updatedAt: new Date()
      })
      .where(eq(brands.id, id))
      .returning();

    logger.info(`Brand updated: ${updatedBrand.name} (${updatedBrand.id})`);

    res.json({ data: updatedBrand });
  } catch (error) {
    next(error);
  }
};

// Delete brand
export const deleteBrand = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const [existingBrand] = await db.select().from(brands).where(eq(brands.id, id)).limit(1);
    if (!existingBrand) {
      throw new AppError(404, 'Brand not found', 'BRAND_NOT_FOUND');
    }

    await db.delete(brands).where(eq(brands.id, id));

    logger.info(`Brand deleted: ${existingBrand.name} (${id})`);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
