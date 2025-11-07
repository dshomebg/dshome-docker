import { Router } from 'express';
import {
  getWarehouses,
  getWarehouse,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse
} from '../controllers/warehouses.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
// Temporarily disabled for development
// router.use(authenticate);

router.get('/', getWarehouses);
router.get('/:id', getWarehouse);
router.post('/', createWarehouse);
router.put('/:id', updateWarehouse);
router.delete('/:id', deleteWarehouse);

export default router;
