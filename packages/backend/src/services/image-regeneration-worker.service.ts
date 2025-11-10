import fs from 'fs';
import { db } from '../db';
import { imageRegenerationJobs, imageFiles, products, categories, brands, type ImageRegenerationJob } from '../db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { ImageProcessingService } from './image-processing.service';
import { ImageSizeTemplateService } from './image-size-template.service';
import { logger } from '../utils/logger';

/**
 * Image Regeneration Worker Service
 * Processes image regeneration jobs in the background
 */
export class ImageRegenerationWorkerService {
  private static isRunning = false;
  private static pollInterval: NodeJS.Timeout | null = null;
  private static currentJobId: string | null = null;

  /**
   * Start the worker polling for pending jobs
   */
  static start(intervalMs: number = 5000): void {
    if (this.isRunning) {
      logger.warn('Image regeneration worker is already running');
      return;
    }

    this.isRunning = true;
    logger.info(`Image regeneration worker started (poll interval: ${intervalMs}ms)`);

    // Start polling immediately
    this.pollAndProcess();

    // Then poll at intervals
    this.pollInterval = setInterval(() => {
      this.pollAndProcess();
    }, intervalMs);
  }

  /**
   * Stop the worker
   */
  static stop(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
    this.isRunning = false;
    logger.info('Image regeneration worker stopped');
  }

  /**
   * Poll for pending jobs and process them
   */
  private static async pollAndProcess(): Promise<void> {
    // Skip if already processing a job
    if (this.currentJobId) {
      return;
    }

    try {
      // Get next pending job
      const [job] = await db
        .select()
        .from(imageRegenerationJobs)
        .where(eq(imageRegenerationJobs.status, 'pending'))
        .orderBy(imageRegenerationJobs.createdAt)
        .limit(1);

      if (job) {
        await this.processJob(job);
      }
    } catch (error) {
      logger.error('Error polling for regeneration jobs:', error);
    }
  }

