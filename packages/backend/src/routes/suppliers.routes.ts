import { Router } from 'express';
import {
  getSuppliers,
  getSupplier,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  getDefaultSupplier
} from '../controllers/suppliers.controller';
import { authenticate } from '../middleware/auth.middleware';

const router: Router = Router();

// All routes require authentication
// Temporarily disabled for development
// router.use(authenticate);

router.get('/', getSuppliers);
router.get('/default', getDefaultSupplier);
router.get('/:id', getSupplier);
router.post('/', createSupplier);
router.put('/:id', updateSupplier);
router.delete('/:id', deleteSupplier);

export default router;
