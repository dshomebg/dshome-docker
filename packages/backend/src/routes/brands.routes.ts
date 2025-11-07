import { Router } from 'express';
import {
  getBrands,
  getBrand,
  createBrand,
  updateBrand,
  deleteBrand
} from '../controllers/brands.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
// Temporarily disabled for development
// router.use(authenticate);

router.get('/', getBrands);
router.get('/:id', getBrand);
router.post('/', createBrand);
router.put('/:id', updateBrand);
router.delete('/:id', deleteBrand);

export default router;
