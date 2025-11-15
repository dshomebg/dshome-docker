import { Router } from 'express';
import * as similarProductsController from '../controllers/similar-products.controller';

const router: Router = Router();

// Get similar products for a product
router.get('/:id/similar-products', similarProductsController.getSimilarProducts);

export default router;
