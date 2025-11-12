import { Router } from 'express';
import * as customersController from '../controllers/customers.controller';

const router: Router = Router();

// Get all customers
router.get('/', customersController.getCustomers);

// Get single customer
router.get('/:id', customersController.getCustomer);

// Create new customer
router.post('/', customersController.createCustomer);

// Update customer
router.put('/:id', customersController.updateCustomer);

// Delete customer
router.delete('/:id', customersController.deleteCustomer);

// Get customer statistics
router.get('/:id/stats', customersController.getCustomerStats);

// Change customer password
router.patch('/:id/password', customersController.changeCustomerPassword);

export default router;
