import { Router } from 'express';
import {
  getImportTemplates,
  getImportTemplate,
  createImportTemplate,
  updateImportTemplate,
  deleteImportTemplate
} from '../controllers/import-templates.controller';
import { authenticate } from '../middleware/auth.middleware';

const router: Router = Router();

// All routes require authentication
// Temporarily disabled for development
// router.use(authenticate);

// Import templates routes
router.get('/', getImportTemplates);
router.get('/:id', getImportTemplate);
router.post('/', createImportTemplate);
router.put('/:id', updateImportTemplate);
router.delete('/:id', deleteImportTemplate);

export default router;
