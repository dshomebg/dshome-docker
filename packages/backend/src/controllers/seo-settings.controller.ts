import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { seoSettings } from '../db/schema/seo-settings';
import { products } from '../db/schema/products';
import { categories } from '../db/schema/categories';
import { generalSettings } from '../db/schema/general-settings';
import { brands } from '../db/schema/brands';
import { eq } from 'drizzle-orm';
import { AppError } from '../middleware/error.middleware';
import { logger } from '../utils/logger';

// Get SEO settings (there should be only one row)
export const getSeoSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const settings = await db
      .select()
      .from(seoSettings)
      .limit(1);

    // If no settings exist, create default
    if (settings.length === 0) {
      const [newSettings] = await db
        .insert(seoSettings)
        .values({
          productUrlFormat: '/{def-category-slug}/{product-slug}',
          productUrlSuffix: '',
          categoryUrlFormat: '/{category-slug}',
          categoryUrlSuffix: '',
          brandUrlFormat: '/{brand-slug}',
          brandUrlSuffix: '',
          cmsUrlFormat: '/pages/{cms-category}/{cms-page-slug}',
          cmsUrlSuffix: '',
          cmsCategoryUrlFormat: '/pages/{cms-category}',
          cmsCategoryUrlSuffix: '',
          blogUrlFormat: '/blog/{blog-category}/{blog-page-slug}',
          blogUrlSuffix: '',
          blogCategoryUrlFormat: '/blog/{blog-category}',
          blogCategoryUrlSuffix: '',
          canonicalEnabled: true,
          productMetaTitleTemplate: '{name} - {shop_name}',
          productMetaDescriptionTemplate: 'Купете {name} на страхотна цена от {shop_name}. {description}',
          categoryMetaTitleTemplate: '{name} - {shop_name}',
          categoryMetaDescriptionTemplate: 'Разгледайте нашата категория {name} в {shop_name}. {description}'
        })
        .returning();

      return res.json({ data: newSettings });
    }

    res.json({ data: settings[0] });
  } catch (error) {
    next(error);
  }
};

// Update SEO settings
export const updateSeoSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updateData = req.body;

    // Get existing settings
    const existing = await db
      .select()
      .from(seoSettings)
      .limit(1);

    if (existing.length === 0) {
      throw new AppError(404, 'SEO settings not found', 'SETTINGS_NOT_FOUND');
    }

    const [updatedSettings] = await db
      .update(seoSettings)
      .set({
        ...updateData,
        updatedAt: new Date()
      })
      .where(eq(seoSettings.id, existing[0].id))
      .returning();

    logger.info(`Updated SEO settings`);

    res.json({ data: updatedSettings });
  } catch (error) {
    next(error);
  }
};

// Generate meta tags for all products
export const generateProductMeta = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get SEO settings templates
    const [seoSettingsData] = await db.select().from(seoSettings).limit(1);
    if (!seoSettingsData) {
      throw new AppError(404, 'SEO settings not found', 'SETTINGS_NOT_FOUND');
    }

    // Get shop name from general settings
    const [generalSettingsData] = await db.select().from(generalSettings).limit(1);
    const shopName = generalSettingsData?.baseUrl?.replace(/^https?:\/\//, '').replace(/^www\./, '') || 'Your Shop';

    // Get all products where skipMetaGeneration = false
    const allProducts = await db
      .select({
        id: products.id,
        name: products.name,
        shortDescription: products.shortDescription,
        description: products.description,
        skipMetaGeneration: products.skipMetaGeneration,
        brandId: products.brandId
      })
      .from(products)
      .where(eq(products.skipMetaGeneration, false));

    let generated = 0;
    let skipped = 0;

    // Generate meta tags for each product
    for (const product of allProducts) {
      // Get brand name if exists
      let brandName = '';
      if (product.brandId) {
        const [brand] = await db.select().from(brands).where(eq(brands.id, product.brandId)).limit(1);
        brandName = brand?.name || '';
      }

      // Replace placeholders in templates
      const metaTitle = seoSettingsData.productMetaTitleTemplate
        .replace(/{name}/g, product.name || '')
        .replace(/{brand}/g, brandName)
        .replace(/{shop_name}/g, shopName);

      const description = product.shortDescription || product.description || '';
      const metaDescription = seoSettingsData.productMetaDescriptionTemplate
        .replace(/{name}/g, product.name || '')
        .replace(/{description}/g, description.substring(0, 300))
        .replace(/{brand}/g, brandName)
        .replace(/{shop_name}/g, shopName);

      // Update product meta tags
      await db
        .update(products)
        .set({
          metaTitle,
          metaDescription,
          updatedAt: new Date()
        })
        .where(eq(products.id, product.id));

      generated++;
    }

    // Count skipped products
    const skippedProducts = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.skipMetaGeneration, true));
    skipped = skippedProducts.length;

    logger.info(`Generated meta tags for ${generated} products, skipped ${skipped}`);

    res.json({
      success: true,
      data: {
        generated,
        skipped,
        total: generated + skipped
      }
    });
  } catch (error) {
    next(error);
  }
};

// Generate meta tags for all categories
export const generateCategoryMeta = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get SEO settings templates
    const [seoSettingsData] = await db.select().from(seoSettings).limit(1);
    if (!seoSettingsData) {
      throw new AppError(404, 'SEO settings not found', 'SETTINGS_NOT_FOUND');
    }

    // Get shop name from general settings
    const [generalSettingsData] = await db.select().from(generalSettings).limit(1);
    const shopName = generalSettingsData?.baseUrl?.replace(/^https?:\/\//, '').replace(/^www\./, '') || 'Your Shop';

    // Get all categories where skipMetaGeneration = false
    const allCategories = await db
      .select({
        id: categories.id,
        name: categories.name,
        description: categories.description,
        skipMetaGeneration: categories.skipMetaGeneration
      })
      .from(categories)
      .where(eq(categories.skipMetaGeneration, false));

    let generated = 0;
    let skipped = 0;

    // Generate meta tags for each category
    for (const category of allCategories) {
      // Replace placeholders in templates
      const metaTitle = seoSettingsData.categoryMetaTitleTemplate
        .replace(/{name}/g, category.name || '')
        .replace(/{shop_name}/g, shopName);

      const metaDescription = seoSettingsData.categoryMetaDescriptionTemplate
        .replace(/{name}/g, category.name || '')
        .replace(/{description}/g, category.description?.substring(0, 300) || '')
        .replace(/{shop_name}/g, shopName);

      // Update category meta tags
      await db
        .update(categories)
        .set({
          metaTitle,
          metaDescription,
          updatedAt: new Date()
        })
        .where(eq(categories.id, category.id));

      generated++;
    }

    // Count skipped categories
    const skippedCategories = await db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.skipMetaGeneration, true));
    skipped = skippedCategories.length;

    logger.info(`Generated meta tags for ${generated} categories, skipped ${skipped}`);

    res.json({
      success: true,
      data: {
        generated,
        skipped,
        total: generated + skipped
      }
    });
  } catch (error) {
    next(error);
  }
};
