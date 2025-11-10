import { db } from '../db';
import { imageSizeTemplates, type ImageSizeTemplate, type NewImageSizeTemplate } from '../db/schema';
import { eq, desc, ilike, or, and, count } from 'drizzle-orm';
import { AppError } from '../middleware/error.middleware';
import { logger } from '../utils/logger';

export class ImageSizeTemplateService {
  /**
   * Get all image size templates with optional filters
   */
  static async getAll(params: {
    search?: string;
    entityType?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }) {
    const { search, entityType, isActive, page = 1, limit = 50 } = params;
    const offset = (page - 1) * limit;

    let query = db.select().from(imageSizeTemplates);
    const conditions = [];

    // Apply filters
    if (search) {
      conditions.push(
        or(
          ilike(imageSizeTemplates.name, `%${search}%`),
          ilike(imageSizeTemplates.displayName, `%${search}%`)
        )
      );
    }

    if (entityType) {
      conditions.push(eq(imageSizeTemplates.entityType, entityType as any));
    }

    if (isActive !== undefined) {
      conditions.push(eq(imageSizeTemplates.isActive, isActive));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    // Build count query
    let countQuery = db.select({ count: count() }).from(imageSizeTemplates);
    if (conditions.length > 0) {
      countQuery = countQuery.where(and(...conditions)) as any;
    }

    // Execute query with pagination
    const [templates, totalCount] = await Promise.all([
      query.orderBy(imageSizeTemplates.sortOrder, desc(imageSizeTemplates.createdAt))
        .limit(limit)
        .offset(offset),
      countQuery
    ]);

    logger.info(`Fetched ${templates.length} image size templates`);

    return {
      data: templates,
      pagination: {
        page,
        limit,
        total: totalCount[0]?.count || 0,
        totalPages: Math.ceil((totalCount[0]?.count || 0) / limit)
      }
    };
  }

  /**
   * Get single template by ID
   */
  static async getById(id: string): Promise<ImageSizeTemplate> {
    const [template] = await db
      .select()
      .from(imageSizeTemplates)
      .where(eq(imageSizeTemplates.id, id))
      .limit(1);

    if (!template) {
      throw new AppError(404, 'Image size template not found', 'TEMPLATE_NOT_FOUND');
    }

    return template;
  }

  /**
   * Get template by name
   */
  static async getByName(name: string): Promise<ImageSizeTemplate | null> {
    const [template] = await db
      .select()
      .from(imageSizeTemplates)
      .where(eq(imageSizeTemplates.name, name))
      .limit(1);

    return template || null;
  }

  /**
   * Create new template
   */
  static async create(data: NewImageSizeTemplate): Promise<ImageSizeTemplate> {
    // Check if name already exists
    const existing = await this.getByName(data.name);
    if (existing) {
      throw new AppError(400, 'Template with this name already exists', 'DUPLICATE_NAME');
    }

    const [newTemplate] = await db
      .insert(imageSizeTemplates)
      .values({
        ...data,
        updatedAt: new Date()
      })
      .returning();

    logger.info(`Image size template created: ${newTemplate.name} (${newTemplate.id})`);

    return newTemplate;
  }

  /**
   * Update template
   */
  static async update(id: string, data: Partial<NewImageSizeTemplate>): Promise<ImageSizeTemplate> {
    // Check if template exists
    await this.getById(id);

    // If name is being updated, check for duplicates
    if (data.name) {
      const existing = await this.getByName(data.name);
      if (existing && existing.id !== id) {
        throw new AppError(400, 'Template with this name already exists', 'DUPLICATE_NAME');
      }
    }

    const [updatedTemplate] = await db
      .update(imageSizeTemplates)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(imageSizeTemplates.id, id))
      .returning();

    logger.info(`Image size template updated: ${updatedTemplate.name} (${updatedTemplate.id})`);

    return updatedTemplate;
  }

  /**
   * Delete template
   */
  static async delete(id: string): Promise<void> {
    const template = await this.getById(id);

    // TODO: Check if template is being used by any images
    // For now, we'll allow deletion

    await db.delete(imageSizeTemplates).where(eq(imageSizeTemplates.id, id));

    logger.info(`Image size template deleted: ${template.name} (${id})`);
  }

  /**
   * Toggle active status
   */
  static async toggleActive(id: string): Promise<ImageSizeTemplate> {
    const template = await this.getById(id);

    const [updatedTemplate] = await db
      .update(imageSizeTemplates)
      .set({
        isActive: !template.isActive,
        updatedAt: new Date()
      })
      .where(eq(imageSizeTemplates.id, id))
      .returning();

    logger.info(`Image size template ${updatedTemplate.isActive ? 'activated' : 'deactivated'}: ${updatedTemplate.name}`);

    return updatedTemplate;
  }

  /**
   * Get all active templates for a specific entity type
   */
  static async getActiveByEntityType(entityType: string): Promise<ImageSizeTemplate[]> {
    const templates = await db
      .select()
      .from(imageSizeTemplates)
      .where(
        and(
          eq(imageSizeTemplates.entityType, entityType as any),
          eq(imageSizeTemplates.isActive, true)
        )
      )
      .orderBy(imageSizeTemplates.sortOrder);

    return templates;
  }
}
