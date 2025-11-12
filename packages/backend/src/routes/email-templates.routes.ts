import { Router } from 'express';
import {
  getEmailTemplates,
  getEmailTemplate,
  createEmailTemplate,
  updateEmailTemplate,
  deleteEmailTemplate,
  getAvailableVariables,
  sendTestEmail,
} from '../controllers/email-templates.controller';

const router: Router = Router();

// Get all email templates
router.get('/', getEmailTemplates);

// Get available variables
router.get('/variables', getAvailableVariables);

// Get single email template
router.get('/:id', getEmailTemplate);

// Create new email template
router.post('/', createEmailTemplate);

// Update email template
router.put('/:id', updateEmailTemplate);

// Delete email template
router.delete('/:id', deleteEmailTemplate);

// Send test email
router.post('/:id/send-test', sendTestEmail);

export default router;
