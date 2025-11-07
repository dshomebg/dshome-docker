import { Router } from 'express';
import * as categoriesController from '../controllers/categories.controller';

const router = Router();

// Category routes
router.get('/', categoriesController.getCategories);
router.get('/tree', categoriesController.getCategoryTree);
router.get('/:id', categoriesController.getCategory);
router.post('/', categoriesController.createCategory);
router.put('/:id', categoriesController.updateCategory);
router.delete('/:id', categoriesController.deleteCategory);

export default router;
