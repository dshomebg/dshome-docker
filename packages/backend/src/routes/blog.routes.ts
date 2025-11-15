import { Router } from 'express';

// Blog Categories
import {
  getBlogCategories,
  getBlogCategoryById,
  getBlogCategoryBySlug,
  createBlogCategory,
  updateBlogCategory,
  deleteBlogCategory,
  getBlogCategoryTree
} from '../controllers/blog-categories.controller';

// Blog Authors
import {
  getBlogAuthors,
  getBlogAuthorById,
  getBlogAuthorBySlug,
  createBlogAuthor,
  updateBlogAuthor,
  deleteBlogAuthor,
  getBlogAuthorsWithStats
} from '../controllers/blog-authors.controller';

// Blog Posts
import {
  getBlogPosts,
  getBlogPostById,
  getBlogPostBySlug,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  trackBlogPostView,
  getBlogStatistics
} from '../controllers/blog-posts.controller';

import { authenticate } from '../middleware/auth.middleware';

const router: Router = Router();

// Authentication temporarily disabled for development
// router.use(authenticate);

// ==================== BLOG CATEGORIES ====================

// Public routes
router.get('/categories', getBlogCategories); // Get all categories with filters
router.get('/categories/tree', getBlogCategoryTree); // Get category tree
router.get('/categories/id/:id', getBlogCategoryById); // Get category by ID
router.get('/categories/slug/:slug', getBlogCategoryBySlug); // Get category by slug

// Admin routes (auth required in production)
router.post('/categories', createBlogCategory); // Create category
router.put('/categories/:id', updateBlogCategory); // Update category
router.delete('/categories/:id', deleteBlogCategory); // Delete category

// ==================== BLOG AUTHORS ====================

// Public routes
router.get('/authors', getBlogAuthors); // Get all authors with filters
router.get('/authors/stats', getBlogAuthorsWithStats); // Get authors with stats
router.get('/authors/id/:id', getBlogAuthorById); // Get author by ID
router.get('/authors/slug/:slug', getBlogAuthorBySlug); // Get author by slug

// Admin routes (auth required in production)
router.post('/authors', createBlogAuthor); // Create author
router.put('/authors/:id', updateBlogAuthor); // Update author
router.delete('/authors/:id', deleteBlogAuthor); // Delete author

// ==================== BLOG POSTS ====================

// Public routes
router.get('/posts', getBlogPosts); // Get all posts with filters
router.get('/posts/id/:id', getBlogPostById); // Get post by ID
router.get('/posts/slug/:slug', getBlogPostBySlug); // Get post by slug
router.post('/posts/:postId/view', trackBlogPostView); // Track post view

// Admin routes (auth required in production)
router.get('/statistics', getBlogStatistics); // Get blog statistics
router.post('/posts', createBlogPost); // Create post
router.put('/posts/:id', updateBlogPost); // Update post
router.delete('/posts/:id', deleteBlogPost); // Delete post

export default router;
