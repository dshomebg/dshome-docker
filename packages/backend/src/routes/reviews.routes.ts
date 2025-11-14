import { Router } from 'express';
import {
  getProductReviews,
  getProductReviewSummary,
  createReview,
  updateReview,
  approveReview,
  rejectReview,
  addStoreReply,
  voteHelpful,
  deleteReview,
  getAllReviews
} from '../controllers/reviews.controller';
import { authenticate } from '../middleware/auth.middleware';

const router: Router = Router();

// Authentication temporarily disabled for development
// router.use(authenticate);

// Public routes (no auth required)
router.get('/product/:productId', getProductReviews); // Get reviews for a product
router.get('/product/:productId/summary', getProductReviewSummary); // Get rating breakdown
router.post('/', createReview); // Create review (customer)
router.post('/:id/helpful', voteHelpful); // Vote helpful

// Admin routes (auth required in production)
router.get('/admin/all', getAllReviews); // Get all reviews for admin
router.put('/:id', updateReview); // Update review (admin)
router.patch('/:id/approve', approveReview); // Approve review
router.patch('/:id/reject', rejectReview); // Reject review
router.post('/:id/reply', addStoreReply); // Add store reply
router.delete('/:id', deleteReview); // Delete review

export default router;
