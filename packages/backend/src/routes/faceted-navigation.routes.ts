import { Router } from 'express';
import {
  getFilterTemplates,
  getFilterTemplate,
  createFilterTemplate,
  updateFilterTemplate,
  deleteFilterTemplate,
  getFilterTemplateItems,
  createFilterTemplateItem,
  updateFilterTemplateItem,
  deleteFilterTemplateItem,
  reorderFilterTemplateItems
} from '../controllers/faceted-navigation.controller';

const router: Router = Router();

// Filter template routes
router.get('/', getFilterTemplates);
router.get('/:id', getFilterTemplate);
router.post('/', createFilterTemplate);
router.put('/:id', updateFilterTemplate);
router.delete('/:id', deleteFilterTemplate);

// Filter template items routes
router.get('/:templateId/items', getFilterTemplateItems);
router.post('/:templateId/items', createFilterTemplateItem);
router.put('/:templateId/items/reorder', reorderFilterTemplateItems);
router.put('/items/:id', updateFilterTemplateItem);
router.delete('/items/:id', deleteFilterTemplateItem);

export default router;
