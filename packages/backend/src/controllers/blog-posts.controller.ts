import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { blogPosts, blogCategories, blogAuthors, blogPostViews } from '../db/schema';
import { eq, desc, and, sql, count, or } from 'drizzle-orm';
import { AppError } from '../middleware/error.middleware';
import { logger } from '../utils/logger';

// Get all blog posts with optional filters
export const getBlogPosts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      status,
      categoryId,
      authorId,
      search,
      page = 1,
      limit = 20
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);

    // Build conditions
    const conditions = [];
    if (status) {
      conditions.push(eq(blogPosts.status, status as "draft" | "published" | "archived"));
    }
    if (categoryId) {
      conditions.push(eq(blogPosts.categoryId, categoryId as string));
    }
    if (authorId) {
      conditions.push(eq(blogPosts.authorId, authorId as string));
    }
    if (search) {
      conditions.push(
        or(
          sql`${blogPosts.title} ILIKE ${`%${search}%`}`,
          sql`${blogPosts.slug} ILIKE ${`%${search}%`}`,
          sql`${blogPosts.excerpt} ILIKE ${`%${search}%`}`
        )
      );
    }

    // Get posts with category and author
    const posts = await db.select({
      post: blogPosts,
      category: blogCategories,
      author: blogAuthors
    })
    .from(blogPosts)
    .leftJoin(blogCategories, eq(blogPosts.categoryId, blogCategories.id))
    .leftJoin(blogAuthors, eq(blogPosts.authorId, blogAuthors.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(blogPosts.publishedAt), desc(blogPosts.createdAt))
    .limit(Number(limit))
    .offset(offset);

    // Get total count
    const [{ total }] = await db
      .select({ total: count() })
      .from(blogPosts)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    logger.info(`Fetched ${posts.length} blog posts`);

    res.json({
      success: true,
      data: posts,
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

// Get blog post by ID
export const getBlogPostById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const [result] = await db.select({
      post: blogPosts,
      category: blogCategories,
      author: blogAuthors
    })
    .from(blogPosts)
    .leftJoin(blogCategories, eq(blogPosts.categoryId, blogCategories.id))
    .leftJoin(blogAuthors, eq(blogPosts.authorId, blogAuthors.id))
    .where(eq(blogPosts.id, id))
    .limit(1);

    if (!result) {
      throw new AppError(404, 'Blog post not found', 'POST_NOT_FOUND');
    }

    logger.info(`Fetched blog post: ${result.post.title}`);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// Get blog post by slug
export const getBlogPostBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;

    const [result] = await db.select({
      post: blogPosts,
      category: blogCategories,
      author: blogAuthors
    })
    .from(blogPosts)
    .leftJoin(blogCategories, eq(blogPosts.categoryId, blogCategories.id))
    .leftJoin(blogAuthors, eq(blogPosts.authorId, blogAuthors.id))
    .where(eq(blogPosts.slug, slug))
    .limit(1);

    if (!result) {
      throw new AppError(404, 'Blog post not found', 'POST_NOT_FOUND');
    }

    logger.info(`Fetched blog post by slug: ${slug}`);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// Create blog post
export const createBlogPost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      title,
      slug,
      excerpt,
      content,
      featuredImage,
      categoryId,
      authorId,
      status = 'draft',
      publishedAt,
      metaTitle,
      metaDescription,
      canonicalUrl,
      robotsIndex = true,
      robotsFollow = true
    } = req.body;

    // Validation
    if (!title || !slug || !content) {
      throw new AppError(400, 'Title, slug, and content are required', 'MISSING_REQUIRED_FIELDS');
    }

    // Check if slug already exists
    const [existingPost] = await db.select()
      .from(blogPosts)
      .where(eq(blogPosts.slug, slug))
      .limit(1);

    if (existingPost) {
      throw new AppError(400, 'Post with this slug already exists', 'SLUG_EXISTS');
    }

    // Validate category if provided
    if (categoryId) {
      const [category] = await db.select()
        .from(blogCategories)
        .where(eq(blogCategories.id, categoryId))
        .limit(1);

      if (!category) {
        throw new AppError(404, 'Category not found', 'CATEGORY_NOT_FOUND');
      }
    }

    // Validate author if provided
    if (authorId) {
      const [author] = await db.select()
        .from(blogAuthors)
        .where(eq(blogAuthors.id, authorId))
        .limit(1);

      if (!author) {
        throw new AppError(404, 'Author not found', 'AUTHOR_NOT_FOUND');
      }
    }

    // Create post
    const [post] = await db.insert(blogPosts)
      .values({
        title,
        slug,
        excerpt,
        content,
        featuredImage,
        categoryId: categoryId || null,
        authorId: authorId || null,
        status,
        publishedAt: publishedAt ? new Date(publishedAt) : (status === 'published' ? new Date() : null),
        metaTitle,
        metaDescription,
        canonicalUrl,
        robotsIndex,
        robotsFollow,
        updatedAt: new Date()
      })
      .returning();

    logger.info(`Created blog post: ${post.title}`);

    res.status(201).json({
      success: true,
      data: post
    });
  } catch (error) {
    next(error);
  }
};

