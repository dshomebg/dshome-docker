import { Router } from 'express';
import { getRichSnippetsSettings, updateRichSnippetsSettings } from '../controllers/rich-snippets-settings.controller';

const router: Router = Router();

router.get('/', getRichSnippetsSettings);
router.put('/', updateRichSnippetsSettings);

export default router;
