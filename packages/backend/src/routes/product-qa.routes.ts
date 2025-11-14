import { Router } from 'express';
import {
  getProductQuestions,
  askQuestion,
  addAnswer,
  approveQuestion,
  approveAnswer,
  deleteQuestion,
  deleteAnswer,
  getAllQuestions,
  getQuestion,
  getQaSettings,
  updateQaSettings
} from '../controllers/product-qa.controller';
import { authenticate } from '../middleware/auth.middleware';

const router: Router = Router();

// Authentication temporarily disabled for development
// router.use(authenticate);

// Public routes (no auth required)
router.get('/product/:productId', getProductQuestions); // Get questions for a product
router.post('/questions', askQuestion); // Ask a question (guest or customer)
router.post('/questions/:questionId/answers', addAnswer); // Add answer (customer or admin)

// Admin routes (auth required in production)
router.get('/admin/questions', getAllQuestions); // Get all questions for admin
router.get('/admin/questions/:id', getQuestion); // Get single question with answers
router.patch('/questions/:id/approve', approveQuestion); // Approve question
router.patch('/answers/:id/approve', approveAnswer); // Approve answer
router.delete('/questions/:id', deleteQuestion); // Delete question
router.delete('/answers/:id', deleteAnswer); // Delete answer

// Settings routes (auth required in production)
router.get('/settings', getQaSettings); // Get Q&A settings
router.put('/settings', updateQaSettings); // Update Q&A settings

export default router;
