import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { reviews, reviewHelpfulVotes, products, customers } from '../db/schema';
import { eq, desc, and, sql, count, or, gte } from 'drizzle-orm';
import { AppError } from '../middleware/error.middleware';
import { logger } from '../utils/logger';

// Get reviews for a specific product with filtering and sorting
export const getProductReviews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId } = req.params;
    const {
      page = '1',
      limit = '10',
      sort = 'newest',
      rating,
      verifiedOnly
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    // Build conditions
    const conditions = [
      eq(reviews.productId, productId),
      eq(reviews.status, 'approved') // Only show approved reviews
    ];

    if (rating) {
      conditions.push(eq(reviews.rating, parseInt(rating as string)));
    }

    if (verifiedOnly === 'true') {
      conditions.push(eq(reviews.isVerifiedPurchase, true));
    }

    // Build query
    let query = db.select({
      id: reviews.id,
      productId: reviews.productId,
      rating: reviews.rating,
      title: reviews.title,
      content: reviews.content,
      reviewerName: reviews.reviewerName,
      isAnonymous: reviews.isAnonymous,
      isVerifiedPurchase: reviews.isVerifiedPurchase,
      images: reviews.images,
      helpfulCount: reviews.helpfulCount,
      notHelpfulCount: reviews.notHelpfulCount,
      storeReply: reviews.storeReply,
      storeReplyDate: reviews.storeReplyDate,
      createdAt: reviews.createdAt
    }).from(reviews).where(and(...conditions));

    // Apply sorting
    switch (sort) {
      case 'helpful':
        query = query.orderBy(desc(reviews.helpfulCount)) as any;
        break;
      case 'highestRated':
        query = query.orderBy(desc(reviews.rating), desc(reviews.createdAt)) as any;
        break;
      case 'lowestRated':
        query = query.orderBy(reviews.rating, desc(reviews.createdAt)) as any;
        break;
      case 'newest':
      default:
        query = query.orderBy(desc(reviews.createdAt)) as any;
    }

    // Get count with same filters
    const countQuery = db.select({ count: count() })
      .from(reviews)
      .where(and(...conditions));

    const [reviewsList, countResult] = await Promise.all([
      query.limit(limitNum).offset(offset),
      countQuery
    ]);

    const totalCount = Number(countResult[0]?.count || 0);

    logger.info(`Fetched ${reviewsList.length} reviews for product ${productId}`);

    res.json({
      data: reviewsList,
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

// Get review summary and rating breakdown for a product
export const getProductReviewSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId } = req.params;

    // Get rating breakdown
    const breakdown = await db.select({
      rating: reviews.rating,
      count: count()
    })
    .from(reviews)
    .where(and(
      eq(reviews.productId, productId),
      eq(reviews.status, 'approved')
    ))
    .groupBy(reviews.rating);

    // Calculate average rating and total count
    let totalReviews = 0;
    let totalStars = 0;
    const ratingDistribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    breakdown.forEach(({ rating, count: ratingCount }) => {
      const countNum = Number(ratingCount);
      totalReviews += countNum;
      totalStars += rating * countNum;
      ratingDistribution[rating] = countNum;
    });

    const averageRating = totalReviews > 0 ? totalStars / totalReviews : 0;

    // Calculate percentages
    const ratingPercentages = Object.entries(ratingDistribution).reduce((acc, [rating, count]) => {
      acc[Number(rating)] = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
      return acc;
    }, {} as Record<number, number>);

    res.json({
      data: {
        averageRating: Number(averageRating.toFixed(1)),
        totalReviews,
        ratingDistribution,
        ratingPercentages
      }
    });
  } catch (error) {
    next(error);
  }
};

// Create a new review (by customer)
export const createReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      productId,
      customerId,
      rating,
      title,
      content,
      reviewerName,
      reviewerEmail,
      isAnonymous,
      images
    } = req.body;

    // Validation
    if (!rating || rating < 1 || rating > 5) {
      throw new AppError(400, 'Rating must be between 1 and 5', 'INVALID_RATING');
    }

    if (!content || content.length < 50) {
      throw new AppError(400, 'Review content must be at least 50 characters', 'CONTENT_TOO_SHORT');
    }

    // Check if product exists
    const [product] = await db.select().from(products).where(eq(products.id, productId)).limit(1);
    if (!product) {
      throw new AppError(404, 'Product not found', 'PRODUCT_NOT_FOUND');
    }

    // Check if customer already reviewed this product (if not anonymous)
    if (customerId) {
      const [existingReview] = await db.select()
        .from(reviews)
        .where(and(
          eq(reviews.productId, productId),
          eq(reviews.customerId, customerId)
        ))
        .limit(1);

      if (existingReview) {
        throw new AppError(400, 'You have already reviewed this product', 'REVIEW_EXISTS');
      }
    }

    const [newReview] = await db.insert(reviews).values({
      productId,
      customerId: customerId || null,
      rating,
      title: title || null,
      content,
      reviewerName,
      reviewerEmail: reviewerEmail || null,
      isAnonymous: isAnonymous || false,
      isVerifiedPurchase: false, // Default to false, admin will verify
      images: images || [],
      status: 'pending' // All reviews need approval
    }).returning();

    logger.info(`New review created for product ${productId}`);

    res.status(201).json({
      success: true,
      data: newReview,
      message: 'Review submitted successfully. It will be published after approval.'
    });
  } catch (error) {
    next(error);
  }
};

