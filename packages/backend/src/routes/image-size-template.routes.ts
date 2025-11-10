import { Router } from 'express';
import {
  getImageSizeTemplates,
  getImageSizeTemplate,
  createImageSizeTemplate,
  updateImageSizeTemplate,
  deleteImageSizeTemplate,
  toggleImageSizeTemplateActive,
  getActiveTemplatesByType,
  regenerateTemplateImages
} from '../controllers/image-size-template.controller';

const router: Router = Router();

// Get all templates
router.get('/', getImageSizeTemplates);

// Get active templates by entity type
router.get('/active/:entityType', getActiveTemplatesByType);

// Get single template
router.get('/:id', getImageSizeTemplate);

// Create new template
router.post('/', createImageSizeTemplate);

// Update template
router.put('/:id', updateImageSizeTemplate);

// Toggle active status
router.patch('/:id/toggle-active', toggleImageSizeTemplateActive);

// Regenerate images for template
router.post('/:id/regenerate', regenerateTemplateImages);

// Delete template
router.delete('/:id', deleteImageSizeTemplate);

export default router;
