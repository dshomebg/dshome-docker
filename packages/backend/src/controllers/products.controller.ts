import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import {
  products,
  productCategories,
  productImages,
  productPrices,
  productInventory,
  productCombinations,
  productCombinationAttributes,
  productFeatures,
  brands,
  suppliers,
  categories
} from '../db/schema';
import { eq, desc, ilike, or, and, sql, isNull } from 'drizzle-orm';
import { AppError } from '../middleware/error.middleware';
import { logger } from '../utils/logger';

// Get all products with optional search and pagination
export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, page = '1', limit = '20', status, brandId, supplierId, categoryId, productType } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    // Build query
    let query = db
      .select({
        product: products,
        brand: {
          id: brands.id,
          name: brands.name,
          slug: brands.slug
        },
        supplier: {
          id: suppliers.id,
          name: suppliers.name
        }
      })
      .from(products)
      .leftJoin(brands, eq(products.brandId, brands.id))
      .leftJoin(suppliers, eq(products.supplierId, suppliers.id));

    // Apply filters
    const conditions = [];

    if (search) {
      conditions.push(
        or(
          ilike(products.name, `%${search}%`),
          ilike(products.sku, `%${search}%`),
          ilike(products.slug, `%${search}%`)
        )
      );
    }

    if (status) {
      conditions.push(eq(products.status, status as any));
    }

    if (productType) {
      conditions.push(eq(products.productType, productType as any));
    }

    if (brandId) {
      conditions.push(eq(products.brandId, brandId as string));
    }

    if (supplierId) {
      conditions.push(eq(products.supplierId, supplierId as string));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    // Execute query with pagination
    const productsList = await query
      .orderBy(desc(products.createdAt))
      .limit(limitNum)
      .offset(offset);

    // Get total count
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(products)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    // For each product, get primary category and first image
    const productsWithDetails = await Promise.all(
      productsList.map(async ({ product, brand, supplier }) => {
        // Get primary category
        const [primaryCat] = await db
          .select({
            category: categories
          })
          .from(productCategories)
          .leftJoin(categories, eq(productCategories.categoryId, categories.id))
          .where(and(
            eq(productCategories.productId, product.id),
            eq(productCategories.isPrimary, true)
          ))
          .limit(1);

        // Get first image
        const [firstImage] = await db
          .select()
          .from(productImages)
          .where(eq(productImages.productId, product.id))
          .orderBy(productImages.position)
          .limit(1);

        // Get current price
        const [currentPrice] = await db
          .select()
          .from(productPrices)
          .where(and(
            eq(productPrices.productId, product.id),
            or(
              isNull(productPrices.validTo),
              sql`${productPrices.validTo} > NOW()`
            )
          ))
          .orderBy(desc(productPrices.validFrom))
          .limit(1);

        // Get total inventory
        const [inventorySum] = await db
          .select({
            total: sql<number>`COALESCE(SUM(${productInventory.quantity}), 0)::int`
          })
          .from(productInventory)
          .where(eq(productInventory.productId, product.id));

        return {
          ...product,
          brand: brand?.id ? brand : null,
          supplier: supplier?.id ? supplier : null,
          primaryCategory: primaryCat?.category || null,
          firstImage: firstImage || null,
          currentPrice: currentPrice || null,
          totalInventory: inventorySum?.total || 0
        };
      })
    );

    logger.info(`Fetched ${productsList.length} products`);

    res.json({
      data: productsWithDetails,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count,
        totalPages: Math.ceil(count / limitNum)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get single product by ID with all details
export const getProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Get product with brand and supplier
    const [productData] = await db
      .select({
        product: products,
        brand: {
          id: brands.id,
          name: brands.name,
          slug: brands.slug
        },
        supplier: {
          id: suppliers.id,
          name: suppliers.name
        }
      })
      .from(products)
      .leftJoin(brands, eq(products.brandId, brands.id))
      .leftJoin(suppliers, eq(products.supplierId, suppliers.id))
      .where(eq(products.id, id))
      .limit(1);

    if (!productData) {
      throw new AppError(404, 'Product not found', 'PRODUCT_NOT_FOUND');
    }

    // Get categories
    const productCats = await db
      .select({
        id: productCategories.id,
        categoryId: productCategories.categoryId,
        isPrimary: productCategories.isPrimary,
        category: categories
      })
      .from(productCategories)
      .leftJoin(categories, eq(productCategories.categoryId, categories.id))
      .where(eq(productCategories.productId, id));

    // Get images
    const images = await db
      .select()
      .from(productImages)
      .where(eq(productImages.productId, id))
      .orderBy(productImages.position);

    // Get current price
    const [currentPrice] = await db
      .select()
      .from(productPrices)
      .where(and(
        eq(productPrices.productId, id),
        or(
          isNull(productPrices.validTo),
          sql`${productPrices.validTo} > NOW()`
        )
      ))
      .orderBy(desc(productPrices.validFrom))
      .limit(1);

    // Get combinations if product type is 'combination'
    let combinations: any[] = [];
    if (productData.product.productType === 'combination') {
      const combs = await db
        .select()
        .from(productCombinations)
        .where(eq(productCombinations.productId, id))
        .orderBy(productCombinations.position);

      // For each combination, get attribute values
      combinations = await Promise.all(
        combs.map(async (comb) => {
          const attrs = await db
            .select()
            .from(productCombinationAttributes)
            .where(eq(productCombinationAttributes.combinationId, comb.id));

          return {
            ...comb,
            attributeValues: attrs.map(a => a.attributeValueId)
          };
        })
      );
    }

    // Get features
    const features = await db
      .select()
      .from(productFeatures)
      .where(eq(productFeatures.productId, id));

    // Get inventory
    const inventory = await db
      .select()
      .from(productInventory)
      .where(eq(productInventory.productId, id));

    const totalInventory = inventory.reduce((sum, inv) => sum + inv.quantity, 0);

    const result = {
      ...productData.product,
      brand: productData.brand?.id ? productData.brand : null,
      supplier: productData.supplier?.id ? productData.supplier : null,
      categories: productCats,
      images,
      currentPrice,
      combinations,
      features,
      inventory,
      totalInventory
    };

    res.json({ data: result });
  } catch (error) {
    next(error);
  }
};

// Create new product
export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      sku, name, slug, shortDescription, description, productType,
      brandId, supplierId, weight, width, height, depth,
      metaTitle, metaDescription, metaKeywords, ogTitle, ogDescription, ogImage, canonicalUrl, robotsIndex, robotsFollow,
      status, categories: cats, price, compareAtPrice
    } = req.body;

    // Check if SKU already exists
    const [existingProduct] = await db.select().from(products).where(eq(products.sku, sku)).limit(1);
    if (existingProduct) {
      throw new AppError(400, 'Product with this SKU already exists', 'SKU_EXISTS');
    }

    // Check if slug already exists
    const [existingSlug] = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
    if (existingSlug) {
      throw new AppError(400, 'Product with this slug already exists', 'SLUG_EXISTS');
    }

    // Validate categories - exactly one must be primary
    const primaryCats = cats.filter((c: any) => c.isPrimary);
    if (primaryCats.length !== 1) {
      throw new AppError(400, 'Exactly one category must be marked as primary', 'INVALID_PRIMARY_CATEGORY');
    }

    // Create product
    const [newProduct] = await db.insert(products).values({
      sku,
      name,
      slug,
      shortDescription,
      description,
      productType: productType || 'simple',
      brandId: brandId || null,
      supplierId: supplierId || null,
      weight: weight ? String(weight) : null,
      width: width ? String(width) : null,
      height: height ? String(height) : null,
      depth: depth ? String(depth) : null,
      metaTitle,
      metaDescription,
      metaKeywords,
      ogTitle,
      ogDescription,
      ogImage,
      canonicalUrl,
      robotsIndex: robotsIndex !== undefined ? robotsIndex : true,
      robotsFollow: robotsFollow !== undefined ? robotsFollow : true,
      status: status || 'draft',
      updatedAt: new Date()
    }).returning();

    // Create category associations
    if (cats && cats.length > 0) {
      await db.insert(productCategories).values(
        cats.map((cat: any) => ({
          productId: newProduct.id,
          categoryId: cat.categoryId,
          isPrimary: cat.isPrimary
        }))
      );
    }

    // Create price
    if (price !== undefined) {
      await db.insert(productPrices).values({
        productId: newProduct.id,
        price: String(price),
        compareAtPrice: compareAtPrice ? String(compareAtPrice) : null,
        currency: 'EUR'
      });
    }

    logger.info(`Created product: ${newProduct.name} (${newProduct.id})`);

    res.status(201).json({ data: newProduct });
  } catch (error) {
    next(error);
  }
};

