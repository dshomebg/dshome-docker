import { Router } from 'express';
import {
  getAttributeGroups,
  getAttributeGroup,
  createAttributeGroup,
  updateAttributeGroup,
  deleteAttributeGroup,
  getAttributeValues,
  createAttributeValue,
  updateAttributeValue,
  deleteAttributeValue,
  reorderAttributeValues
} from '../controllers/attributes.controller';
import { authenticate } from '../middleware/auth.middleware';

const router: Router = Router();

// All routes require authentication
// Temporarily disabled for development
// router.use(authenticate);

// Attribute Groups routes
router.get('/groups', getAttributeGroups);
router.get('/groups/:id', getAttributeGroup);
router.post('/groups', createAttributeGroup);
router.put('/groups/:id', updateAttributeGroup);
router.delete('/groups/:id', deleteAttributeGroup);

// Attribute Values routes
router.get('/groups/:groupId/values', getAttributeValues);
router.post('/groups/:groupId/values', createAttributeValue);
router.put('/values/:id', updateAttributeValue);
router.delete('/values/:id', deleteAttributeValue);
router.post('/groups/:groupId/values/reorder', reorderAttributeValues);

export default router;
