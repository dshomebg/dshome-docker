import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { wishlists, products, customers } from '../db/schema';
import { eq, desc, and, sql, count, or } from 'drizzle-orm';
import { AppError } from '../middleware/error.middleware';
import { logger } from '../utils/logger';

// Get wishlist items for a customer or guest session
export const getWishlist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { customerId, sessionId } = req.query;

    if (!customerId && !sessionId) {
      throw new AppError(400, 'Customer ID or Session ID required', 'IDENTIFIER_REQUIRED');
    }

    // Build conditions
    const conditions = [];
    if (customerId) {
      conditions.push(eq(wishlists.customerId, customerId as string));
    } else if (sessionId) {
      conditions.push(eq(wishlists.sessionId, sessionId as string));
    }

    // Get wishlist with product details
    const wishlistItems = await db.select({
      wishlist: wishlists,
      product: {
        id: products.id,
        name: products.name,
        slug: products.slug,
        sku: products.sku,
        description: products.description,
        status: products.status
      }
    })
    .from(wishlists)
    .leftJoin(products, eq(wishlists.productId, products.id))
    .where(and(...conditions))
    .orderBy(desc(wishlists.createdAt));

    logger.info(`Fetched wishlist with ${wishlistItems.length} items`);

    res.json({
      success: true,
      data: wishlistItems
    });
  } catch (error) {
    next(error);
  }
};

// Add item to wishlist
export const addToWishlist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      customerId,
      sessionId,
      productId,
      combinationId
    } = req.body;

    // Validation
    if (!customerId && !sessionId) {
      throw new AppError(400, 'Customer ID or Session ID required', 'IDENTIFIER_REQUIRED');
    }

    if (!productId) {
      throw new AppError(400, 'Product ID is required', 'PRODUCT_ID_REQUIRED');
    }

    // Check if product exists
    const [product] = await db.select().from(products).where(eq(products.id, productId)).limit(1);
    if (!product) {
      throw new AppError(404, 'Product not found', 'PRODUCT_NOT_FOUND');
    }

    // Check if item already exists in wishlist
    const existingConditions = [eq(wishlists.productId, productId)];

    if (customerId) {
      existingConditions.push(eq(wishlists.customerId, customerId));
    } else {
      existingConditions.push(eq(wishlists.sessionId, sessionId));
    }

    if (combinationId) {
      existingConditions.push(eq(wishlists.combinationId, combinationId));
    }

    const [existingItem] = await db.select()
      .from(wishlists)
      .where(and(...existingConditions))
      .limit(1);

    if (existingItem) {
      throw new AppError(400, 'Item already exists in wishlist', 'ITEM_EXISTS');
    }

    // Add to wishlist
    const [newWishlistItem] = await db.insert(wishlists).values({
      customerId: customerId || null,
      sessionId: sessionId || null,
      productId,
      combinationId: combinationId || null
    }).returning();

    logger.info(`Item added to wishlist: ${productId}`);

    res.status(201).json({
      success: true,
      data: newWishlistItem,
      message: 'Item added to wishlist successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Remove item from wishlist
export const removeFromWishlist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const [deletedItem] = await db.delete(wishlists)
      .where(eq(wishlists.id, id))
      .returning();

    if (!deletedItem) {
      throw new AppError(404, 'Wishlist item not found', 'ITEM_NOT_FOUND');
    }

    logger.info(`Item removed from wishlist: ${id}`);

    res.json({
      success: true,
      message: 'Item removed from wishlist successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Clear entire wishlist for a customer or session
export const clearWishlist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { customerId, sessionId } = req.body;

    if (!customerId && !sessionId) {
      throw new AppError(400, 'Customer ID or Session ID required', 'IDENTIFIER_REQUIRED');
    }

    const conditions = [];
    if (customerId) {
      conditions.push(eq(wishlists.customerId, customerId));
    } else {
      conditions.push(eq(wishlists.sessionId, sessionId));
    }

    const deletedItems = await db.delete(wishlists)
      .where(and(...conditions))
      .returning();

    logger.info(`Wishlist cleared: ${deletedItems.length} items removed`);

    res.json({
      success: true,
      message: `Wishlist cleared successfully. ${deletedItems.length} items removed.`
    });
  } catch (error) {
    next(error);
  }
};

// Get wishlist item count
export const getWishlistCount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { customerId, sessionId } = req.query;

    if (!customerId && !sessionId) {
      throw new AppError(400, 'Customer ID or Session ID required', 'IDENTIFIER_REQUIRED');
    }

    const conditions = [];
    if (customerId) {
      conditions.push(eq(wishlists.customerId, customerId as string));
    } else {
      conditions.push(eq(wishlists.sessionId, sessionId as string));
    }

    const [result] = await db.select({ count: count() })
      .from(wishlists)
      .where(and(...conditions));

    const itemCount = Number(result?.count || 0);

    res.json({
      success: true,
      data: { count: itemCount }
    });
  } catch (error) {
    next(error);
  }
};

