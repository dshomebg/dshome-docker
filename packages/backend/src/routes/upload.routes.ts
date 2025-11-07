import { Router } from 'express';
import { uploadImage as uploadImageMiddleware } from '../middleware/upload.middleware';
import * as uploadController from '../controllers/upload.controller';

const router = Router();

/**
 * POST /api/upload/image
 * Upload a single image
 */
router.post('/image', uploadImageMiddleware.single('image'), uploadController.uploadImage);

/**
 * DELETE /api/upload/image/:filename
 * Delete an image by filename
 */
router.delete('/image/:filename', uploadController.deleteImage);

export default router;