// Update review (admin only)
export const updateReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const [existingReview] = await db.select().from(reviews).where(eq(reviews.id, id)).limit(1);

    if (!existingReview) {
      throw new AppError(404, 'Review not found', 'REVIEW_NOT_FOUND');
    }

    const [updatedReview] = await db.update(reviews)
      .set({
        ...updateData,
        updatedAt: new Date()
      })
      .where(eq(reviews.id, id))
      .returning();

    logger.info(`Review ${id} updated`);

    res.json({
      success: true,
      data: updatedReview
    });
  } catch (error) {
    next(error);
  }
};

// Approve review (admin)
export const approveReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { isVerifiedPurchase } = req.body;

    const [review] = await db.update(reviews)
      .set({
        status: 'approved',
        isVerifiedPurchase: isVerifiedPurchase || false,
        updatedAt: new Date()
      })
      .where(eq(reviews.id, id))
      .returning();

    if (!review) {
      throw new AppError(404, 'Review not found', 'REVIEW_NOT_FOUND');
    }

    logger.info(`Review ${id} approved`);

    res.json({
      success: true,
      data: review,
      message: 'Review approved successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Reject review (admin)
export const rejectReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const [review] = await db.update(reviews)
      .set({
        status: 'rejected',
        updatedAt: new Date()
      })
      .where(eq(reviews.id, id))
      .returning();

    if (!review) {
      throw new AppError(404, 'Review not found', 'REVIEW_NOT_FOUND');
    }

    logger.info(`Review ${id} rejected`);

    res.json({
      success: true,
      data: review,
      message: 'Review rejected'
    });
  } catch (error) {
    next(error);
  }
};

// Add store reply to review (admin)
export const addStoreReply = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { storeReply, repliedBy } = req.body;

    if (!storeReply || storeReply.trim().length === 0) {
      throw new AppError(400, 'Store reply cannot be empty', 'REPLY_EMPTY');
    }

    const [review] = await db.update(reviews)
      .set({
        storeReply,
        storeReplyDate: new Date(),
        storeRepliedBy: repliedBy,
        updatedAt: new Date()
      })
      .where(eq(reviews.id, id))
      .returning();

    if (!review) {
      throw new AppError(404, 'Review not found', 'REVIEW_NOT_FOUND');
    }

    logger.info(`Store reply added to review ${id}`);

    res.json({
      success: true,
      data: review,
      message: 'Reply added successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Vote helpful/not helpful on review
export const voteHelpful = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { customerId, sessionId, isHelpful } = req.body;

    if (!customerId && !sessionId) {
      throw new AppError(400, 'Customer ID or Session ID required', 'VOTER_ID_REQUIRED');
    }

    // Check if already voted
    const voteConditions = [eq(reviewHelpfulVotes.reviewId, id)];
    if (customerId) {
      voteConditions.push(eq(reviewHelpfulVotes.customerId, customerId));
    } else {
      voteConditions.push(eq(reviewHelpfulVotes.sessionId, sessionId));
    }

    const [existingVote] = await db.select()
      .from(reviewHelpfulVotes)
      .where(and(...voteConditions))
      .limit(1);

    if (existingVote) {
      throw new AppError(400, 'You have already voted on this review', 'ALREADY_VOTED');
    }

    // Add vote
    await db.insert(reviewHelpfulVotes).values({
      reviewId: id,
      customerId: customerId || null,
      sessionId: sessionId || null,
      isHelpful
    });

    // Update counts
    if (isHelpful) {
      await db.update(reviews)
        .set({ helpfulCount: sql`${reviews.helpfulCount} + 1` })
        .where(eq(reviews.id, id));
    } else {
      await db.update(reviews)
        .set({ notHelpfulCount: sql`${reviews.notHelpfulCount} + 1` })
        .where(eq(reviews.id, id));
    }

    logger.info(`Vote recorded for review ${id}`);

    res.json({
      success: true,
      message: 'Vote recorded successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Delete review (admin)
export const deleteReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const [deletedReview] = await db.delete(reviews)
      .where(eq(reviews.id, id))
      .returning();

    if (!deletedReview) {
      throw new AppError(404, 'Review not found', 'REVIEW_NOT_FOUND');
    }

    logger.info(`Review ${id} deleted`);

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get all reviews (admin) with filtering
export const getAllReviews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      page = '1',
      limit = '20',
      status,
      productId,
      rating,
      search
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    // Build conditions
    const conditions = [];
    if (status) {
      conditions.push(eq(reviews.status, status as any));
    }
    if (productId) {
      conditions.push(eq(reviews.productId, productId as string));
    }
    if (rating) {
      conditions.push(eq(reviews.rating, parseInt(rating as string)));
    }

    let query = db.select({
      review: reviews,
      product: {
        id: products.id,
        name: products.name,
        slug: products.slug
      }
    })
    .from(reviews)
    .leftJoin(products, eq(reviews.productId, products.id));

    let countQuery = db.select({ count: count() }).from(reviews);

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
      countQuery = countQuery.where(and(...conditions)) as any;
    }

    const [reviewsList, countResult] = await Promise.all([
      query.orderBy(desc(reviews.createdAt)).limit(limitNum).offset(offset),
      countQuery
    ]);

    const totalCount = Number(countResult[0]?.count || 0);

    logger.info(`Fetched ${reviewsList.length} reviews for admin`);

    res.json({
      data: reviewsList,
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
