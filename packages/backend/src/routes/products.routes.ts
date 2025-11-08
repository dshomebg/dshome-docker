import { Router } from 'express';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/products.controller';
import { authenticate } from '../middleware/auth.middleware';

const router: Router = Router();

// All routes require authentication
// Temporarily disabled for development
// router.use(authenticate);

router.get('/', getProducts);
router.get('/:id', getProduct);
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

export default router;
