import { Router } from 'express';
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  getWishlistCount,
  mergeWishlist,
  getAllWishlists,
  getPopularWishlistProducts
} from '../controllers/wishlists.controller';
import { authenticate } from '../middleware/auth.middleware';

const router: Router = Router();

// Authentication temporarily disabled for development
// router.use(authenticate);

// Public routes (no auth required)
router.get('/', getWishlist); // Get wishlist by customerId or sessionId
router.get('/count', getWishlistCount); // Get wishlist item count
router.post('/', addToWishlist); // Add item to wishlist
router.post('/merge', mergeWishlist); // Merge guest wishlist to customer wishlist
router.delete('/clear', clearWishlist); // Clear entire wishlist
router.delete('/:id', removeFromWishlist); // Remove specific item

// Admin routes (auth required in production)
router.get('/admin/all', getAllWishlists); // Get all wishlists
router.get('/admin/popular', getPopularWishlistProducts); // Get popular wishlist products

export default router;
