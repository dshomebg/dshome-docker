import { Router } from 'express';
import authRoutes from './auth.routes';
import healthRoutes from './health.routes';
import brandsRoutes from './brands.routes';
import suppliersRoutes from './suppliers.routes';
import warehousesRoutes from './warehouses.routes';
import attributesRoutes from './attributes.routes';
import featuresRoutes from './features.routes';
import categoriesRoutes from './categories.routes';
import catalogSettingsRoutes from './catalog-settings.routes';
import facetedNavigationRoutes from './faceted-navigation.routes';
import uploadRoutes from './upload.routes';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/brands', brandsRoutes);
router.use('/suppliers', suppliersRoutes);
router.use('/warehouses', warehousesRoutes);
router.use('/attributes', attributesRoutes);
router.use('/features', featuresRoutes);
router.use('/categories', categoriesRoutes);
router.use('/catalog-settings', catalogSettingsRoutes);
router.use('/faceted-navigation', facetedNavigationRoutes);
router.use('/upload', uploadRoutes);

export default router;
