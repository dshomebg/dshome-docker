import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { blogAuthors, blogPosts, blogPostViews } from '../db/schema';
import { eq, desc, and, sql, count, or } from 'drizzle-orm';
import { AppError } from '../middleware/error.middleware';
import { logger } from '../utils/logger';

// Get all blog authors with optional filters
export const getBlogAuthors = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      status,
      search,
      page = 1,
      limit = 20
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);

    // Build conditions
    const conditions = [];
    if (status) {
      conditions.push(eq(blogAuthors.status, status as string));
    }
    if (search) {
      conditions.push(
        or(
          sql`${blogAuthors.name} ILIKE ${`%${search}%`}`,
          sql`${blogAuthors.slug} ILIKE ${`%${search}%`}`
        )
      );
    }

    // Get authors
    const authors = await db.select()
      .from(blogAuthors)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(blogAuthors.createdAt))
      .limit(Number(limit))
      .offset(offset);

    // Get total count
    const [{ total }] = await db
      .select({ total: count() })
      .from(blogAuthors)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    logger.info(`Fetched ${authors.length} blog authors`);

    res.json({
      success: true,
      data: authors,
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

// Get blog author by ID
export const getBlogAuthorById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const [author] = await db.select()
      .from(blogAuthors)
      .where(eq(blogAuthors.id, id))
      .limit(1);

    if (!author) {
      throw new AppError(404, 'Blog author not found', 'AUTHOR_NOT_FOUND');
    }

    // Get posts count
    const [{ postsCount }] = await db
      .select({ postsCount: count() })
      .from(blogPosts)
      .where(eq(blogPosts.authorId, id));

    logger.info(`Fetched blog author: ${author.name}`);

    res.json({
      success: true,
      data: {
        ...author,
        postsCount: Number(postsCount)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get blog author by slug
export const getBlogAuthorBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;

    const [author] = await db.select()
      .from(blogAuthors)
      .where(eq(blogAuthors.slug, slug))
      .limit(1);

    if (!author) {
      throw new AppError(404, 'Blog author not found', 'AUTHOR_NOT_FOUND');
    }

    logger.info(`Fetched blog author by slug: ${slug}`);

    res.json({
      success: true,
      data: author
    });
  } catch (error) {
    next(error);
  }
};

// Create blog author
export const createBlogAuthor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      name,
      slug,
      bio,
      image,
      facebookLink,
      instagramLink,
      youtubeLink,
      linkedinLink,
      websiteLink,
      status = 'active'
    } = req.body;

    // Validation
    if (!name || !slug) {
      throw new AppError(400, 'Name and slug are required', 'MISSING_REQUIRED_FIELDS');
    }

    // Check if slug already exists
    const [existingAuthor] = await db.select()
      .from(blogAuthors)
      .where(eq(blogAuthors.slug, slug))
      .limit(1);

    if (existingAuthor) {
      throw new AppError(400, 'Author with this slug already exists', 'SLUG_EXISTS');
    }

    // Create author
    const [author] = await db.insert(blogAuthors)
      .values({
        name,
        slug,
        bio,
        image,
        facebookLink,
        instagramLink,
        youtubeLink,
        linkedinLink,
        websiteLink,
        status,
        updatedAt: new Date()
      })
      .returning();

    logger.info(`Created blog author: ${author.name}`);

    res.status(201).json({
      success: true,
      data: author
    });
  } catch (error) {
    next(error);
  }
};

// Update blog author
export const updateBlogAuthor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const {
      name,
      slug,
      bio,
      image,
      facebookLink,
      instagramLink,
      youtubeLink,
      linkedinLink,
      websiteLink,
      status
    } = req.body;

    // Check if author exists
    const [existingAuthor] = await db.select()
      .from(blogAuthors)
      .where(eq(blogAuthors.id, id))
      .limit(1);

    if (!existingAuthor) {
      throw new AppError(404, 'Blog author not found', 'AUTHOR_NOT_FOUND');
    }

    // Check if new slug conflicts with another author
    if (slug && slug !== existingAuthor.slug) {
      const [slugConflict] = await db.select()
        .from(blogAuthors)
        .where(eq(blogAuthors.slug, slug))
        .limit(1);

      if (slugConflict) {
        throw new AppError(400, 'Author with this slug already exists', 'SLUG_EXISTS');
      }
    }

    // Update author
    const [updatedAuthor] = await db.update(blogAuthors)
      .set({
        ...(name !== undefined && { name }),
        ...(slug !== undefined && { slug }),
        ...(bio !== undefined && { bio }),
        ...(image !== undefined && { image }),
        ...(facebookLink !== undefined && { facebookLink }),
        ...(instagramLink !== undefined && { instagramLink }),
        ...(youtubeLink !== undefined && { youtubeLink }),
        ...(linkedinLink !== undefined && { linkedinLink }),
        ...(websiteLink !== undefined && { websiteLink }),
        ...(status !== undefined && { status }),
        updatedAt: new Date()
      })
      .where(eq(blogAuthors.id, id))
      .returning();

    logger.info(`Updated blog author: ${updatedAuthor.name}`);

    res.json({
      success: true,
      data: updatedAuthor
    });
  } catch (error) {
    next(error);
  }
};

// Delete blog author
export const deleteBlogAuthor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Check if author exists
    const [author] = await db.select()
      .from(blogAuthors)
      .where(eq(blogAuthors.id, id))
      .limit(1);

    if (!author) {
      throw new AppError(404, 'Blog author not found', 'AUTHOR_NOT_FOUND');
    }

    // Check if author has posts
    const [{ postsCount }] = await db
      .select({ postsCount: count() })
      .from(blogPosts)
      .where(eq(blogPosts.authorId, id));

    if (Number(postsCount) > 0) {
      throw new AppError(400, 'Cannot delete author with existing posts', 'AUTHOR_HAS_POSTS');
    }

    // Delete author
    await db.delete(blogAuthors)
      .where(eq(blogAuthors.id, id));

    logger.info(`Deleted blog author: ${author.name}`);

    res.json({
      success: true,
      message: 'Blog author deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get blog authors with statistics
export const getBlogAuthorsWithStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { limit = 10 } = req.query;

    // Get authors with post counts and total views
    const authorsWithStats = await db
      .select({
        author: blogAuthors,
        postsCount: count(blogPosts.id),
        totalViews: sql<number>`COALESCE(SUM(${blogPosts.viewsCount}), 0)`
      })
      .from(blogAuthors)
      .leftJoin(blogPosts, eq(blogAuthors.id, blogPosts.authorId))
      .where(eq(blogAuthors.status, 'active'))
      .groupBy(blogAuthors.id)
      .orderBy(desc(sql`COALESCE(SUM(${blogPosts.viewsCount}), 0)`))
      .limit(Number(limit));

    logger.info(`Fetched ${authorsWithStats.length} blog authors with stats`);

    res.json({
      success: true,
      data: authorsWithStats
    });
  } catch (error) {
    next(error);
  }
};
