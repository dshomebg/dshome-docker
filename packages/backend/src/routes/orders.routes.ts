import { Router } from 'express';
import * as ordersController from '../controllers/orders.controller';

const router: Router = Router();

// Get all orders
router.get('/', ordersController.getOrders);

// Create new order
router.post('/', ordersController.createOrder);

// Get single order
router.get('/:id', ordersController.getOrder);

// Update order details
router.put('/:id', ordersController.updateOrder);

// Update order status
router.patch('/:id/status', ordersController.updateOrderStatus);

// Delete order
router.delete('/:id', ordersController.deleteOrder);

export default router;
