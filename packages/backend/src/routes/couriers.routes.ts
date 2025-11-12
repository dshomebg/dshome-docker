import { Router } from 'express';
import {
  getCouriers,
  getCourier,
  createCourier,
  updateCourier,
  deleteCourier,
  calculateDeliveryPrice,
} from '../controllers/couriers.controller';

const router: Router = Router();

// Get all couriers
router.get('/', getCouriers);

// Get single courier
router.get('/:id', getCourier);

// Create new courier
router.post('/', createCourier);

// Update courier
router.put('/:id', updateCourier);

// Delete courier
router.delete('/:id', deleteCourier);

// Calculate delivery price
router.post('/calculate-price', calculateDeliveryPrice);

export default router;
