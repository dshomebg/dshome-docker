import { Router } from 'express';
import {
  getSeoSettings,
  updateSeoSettings,
  generateProductMeta,
  generateCategoryMeta
} from '../controllers/seo-settings.controller';

const router: Router = Router();

router.get('/', getSeoSettings);
router.put('/', updateSeoSettings);
router.post('/generate-product-meta', generateProductMeta);
router.post('/generate-category-meta', generateCategoryMeta);

export default router;