  /**
   * Process a single regeneration job
   */
  private static async processJob(job: ImageRegenerationJob): Promise<void> {
    this.currentJobId = job.id;
    logger.info(`Processing regeneration job ${job.id}: ${job.sizeTemplate} for ${job.entityType}`);

    try {
      // Update job status to processing
      await db
        .update(imageRegenerationJobs)
        .set({
          status: 'processing',
          startedAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(imageRegenerationJobs.id, job.id));

      // Get the template
      const template = await ImageSizeTemplateService.getByName(job.sizeTemplate);
      if (!template) {
        throw new Error(`Template ${job.sizeTemplate} not found`);
      }

      // Get entities to process
      const entityIds = await this.getEntityIds(job);

      if (entityIds.length === 0) {
        logger.warn(`No entities found for job ${job.id}`);
        await this.completeJob(job.id, 0, 0);
        return;
      }

      // Update total count if it was 0 or different
      if (job.totalCount !== entityIds.length) {
        await db
          .update(imageRegenerationJobs)
          .set({ totalCount: entityIds.length })
          .where(eq(imageRegenerationJobs.id, job.id));
      }

      logger.info(`Found ${entityIds.length} entities to regenerate`);

      let processedCount = 0;
      let failedCount = 0;

      // Process each entity
      for (const entityId of entityIds) {
        try {
          await this.regenerateEntityImage(
            job.entityType,
            entityId,
            template.name,
            template
          );

          processedCount++;

          // Update progress every 10 items or at the end
          if (processedCount % 10 === 0 || processedCount === entityIds.length) {
            await db
              .update(imageRegenerationJobs)
              .set({
                processedCount,
                failedCount,
                updatedAt: new Date()
              })
              .where(eq(imageRegenerationJobs.id, job.id));

            logger.info(`Job ${job.id} progress: ${processedCount}/${entityIds.length} (${failedCount} failed)`);
          }
        } catch (error) {
          logger.error(`Error regenerating image for ${job.entityType} ${entityId}:`, error);
          failedCount++;

          // Update failed count
          await db
            .update(imageRegenerationJobs)
            .set({
              processedCount,
              failedCount,
              updatedAt: new Date()
            })
            .where(eq(imageRegenerationJobs.id, job.id));
        }
      }

      // Complete the job
      await this.completeJob(job.id, processedCount, failedCount);

    } catch (error) {
      logger.error(`Error processing job ${job.id}:`, error);

      // Mark job as failed
      await db
        .update(imageRegenerationJobs)
        .set({
          status: 'failed',
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          completedAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(imageRegenerationJobs.id, job.id));

    } finally {
      this.currentJobId = null;
    }
  }

  /**
   * Get entity IDs to process based on job configuration
   */
  private static async getEntityIds(job: ImageRegenerationJob): Promise<string[]> {
    // If specific entity IDs provided, use them
    if (job.entityIds && Array.isArray(job.entityIds) && job.entityIds.length > 0) {
      return job.entityIds as string[];
    }

    // Otherwise, get all entities of this type that have images
    const files = await db
      .selectDistinct({ entityId: imageFiles.entityId })
      .from(imageFiles)
      .where(
        and(
          eq(imageFiles.entityType, job.entityType),
          eq(imageFiles.sizeTemplate, 'originals') // Only entities with originals
        )
      );

    return files.map(f => f.entityId);
  }

  /**
   * Regenerate image for a single entity
   */
  private static async regenerateEntityImage(
    entityType: string,
    entityId: string,
    templateName: string,
    template: any
  ): Promise<void> {
    // Get entity name for SEO-friendly filenames
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
    } catch (error) {
      logger.warn(`Failed to fetch entity name for ${entityType} ${entityId}:`, error);
    }

    // Get original image file from database
    const [originalFile] = await db
      .select()
      .from(imageFiles)
      .where(
        and(
          eq(imageFiles.entityType, entityType as any),
          eq(imageFiles.entityId, entityId),
          eq(imageFiles.sizeTemplate, 'originals')
        )
      )
      .orderBy(imageFiles.createdAt)
      .limit(1);

    if (!originalFile) {
      throw new Error(`No original image found for ${entityType} ${entityId}`);
    }

    // Check if original file exists
    if (!fs.existsSync(originalFile.originalPath)) {
      throw new Error(`Original file not found: ${originalFile.originalPath}`);
    }

    // Get existing generated file for this template (if any)
    const [existingFile] = await db
      .select()
      .from(imageFiles)
      .where(
        and(
          eq(imageFiles.entityType, entityType as any),
          eq(imageFiles.entityId, entityId),
          eq(imageFiles.sizeTemplate, templateName)
        )
      )
      .limit(1);

    // Delete existing generated file if it exists
    if (existingFile && existingFile.generatedPath && fs.existsSync(existingFile.generatedPath)) {
      try {
        fs.unlinkSync(existingFile.generatedPath);
        logger.info(`Deleted old generated file: ${existingFile.generatedPath}`);
      } catch (error) {
        logger.warn(`Failed to delete old file ${existingFile.generatedPath}:`, error);
      }
    }

    // Generate new image with the template
    const result = await ImageProcessingService.generateImageSize(
      originalFile.originalPath,
      entityType,
      entityId,
      entityName,
      templateName,
      {
        width: template.width,
        height: template.height,
        fitMode: template.fitMode,
        quality: template.quality,
        format: template.format
      }
    );

    // Get generated file metadata
    const generatedStats = fs.statSync(result.path);
    let generatedWidth: number | null = null;
    let generatedHeight: number | null = null;

    try {
      const sharp = (await import('sharp')).default;
      const metadata = await sharp(result.path).metadata();
      generatedWidth = metadata.width || null;
      generatedHeight = metadata.height || null;
    } catch (error) {
      logger.warn(`Could not read metadata for ${result.path}`);
    }

    // Update or insert imageFiles record
    if (existingFile) {
      // Update existing record
      await db
        .update(imageFiles)
        .set({
          generatedPath: result.path,
          generatedSize: generatedStats.size,
          generatedWidth,
          generatedHeight,
          generatedAt: new Date()
        })
        .where(eq(imageFiles.id, existingFile.id));
    } else {
      // Insert new record
      await db.insert(imageFiles).values({
        entityType: template.entityType,
        entityId,
        sizeTemplate: templateName,
        originalFilename: originalFile.originalFilename,
        originalPath: originalFile.originalPath,
        originalMimeType: originalFile.originalMimeType,
        originalSize: originalFile.originalSize,
        originalWidth: originalFile.originalWidth,
        originalHeight: originalFile.originalHeight,
        generatedPath: result.path,
        generatedSize: generatedStats.size,
        generatedWidth,
        generatedHeight
      });
    }

    logger.info(`Regenerated ${templateName} for ${entityType} ${entityId}`);
  }

  /**
   * Mark job as completed
   */
  private static async completeJob(
    jobId: string,
    processedCount: number,
    failedCount: number
  ): Promise<void> {
    await db
      .update(imageRegenerationJobs)
      .set({
        status: 'completed',
        processedCount,
        failedCount,
        completedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(imageRegenerationJobs.id, jobId));

    logger.info(`Job ${jobId} completed: ${processedCount} processed, ${failedCount} failed`);
  }

  /**
   * Get current worker status
   */
  static getStatus(): {
    isRunning: boolean;
    currentJobId: string | null;
  } {
    return {
      isRunning: this.isRunning,
      currentJobId: this.currentJobId
    };
  }

  /**
   * Manually trigger job processing (for testing)
   */
  static async processNextJob(): Promise<void> {
    await this.pollAndProcess();
  }
}
