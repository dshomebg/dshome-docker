import { Router } from 'express';
import {
  getOrderStatuses,
  getOrderStatus,
  createOrderStatus,
  updateOrderStatus,
  deleteOrderStatus,
} from '../controllers/order-statuses.controller';

const router: Router = Router();

router.get('/', getOrderStatuses);
router.get('/:id', getOrderStatus);
router.post('/', createOrderStatus);
router.put('/:id', updateOrderStatus);
router.delete('/:id', deleteOrderStatus);

export default router;
