import { Router } from 'express';
import * as featuresController from '../controllers/features.controller';

const router: Router = Router();

// Feature Groups
router.get('/groups', featuresController.getFeatureGroups);
router.get('/groups/:id', featuresController.getFeatureGroup);
router.post('/groups', featuresController.createFeatureGroup);
router.put('/groups/:id', featuresController.updateFeatureGroup);
router.delete('/groups/:id', featuresController.deleteFeatureGroup);

// Feature Values
router.get('/groups/:groupId/values', featuresController.getFeatureValues);
router.post('/groups/:groupId/values', featuresController.createFeatureValue);
router.put('/values/:id', featuresController.updateFeatureValue);
router.delete('/values/:id', featuresController.deleteFeatureValue);
router.post('/groups/:groupId/values/reorder', featuresController.reorderFeatureValues);

export default router;
