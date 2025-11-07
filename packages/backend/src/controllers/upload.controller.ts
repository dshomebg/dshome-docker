import { Request, Response, NextFunction } from 'express';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { logger } from '../utils/logger';

/**
 * Upload image handler
 * Processes uploaded image with sharp (optimize, resize if needed)
 */
export const uploadImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const originalPath = req.file.path;
    const ext = path.extname(req.file.filename);
    const basename = path.basename(req.file.filename, ext);
    const optimizedFilename = `${basename}-optimized.webp`;
    const optimizedPath = path.join(path.dirname(originalPath), optimizedFilename);

    // Process image with sharp
    await sharp(originalPath)
      .resize(1200, 1200, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({ quality: 85 })
      .toFile(optimizedPath);

    // Delete original file
    fs.unlinkSync(originalPath);

    // Generate URL for the optimized image
    const imageUrl = `/uploads/images/${optimizedFilename}`;

    logger.info(`Image uploaded successfully: ${optimizedFilename}`);

    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        url: imageUrl,
        filename: optimizedFilename
      }
    });

  } catch (error) {
    logger.error('Error uploading image:', error);

    // Clean up file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    next(error);
  }
};

/**
 * Delete image handler
 */
export const deleteImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { filename } = req.params;

    if (!filename) {
      return res.status(400).json({
        success: false,
        message: 'Filename is required'
      });
    }

    const imagePath = path.join(process.cwd(), 'uploads', 'images', filename);

    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    fs.unlinkSync(imagePath);

    logger.info(`Image deleted successfully: ${filename}`);

    res.status(200).json({
      success: true,
      message: 'Image deleted successfully'
    });

  } catch (error) {
    logger.error('Error deleting image:', error);
    next(error);
  }
};
