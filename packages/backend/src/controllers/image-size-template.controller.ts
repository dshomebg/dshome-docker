import { Request, Response, NextFunction } from 'express';
import { ImageSizeTemplateService } from '../services/image-size-template.service';
import { logger } from '../utils/logger';

/**
 * Get all image size templates
 */
export const getImageSizeTemplates = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, entityType, isActive, page, limit } = req.query;

    const result = await ImageSizeTemplateService.getAll({
      search: search as string,
      entityType: entityType as string,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Get single image size template
 */
export const getImageSizeTemplate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const template = await ImageSizeTemplateService.getById(id);

    res.json({ data: template });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new image size template
 */
export const createImageSizeTemplate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      name,
      displayName,
      entityType,
      width,
      height,
      fitMode,
      quality,
      format,
      isActive,
      sortOrder,
      description
    } = req.body;

    const newTemplate = await ImageSizeTemplateService.create({
      name,
      displayName,
      entityType,
      width: parseInt(width),
      height: parseInt(height),
      fitMode: fitMode || 'inside',
      quality: quality ? parseInt(quality) : 85,
      format: format || 'webp',
      isActive: isActive !== undefined ? isActive : true,
      sortOrder: sortOrder ? parseInt(sortOrder) : 0,
      description
    });

    logger.info(`Image size template created: ${newTemplate.name}`);

    res.status(201).json({ data: newTemplate });
  } catch (error) {
    next(error);
  }
};

/**
 * Update image size template
 */
export const updateImageSizeTemplate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const {
      name,
      displayName,
      entityType,
      width,
      height,
      fitMode,
      quality,
      format,
      isActive,
      sortOrder,
      description
    } = req.body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (displayName !== undefined) updateData.displayName = displayName;
    if (entityType !== undefined) updateData.entityType = entityType;
    if (width !== undefined) updateData.width = parseInt(width);
    if (height !== undefined) updateData.height = parseInt(height);
    if (fitMode !== undefined) updateData.fitMode = fitMode;
    if (quality !== undefined) updateData.quality = parseInt(quality);
    if (format !== undefined) updateData.format = format;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (sortOrder !== undefined) updateData.sortOrder = parseInt(sortOrder);
    if (description !== undefined) updateData.description = description;

    const updatedTemplate = await ImageSizeTemplateService.update(id, updateData);

    res.json({ data: updatedTemplate });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete image size template
 */
export const deleteImageSizeTemplate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    await ImageSizeTemplateService.delete(id);

    logger.info(`Image size template deleted: ${id}`);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle active status
 */
export const toggleImageSizeTemplateActive = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const updatedTemplate = await ImageSizeTemplateService.toggleActive(id);

    res.json({ data: updatedTemplate });
  } catch (error) {
    next(error);
  }
};

/**
 * Get active templates by entity type
 */
export const getActiveTemplatesByType = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { entityType } = req.params;

    const templates = await ImageSizeTemplateService.getActiveByEntityType(entityType);

    res.json({ data: templates });
  } catch (error) {
    next(error);
  }
};

/**
 * Regenerate images for specific template
 */
export const regenerateTemplateImages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const job = await ImageSizeTemplateService.triggerRegeneration(id);

    logger.info(`Image regeneration job created: ${job.id} for template: ${id}`);

    res.status(202).json({
      message: 'Regeneration job created successfully',
      data: job
    });
  } catch (error) {
    next(error);
  }
};
