import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { db } from '../db';
import { imageFiles, type ImageFile } from '../db/schema';
import { ImageSizeTemplateService } from './image-size-template.service';
import { logger } from '../utils/logger';
import { AppError } from '../middleware/error.middleware';
import { eq, and, like } from 'drizzle-orm';

/**
 * Image Processing Service
 * Handles image upload, processing, and generation of multiple sizes
 */
export class ImageProcessingService {
  /**
   * Cyrillic to Latin transliteration map for Bulgarian
   */
  private static readonly translitMap: Record<string, string> = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ж': 'zh', 'з': 'z',
    'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p',
    'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch',
    'ш': 'sh', 'щ': 'sht', 'ъ': 'a', 'ь': 'y', 'ю': 'yu', 'я': 'ya',
    'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ж': 'Zh', 'З': 'Z',
    'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M', 'Н': 'N', 'О': 'O', 'П': 'P',
    'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U', 'Ф': 'F', 'Х': 'H', 'Ц': 'Ts', 'Ч': 'Ch',
    'Ш': 'Sh', 'Щ': 'Sht', 'Ъ': 'A', 'Ь': 'Y', 'Ю': 'Yu', 'Я': 'Ya'
  };

  /**
   * Generate SEO-friendly slug from entity name
   * Transliterates Cyrillic, removes special chars, converts to lowercase
   */
  private static generateSlug(name: string): string {
    // Transliterate Cyrillic characters
    let slug = name.split('').map(char => this.translitMap[char] || char).join('');

    // Convert to lowercase, replace spaces and special chars with hyphens
    slug = slug
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/[\s_]+/g, '-')  // Replace spaces and underscores with hyphens
      .replace(/-+/g, '-')       // Replace multiple hyphens with single hyphen
      .replace(/^-+|-+$/g, '');  // Trim hyphens from start and end

    // Limit length to 50 characters for file system compatibility
    if (slug.length > 50) {
      slug = slug.substring(0, 50).replace(/-+$/, '');
    }

    return slug || 'image'; // Fallback if slug is empty
  }

  /**
   * Generate filename with SEO-friendly name
   * Format: {slug}-{sizeName}-{shortId}-{timestamp}.{ext}
   * Example: test-plochki-product-cart-77c9-1701234567.webp
   */
  private static generateFilename(
    entityName: string | undefined,
    entityId: string,
    sizeName: string,
    ext: string,
    timestamp?: string
  ): string {
    // Get short ID (last 8 characters of UUID)
    const shortId = entityId.slice(-8);

    // Use provided timestamp or generate new one for uniqueness
    const uniqueId = timestamp || Date.now().toString();

    // If no entity name provided, use ID only
    if (!entityName) {
      return `${entityId}-${sizeName}-${uniqueId}.${ext}`;
    }

    // Generate SEO-friendly slug
    const slug = this.generateSlug(entityName);

    // Format: {slug}-{sizeName}-{shortId}-{timestamp}.{ext}
    return `${slug}-${sizeName}-${shortId}-${uniqueId}.${ext}`;
  }

  /**
   * Get subdirectory name based on entity ID (000-099)
   * Example: ID ending in 23 -> "023"
   */
  private static getSubdirectory(entityId: string): string {
    // Extract last 2 digits from UUID or ID
    const numericPart = entityId.replace(/[^0-9]/g, '').slice(-2);
    const dirNum = parseInt(numericPart || '0', 10);
    return String(dirNum).padStart(3, '0');
  }

  /**
   * Get full path for image file
   */
  private static getImagePath(
    entityType: string,
    sizeName: string,
    entityId: string,
    filename: string
  ): string {
    const subdir = this.getSubdirectory(entityId);
    const basePath = path.join(process.cwd(), 'uploads');

    // Pluralize entity type
    const entityFolder = entityType === 'product' ? 'products'
      : entityType === 'category' ? 'categories'
      : entityType === 'brand' ? 'brands'
      : 'blog';

    return path.join(basePath, entityFolder, sizeName, subdir, filename);
  }

  /**
   * Ensure directory exists, create if not
   */
  private static ensureDirectory(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  /**
   * Generate a single image size
   */
  static async generateImageSize(
    sourcePath: string,
    entityType: string,
    entityId: string,
    entityName: string | undefined,
    templateName: string,
    options: {
      width: number;
      height: number;
      fitMode: 'inside' | 'cover' | 'fill' | 'contain';
      quality: number;
      format: 'webp' | 'jpeg' | 'png';
    },
    timestamp?: string
  ): Promise<{ path: string; url: string; filename: string }> {
    const ext = options.format === 'webp' ? 'webp' : options.format === 'png' ? 'png' : 'jpg';
    const filename = this.generateFilename(entityName, entityId, templateName, ext, timestamp);
    const targetPath = this.getImagePath(entityType, templateName, entityId, filename);

    // Ensure target directory exists
    this.ensureDirectory(path.dirname(targetPath));

    // Configure Sharp fit mode
    const fitModeMap = {
      inside: sharp.fit.inside,
      cover: sharp.fit.cover,
      fill: sharp.fit.fill,
      contain: sharp.fit.contain
    };

    // Process image
    const processor = sharp(sourcePath)
      .resize(options.width, options.height, {
        fit: fitModeMap[options.fitMode],
        withoutEnlargement: true
      });

    // Apply format-specific options
    if (options.format === 'webp') {
      processor.webp({ quality: options.quality });
    } else if (options.format === 'jpeg') {
      processor.jpeg({ quality: options.quality });
    } else if (options.format === 'png') {
      processor.png({ quality: options.quality });
    }

    await processor.toFile(targetPath);

    // Generate URL
    const entityFolder = entityType === 'product' ? 'products'
      : entityType === 'category' ? 'categories'
      : entityType === 'brand' ? 'brands'
      : 'blog';
    const subdir = this.getSubdirectory(entityId);
    const url = `/uploads/${entityFolder}/${templateName}/${subdir}/${filename}`;

    logger.info(`Generated ${templateName} size for ${entityType} ${entityId}`);

    return { path: targetPath, url, filename };
  }

  /**
   * Save original file to the originals directory
   */
  static async saveOriginal(
    sourcePath: string,
    entityType: string,
    entityId: string,
    entityName: string | undefined,
    originalFilename: string,
    timestamp?: string
  ): Promise<{ path: string; url: string; filename: string }> {
    const ext = path.extname(originalFilename);
    const filename = this.generateFilename(entityName, entityId, 'originals', ext, timestamp);
    const targetPath = this.getImagePath(entityType, 'originals', entityId, filename);

    // Ensure directory exists
    this.ensureDirectory(path.dirname(targetPath));

    // Copy original file
    fs.copyFileSync(sourcePath, targetPath);

    // Generate URL
    const entityFolder = entityType === 'product' ? 'products'
      : entityType === 'category' ? 'categories'
      : entityType === 'brand' ? 'brands'
      : 'blog';
    const subdir = this.getSubdirectory(entityId);
    const url = `/uploads/${entityFolder}/originals/${subdir}/${filename}`;

    logger.info(`Saved original file for ${entityType} ${entityId}`);

    return { path: targetPath, url, filename };
  }

  /**
   * Generate all active image sizes for an entity
   */
  static async generateAllSizes(
    sourcePath: string,
    entityType: string,
    entityId: string,
    entityName: string | undefined,
    originalFilename: string
  ): Promise<{
    original: { url: string; path: string; filename: string };
    sizes: Record<string, { url: string; path: string; filename: string }>;
  }> {
    // Generate unique ID for this upload (shared across all sizes)
    // Use crypto random bytes to guarantee uniqueness even for concurrent uploads
    const uniqueId = crypto.randomBytes(6).toString('hex'); // 12 character hex string

    // Get original file metadata
    const originalStats = fs.statSync(sourcePath);
    const originalMetadata = await sharp(sourcePath).metadata();

    // Save original file with unique ID
    const original = await this.saveOriginal(sourcePath, entityType, entityId, entityName, originalFilename, uniqueId);

    // Get all active templates for this entity type
    const templates = await ImageSizeTemplateService.getActiveByEntityType(entityType);

    if (templates.length === 0) {
      logger.warn(`No active templates found for entity type: ${entityType}`);
    }

    // Generate all sizes
    const sizes: Record<string, { url: string; path: string; filename: string }> = {};

    for (const template of templates) {
      try {
        const result = await this.generateImageSize(
          sourcePath,
          entityType,
          entityId,
          entityName,
          template.name,
          {
            width: template.width,
            height: template.height,
            fitMode: template.fitMode,
            quality: template.quality,
            format: template.format
          },
          uniqueId // Pass same unique ID to all sizes
        );

        sizes[template.name] = result;

        // Get generated file metadata
        const generatedStats = fs.statSync(result.path);
        const generatedMetadata = await sharp(result.path).metadata();

        // Record in database with correct schema fields
        await db.insert(imageFiles).values({
          entityType: template.entityType,
          entityId,
          sizeTemplate: template.name,

          // Original file info
          originalFilename,
          originalPath: original.path,
          originalMimeType: `image/${path.extname(originalFilename).substring(1)}`,
          originalSize: originalStats.size,
          originalWidth: originalMetadata.width || null,
          originalHeight: originalMetadata.height || null,

          // Generated file info
          generatedPath: result.path,
          generatedSize: generatedStats.size,
          generatedWidth: generatedMetadata.width || null,
          generatedHeight: generatedMetadata.height || null
        });

      } catch (error) {
        logger.error(`Error generating ${template.name} for ${entityType} ${entityId}:`, error);
        // Continue with other templates even if one fails
      }
    }

    logger.info(`Generated ${Object.keys(sizes).length} sizes for ${entityType} ${entityId}`);

    return { original, sizes };
  }

  /**
   * Delete specific image by URL (deletes original + all generated sizes)
   * URL format: /uploads/products/originals/023/test-plochki-originals-77c9-a1b2c3d4.jpg
   */
  static async deleteImageByUrl(imageUrl: string): Promise<void> {
    try {
      // Extract filename and unique ID from URL
      const urlParts = imageUrl.split('/');
      const filename = urlParts[urlParts.length - 1]; // e.g. test-plochki-originals-77c9-a1b2c3d4.jpg

      // Extract unique ID from filename (last part before extension)
      // Format: {slug}-{sizeName}-{shortId}-{uniqueId}.{ext}
      const parts = filename.split('-');
      if (parts.length < 2) {
        logger.warn(`Cannot extract unique ID from filename: ${filename}`);
        return;
      }

      const nameWithoutExt = filename.substring(0, filename.lastIndexOf('.'));
      const uniqueId = nameWithoutExt.split('-').pop(); // Get last part

      if (!uniqueId) {
        logger.warn(`Cannot extract unique ID from filename: ${filename}`);
        return;
      }

      logger.info(`Deleting all files with unique ID: ${uniqueId}`);

      // Find all files with this unique ID in database
      const files = await db.query.imageFiles.findMany({
        where: (fields, { like }) => like(fields.generatedPath, `%${uniqueId}%`)
      });

      // Track deleted original files to avoid deleting same file multiple times
      const deletedOriginals = new Set<string>();

      // Delete physical files
      for (const file of files) {
        try {
          // Delete generated file
          if (file.generatedPath && fs.existsSync(file.generatedPath)) {
            fs.unlinkSync(file.generatedPath);
            logger.info(`Deleted generated file: ${file.generatedPath}`);
          }

          // Delete original file (only once per unique path)
          if (file.originalPath && !deletedOriginals.has(file.originalPath) && fs.existsSync(file.originalPath)) {
            fs.unlinkSync(file.originalPath);
            deletedOriginals.add(file.originalPath);
            logger.info(`Deleted original file: ${file.originalPath}`);
          }
        } catch (error) {
          logger.error(`Error deleting file ${file.generatedPath}:`, error);
        }
      }

      // Delete database records
      await db.delete(imageFiles).where(
        like(imageFiles.generatedPath, `%${uniqueId}%`)
      );

      logger.info(`Deleted all files with unique ID: ${uniqueId}`);
    } catch (error) {
      logger.error(`Error deleting image by URL ${imageUrl}:`, error);
      throw error;
    }
  }

  /**
   * Delete multiple images by URLs
   */
  static async deleteImagesByUrls(imageUrls: string[]): Promise<void> {
    for (const url of imageUrls) {
      await this.deleteImageByUrl(url);
    }
  }

  /**
   * Delete all images for an entity
   */
  static async deleteEntityImages(entityType: string, entityId: string): Promise<void> {
    // Get all image files from database
    const files = await db.query.imageFiles.findMany({
      where: (imageFiles, { eq, and }) =>
        and(
          eq(imageFiles.entityType, entityType as any),
          eq(imageFiles.entityId, entityId)
        )
    });

    // Delete physical files
    for (const file of files) {
      try {
        // Delete generated file
        if (file.generatedPath && fs.existsSync(file.generatedPath)) {
          fs.unlinkSync(file.generatedPath);
          logger.info(`Deleted generated file: ${file.generatedPath}`);
        }
        // Delete original file (only once, check if it's the originals template)
        if (file.sizeTemplate === 'originals' && file.originalPath && fs.existsSync(file.originalPath)) {
          fs.unlinkSync(file.originalPath);
          logger.info(`Deleted original file: ${file.originalPath}`);
        }
      } catch (error) {
        logger.error(`Error deleting file ${file.generatedPath}:`, error);
      }
    }

    // Delete database records
    await db.delete(imageFiles).where(
      and(
        eq(imageFiles.entityType, entityType as any),
        eq(imageFiles.entityId, entityId)
      )
    );

    logger.info(`Deleted all images for ${entityType} ${entityId}`);
  }
}