// Merge guest wishlist to customer wishlist (on login/registration)
export const mergeWishlist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { customerId, sessionId } = req.body;

    if (!customerId || !sessionId) {
      throw new AppError(400, 'Both Customer ID and Session ID required', 'IDENTIFIERS_REQUIRED');
    }

    // Get guest wishlist items
    const guestItems = await db.select()
      .from(wishlists)
      .where(eq(wishlists.sessionId, sessionId));

    if (guestItems.length === 0) {
      return res.json({
        success: true,
        message: 'No items to merge',
        data: { mergedCount: 0 }
      });
    }

    // Get existing customer wishlist to avoid duplicates
    const customerItems = await db.select()
      .from(wishlists)
      .where(eq(wishlists.customerId, customerId));

    const existingProductIds = new Set(
      customerItems.map(item =>
        `${item.productId}${item.combinationId ? `-${item.combinationId}` : ''}`
      )
    );

    let mergedCount = 0;

    // Merge items that don't exist in customer wishlist
    for (const guestItem of guestItems) {
      const itemKey = `${guestItem.productId}${guestItem.combinationId ? `-${guestItem.combinationId}` : ''}`;

      if (!existingProductIds.has(itemKey)) {
        await db.insert(wishlists).values({
          customerId,
          sessionId: null,
          productId: guestItem.productId,
          combinationId: guestItem.combinationId
        });
        mergedCount++;
      }
    }

    // Delete guest wishlist items
    await db.delete(wishlists).where(eq(wishlists.sessionId, sessionId));

    logger.info(`Merged ${mergedCount} items from guest to customer wishlist`);

    res.json({
      success: true,
      message: `Successfully merged ${mergedCount} items to your wishlist`,
      data: { mergedCount }
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Get all wishlists with filtering and pagination
export const getAllWishlists = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      page = '1',
      limit = '20',
      customerId,
      productId
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    // Build conditions
    const conditions = [];
    if (customerId) {
      conditions.push(eq(wishlists.customerId, customerId as string));
    }
    if (productId) {
      conditions.push(eq(wishlists.productId, productId as string));
    }

    // Build query with joins
    let query = db.select({
      wishlist: wishlists,
      product: {
        id: products.id,
        name: products.name,
        slug: products.slug,
        sku: products.sku
      },
      customer: {
        id: customers.id,
        firstName: customers.firstName,
        lastName: customers.lastName,
        email: customers.email
      }
    })
    .from(wishlists)
    .leftJoin(products, eq(wishlists.productId, products.id))
    .leftJoin(customers, eq(wishlists.customerId, customers.id));

    let countQuery = db.select({ count: count() }).from(wishlists);

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
      countQuery = countQuery.where(and(...conditions)) as any;
    }

    const [wishlistsList, countResult] = await Promise.all([
      query.orderBy(desc(wishlists.createdAt)).limit(limitNum).offset(offset),
      countQuery
    ]);

    const totalCount = Number(countResult[0]?.count || 0);

    logger.info(`Fetched ${wishlistsList.length} wishlists for admin`);

    res.json({
      data: wishlistsList,
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

// Admin: Get popular wishlist products (most wishlisted items)
export const getPopularWishlistProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { limit = '10' } = req.query;
    const limitNum = parseInt(limit as string);

    const popularProducts = await db.select({
      productId: wishlists.productId,
      wishlistCount: count(),
      product: {
        id: products.id,
        name: products.name,
        slug: products.slug,
        sku: products.sku
      }
    })
    .from(wishlists)
    .leftJoin(products, eq(wishlists.productId, products.id))
    .groupBy(wishlists.productId, products.id, products.name, products.slug, products.sku)
    .orderBy(desc(count()))
    .limit(limitNum);

    logger.info(`Fetched top ${popularProducts.length} popular wishlist products`);

    res.json({
      success: true,
      data: popularProducts
    });
  } catch (error) {
    next(error);
  }
};