// Update product
export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if product exists
    const [existingProduct] = await db.select().from(products).where(eq(products.id, id)).limit(1);
    if (!existingProduct) {
      throw new AppError(404, 'Product not found', 'PRODUCT_NOT_FOUND');
    }

    // If SKU is being updated, check uniqueness
    if (updateData.sku && updateData.sku !== existingProduct.sku) {
      const [duplicate] = await db.select().from(products).where(eq(products.sku, updateData.sku)).limit(1);
      if (duplicate) {
        throw new AppError(400, 'Product with this SKU already exists', 'SKU_EXISTS');
      }
    }

    // If slug is being updated, check uniqueness
    if (updateData.slug && updateData.slug !== existingProduct.slug) {
      const [duplicate] = await db.select().from(products).where(eq(products.slug, updateData.slug)).limit(1);
      if (duplicate) {
        throw new AppError(400, 'Product with this slug already exists', 'SLUG_EXISTS');
      }
    }

    // Update product
    const [updatedProduct] = await db.update(products)
      .set({
        ...updateData,
        weight: updateData.weight ? String(updateData.weight) : undefined,
        width: updateData.width ? String(updateData.width) : undefined,
        height: updateData.height ? String(updateData.height) : undefined,
        depth: updateData.depth ? String(updateData.depth) : undefined,
        updatedAt: new Date()
      })
      .where(eq(products.id, id))
      .returning();

    logger.info(`Updated product: ${updatedProduct.name} (${id})`);

    res.json({ data: updatedProduct });
  } catch (error) {
    next(error);
  }
};

// Delete product
export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const [product] = await db.select().from(products).where(eq(products.id, id)).limit(1);
    if (!product) {
      throw new AppError(404, 'Product not found', 'PRODUCT_NOT_FOUND');
    }

    await db.delete(products).where(eq(products.id, id));

    logger.info(`Deleted product: ${product.name} (${id})`);

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
};
