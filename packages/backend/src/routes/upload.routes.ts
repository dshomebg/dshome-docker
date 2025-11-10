import { Router } from 'express';
import { uploadImage as uploadImageMiddleware } from '../middleware/upload.middleware';
import * as uploadController from '../controllers/upload.controller';

const router: Router = Router();

/**
 * POST /api/upload/image
 * Upload a single image
 */
router.post('/image', uploadImageMiddleware.single('image'), uploadController.uploadImage);

/**
 * DELETE /api/upload/image/:filename
 * Delete an image by filename (legacy - for backward compatibility)
 */
router.delete('/image/:filename', uploadController.deleteImage);

/**
 * DELETE /api/upload/:entityType/:entityId
 * Delete all images for an entity
 */
router.delete('/:entityType/:entityId', uploadController.deleteEntityImages);

export default router;
