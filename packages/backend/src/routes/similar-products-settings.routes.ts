import { Router } from 'express';
import * as similarProductsSettingsController from '../controllers/similar-products-settings.controller';

const router: Router = Router();

// Similar Products Settings routes
router.get('/', similarProductsSettingsController.getSettings);
router.put('/', similarProductsSettingsController.updateSettings);
router.post('/reset', similarProductsSettingsController.resetSettings);

export default router;