// Update blog post
export const updateBlogPost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const {
      title,
      slug,
      excerpt,
      content,
      featuredImage,
      categoryId,
      authorId,
      status,
      publishedAt,
      metaTitle,
      metaDescription,
      canonicalUrl,
      robotsIndex,
      robotsFollow
    } = req.body;

    // Check if post exists
    const [existingPost] = await db.select()
      .from(blogPosts)
      .where(eq(blogPosts.id, id))
      .limit(1);

    if (!existingPost) {
      throw new AppError(404, 'Blog post not found', 'POST_NOT_FOUND');
    }

    // Check if new slug conflicts with another post
    if (slug && slug !== existingPost.slug) {
      const [slugConflict] = await db.select()
        .from(blogPosts)
        .where(eq(blogPosts.slug, slug))
        .limit(1);

      if (slugConflict) {
        throw new AppError(400, 'Post with this slug already exists', 'SLUG_EXISTS');
      }
    }

    // Validate category if provided
    if (categoryId !== undefined && categoryId !== null) {
      const [category] = await db.select()
        .from(blogCategories)
        .where(eq(blogCategories.id, categoryId))
        .limit(1);

      if (!category) {
        throw new AppError(404, 'Category not found', 'CATEGORY_NOT_FOUND');
      }
    }

    // Validate author if provided
    if (authorId !== undefined && authorId !== null) {
      const [author] = await db.select()
        .from(blogAuthors)
        .where(eq(blogAuthors.id, authorId))
        .limit(1);

      if (!author) {
        throw new AppError(404, 'Author not found', 'AUTHOR_NOT_FOUND');
      }
    }

    // Handle publish date logic
    let newPublishedAt = publishedAt !== undefined ? (publishedAt ? new Date(publishedAt) : null) : undefined;
    if (status === 'published' && !existingPost.publishedAt && newPublishedAt === undefined) {
      newPublishedAt = new Date();
    }

    // Update post
    const [updatedPost] = await db.update(blogPosts)
      .set({
        ...(title !== undefined && { title }),
        ...(slug !== undefined && { slug }),
        ...(excerpt !== undefined && { excerpt }),
        ...(content !== undefined && { content }),
        ...(featuredImage !== undefined && { featuredImage }),
        ...(categoryId !== undefined && { categoryId: categoryId || null }),
        ...(authorId !== undefined && { authorId: authorId || null }),
        ...(status !== undefined && { status }),
        ...(newPublishedAt !== undefined && { publishedAt: newPublishedAt }),
        ...(metaTitle !== undefined && { metaTitle }),
        ...(metaDescription !== undefined && { metaDescription }),
        ...(canonicalUrl !== undefined && { canonicalUrl }),
        ...(robotsIndex !== undefined && { robotsIndex }),
        ...(robotsFollow !== undefined && { robotsFollow }),
        updatedAt: new Date()
      })
      .where(eq(blogPosts.id, id))
      .returning();

    logger.info(`Updated blog post: ${updatedPost.title}`);

    res.json({
      success: true,
      data: updatedPost
    });
  } catch (error) {
    next(error);
  }
};

