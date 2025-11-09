import { Router } from 'express';
import {
  getGeneralSettings,
  updateGeneralSettings
} from '../controllers/general-settings.controller';

const router: Router = Router();

router.get('/', getGeneralSettings);
router.put('/', updateGeneralSettings);

export default router;
