import { Router } from 'express';
import * as categoriesController from '../controllers/categories.controller';

const router: Router = Router();

// Category routes
router.get('/', categoriesController.getCategories);
router.get('/tree', categoriesController.getCategoryTree);

// Category feature weights routes (MUST be before /:id routes!)
router.get('/:id/feature-weights', categoriesController.getCategoryFeatureWeights);
router.put('/:id/feature-weights', categoriesController.updateCategoryFeatureWeights);
router.get('/:id/allowed-feature-groups', categoriesController.getAllowedFeatureGroups);

// Generic category CRUD (MUST be after specific routes!)
router.get('/:id', categoriesController.getCategory);
router.post('/', categoriesController.createCategory);
router.put('/:id', categoriesController.updateCategory);
router.delete('/:id', categoriesController.deleteCategory);

export default router;