// Delete blog post
export const deleteBlogPost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Check if post exists
    const [post] = await db.select()
      .from(blogPosts)
      .where(eq(blogPosts.id, id))
      .limit(1);

    if (!post) {
      throw new AppError(404, 'Blog post not found', 'POST_NOT_FOUND');
    }

    // Delete post (views will be cascade deleted)
    await db.delete(blogPosts)
      .where(eq(blogPosts.id, id));

    logger.info(`Deleted blog post: ${post.title}`);

    res.json({
      success: true,
      message: 'Blog post deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Track blog post view
export const trackBlogPostView = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { postId } = req.params;
    const ipAddress = req.ip || req.socket.remoteAddress || null;
    const userAgent = req.headers['user-agent'] || null;

    // Check if post exists
    const [post] = await db.select()
      .from(blogPosts)
      .where(eq(blogPosts.id, postId))
      .limit(1);

    if (!post) {
      throw new AppError(404, 'Blog post not found', 'POST_NOT_FOUND');
    }

    // Record view
    await db.insert(blogPostViews)
      .values({
        postId,
        ipAddress,
        userAgent
      });

    // Increment view count
    await db.update(blogPosts)
      .set({
        viewsCount: sql`${blogPosts.viewsCount} + 1`
      })
      .where(eq(blogPosts.id, postId));

    logger.info(`Tracked view for blog post: ${post.title}`);

    res.json({
      success: true,
      message: 'View tracked successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get blog statistics
export const getBlogStatistics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get total posts count by status
    const [totalStats] = await db
      .select({
        totalPosts: count(),
        publishedPosts: sql<number>`COUNT(*) FILTER (WHERE ${blogPosts.status} = 'published')`,
        draftPosts: sql<number>`COUNT(*) FILTER (WHERE ${blogPosts.status} = 'draft')`
      })
      .from(blogPosts);

    // Get total categories count
    const [categoriesCount] = await db
      .select({ total: count() })
      .from(blogCategories);

    // Get total authors count
    const [authorsCount] = await db
      .select({ total: count() })
      .from(blogAuthors);

    // Get total views
    const [viewsCount] = await db
      .select({ total: sql<number>`SUM(${blogPosts.viewsCount})` })
      .from(blogPosts);

    // Get popular posts (top 10 by views)
    const popularPosts = await db
      .select({
        post: blogPosts,
        category: blogCategories,
        author: blogAuthors
      })
      .from(blogPosts)
      .leftJoin(blogCategories, eq(blogPosts.categoryId, blogCategories.id))
      .leftJoin(blogAuthors, eq(blogPosts.authorId, blogAuthors.id))
      .where(eq(blogPosts.status, 'published'))
      .orderBy(desc(blogPosts.viewsCount))
      .limit(10);

    // Get recent posts
    const recentPosts = await db
      .select({
        post: blogPosts,
        category: blogCategories,
        author: blogAuthors
      })
      .from(blogPosts)
      .leftJoin(blogCategories, eq(blogPosts.categoryId, blogCategories.id))
      .leftJoin(blogAuthors, eq(blogPosts.authorId, blogAuthors.id))
      .orderBy(desc(blogPosts.createdAt))
      .limit(10);

    logger.info('Fetched blog statistics');

    res.json({
      success: true,
      data: {
        totalPosts: Number(totalStats.totalPosts),
        publishedPosts: Number(totalStats.publishedPosts),
        draftPosts: Number(totalStats.draftPosts),
        totalCategories: Number(categoriesCount.total),
        totalAuthors: Number(authorsCount.total),
        totalViews: Number(viewsCount.total || 0),
        popularPosts,
        recentPosts
      }
    });
  } catch (error) {
    next(error);
  }
};
