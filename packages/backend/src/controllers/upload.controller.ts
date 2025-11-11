import { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { logger } from '../utils/logger';
import { ImageProcessingService } from '../services/image-processing.service';
import { db } from '../db';
import { products, categories, brands, generalSettings } from '../db/schema';
import { eq } from 'drizzle-orm';

/**
 * Upload image handler
 * Processes uploaded image and generates all active size templates
 */
export const uploadImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Validate against database settings
    const [settings] = await db.select().from(generalSettings).limit(1);

    if (settings) {
      // Check file size
      const maxSizeBytes = settings.maxImageUploadSizeMb * 1024 * 1024;
      if (req.file.size > maxSizeBytes) {
        // Clean up uploaded file
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }

        return res.status(400).json({
          success: false,
          message: `File size exceeds maximum allowed size of ${settings.maxImageUploadSizeMb}MB`
        });
      }

      // Check file format
      const allowedFormats = settings.allowedImageFormats as string[];
      const fileExtension = path.extname(req.file.originalname).toLowerCase().replace('.', '');
      const mimeTypeMap: Record<string, string[]> = {
        'jpeg': ['image/jpeg', 'image/jpg'],
        'jpg': ['image/jpeg', 'image/jpg'],
        'png': ['image/png'],
        'webp': ['image/webp'],
        'gif': ['image/gif']
      };

      let isFormatAllowed = false;
      for (const format of allowedFormats) {
        const allowedMimes = mimeTypeMap[format.toLowerCase()] || [];
        if (allowedMimes.includes(req.file.mimetype) || fileExtension === format.toLowerCase()) {
          isFormatAllowed = true;
          break;
        }
      }

      if (!isFormatAllowed) {
        // Clean up uploaded file
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }

        return res.status(400).json({
          success: false,
          message: `File format not allowed. Allowed formats: ${allowedFormats.join(', ').toUpperCase()}`
        });
      }
    }

    const { entityType, entityId } = req.body;

    logger.info('Upload request received:', {
      entityType,
      entityId,
      filename: req.file.originalname,
      bodyKeys: Object.keys(req.body)
    });

    // Backwards compatibility: if entityType/entityId not provided, return legacy behavior
    if (!entityType || !entityId) {
      logger.warn('Legacy upload without entityType/entityId - returning simple optimized image');

      // For backward compatibility, just return the uploaded file path
      const imageUrl = `/uploads/images/${req.file.filename}`;

      return res.status(200).json({
        success: true,
        message: 'Image uploaded successfully (legacy mode)',
        data: {
          url: imageUrl,
          filename: req.file.filename
        }
      });
    }

    // Validate entityType
    const validEntityTypes = ['product', 'category', 'brand', 'blog'];
    if (!validEntityTypes.includes(entityType)) {
      // Clean up uploaded file
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      return res.status(400).json({
        success: false,
        message: `Invalid entityType. Must be one of: ${validEntityTypes.join(', ')}`
      });
    }

    // Fetch entity name from database for SEO-friendly filenames
    let entityName: string | undefined;
    try {
      if (entityType === 'product') {
        const product = await db.query.products.findFirst({
          where: eq(products.id, entityId),
          columns: { name: true }
        });
        entityName = product?.name;
      } else if (entityType === 'category') {
        const category = await db.query.categories.findFirst({
          where: eq(categories.id, entityId),
          columns: { name: true }
        });
        entityName = category?.name;
      } else if (entityType === 'brand') {
        const brand = await db.query.brands.findFirst({
          where: eq(brands.id, entityId),
          columns: { name: true }
        });
        entityName = brand?.name;
      }
      // Note: 'blog' entityType is supported but blogPosts table not created yet

      logger.info(`Entity name for ${entityType} ${entityId}: ${entityName || 'not found'}`);
    } catch (error) {
      logger.warn(`Failed to fetch entity name for ${entityType} ${entityId}:`, error);
      // Continue without entity name - will use ID only
    }

    // Generate all image sizes
    const result = await ImageProcessingService.generateAllSizes(
      req.file.path,
      entityType,
      entityId,
      entityName,
      req.file.originalname
    );

    // Delete temporary multer file
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    // Format response with all URLs
    const urls: Record<string, string> = {
      original: result.original.url
    };

    for (const [sizeName, sizeData] of Object.entries(result.sizes)) {
      urls[sizeName] = sizeData.url;
    }

    logger.info(`Image uploaded and processed for ${entityType} ${entityId}: ${Object.keys(result.sizes).length} sizes generated`);

    res.status(200).json({
      success: true,
      message: 'Image uploaded and processed successfully',
      data: {
        urls,
        originalUrl: result.original.url,
        generatedSizes: Object.keys(result.sizes)
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
 * Delete all images for an entity
 */
export const deleteEntityImages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { entityType, entityId } = req.params;

    if (!entityType || !entityId) {
      return res.status(400).json({
        success: false,
        message: 'entityType and entityId are required'
      });
    }

    // Validate entityType
    const validEntityTypes = ['product', 'category', 'brand', 'blog'];
    if (!validEntityTypes.includes(entityType)) {
      return res.status(400).json({
        success: false,
        message: `Invalid entityType. Must be one of: ${validEntityTypes.join(', ')}`
      });
    }

    await ImageProcessingService.deleteEntityImages(entityType, entityId);

    logger.info(`All images deleted for ${entityType} ${entityId}`);

    res.status(200).json({
      success: true,
      message: 'All images deleted successfully'
    });

  } catch (error) {
    logger.error('Error deleting images:', error);
    next(error);
  }
};

/**
 * Delete image handler (legacy - for backward compatibility)
 * @deprecated Use deleteEntityImages instead
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
