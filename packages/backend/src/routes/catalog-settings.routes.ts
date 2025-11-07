import { Router } from 'express';
import {
  getCatalogSettings,
  updateCatalogSettings,
  getDeliveryTimeTemplates,
  createDeliveryTimeTemplate,
  updateDeliveryTimeTemplate,
  deleteDeliveryTimeTemplate,
  reorderDeliveryTimeTemplates
} from '../controllers/catalog-settings.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
// Temporarily disabled for development
// router.use(authenticate);

// Catalog settings routes
router.get('/', getCatalogSettings);
router.put('/', updateCatalogSettings);

// Delivery time templates routes
router.get('/delivery-time-templates', getDeliveryTimeTemplates);
router.post('/delivery-time-templates', createDeliveryTimeTemplate);
router.put('/delivery-time-templates/reorder', reorderDeliveryTimeTemplates);
router.put('/delivery-time-templates/:id', updateDeliveryTimeTemplate);
router.delete('/delivery-time-templates/:id', deleteDeliveryTimeTemplate);

export default router;
