import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { filterTemplates, filterTemplateItems } from '../db/schema';
import { eq, asc } from 'drizzle-orm';
import { AppError } from '../middleware/error.middleware';
import { logger } from '../utils/logger';

// Get all filter templates
export const getFilterTemplates = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const templates = await db.select().from(filterTemplates).orderBy(asc(filterTemplates.name));

    logger.info(`Fetched ${templates.length} filter templates`);

    res.json({ data: templates });
  } catch (error) {
    next(error);
  }
};

// Get single filter template with items
export const getFilterTemplate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const [template] = await db.select()
      .from(filterTemplates)
      .where(eq(filterTemplates.id, id))
      .limit(1);

    if (!template) {
      throw new AppError(404, 'Filter template not found', 'TEMPLATE_NOT_FOUND');
    }

    // Get all items for this template
    const items = await db.select()
      .from(filterTemplateItems)
      .where(eq(filterTemplateItems.templateId, id))
      .orderBy(asc(filterTemplateItems.position));

    res.json({
      data: {
        ...template,
        items
      }
    });
  } catch (error) {
    next(error);
  }
};

// Create filter template
export const createFilterTemplate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, type, description } = req.body;

    const [newTemplate] = await db.insert(filterTemplates).values({
      name,
      type,
      description,
      updatedAt: new Date()
    }).returning();

    logger.info(`Filter template created: ${newTemplate.name}`);

    res.status(201).json({ data: newTemplate });
  } catch (error) {
    next(error);
  }
};

// Update filter template
export const updateFilterTemplate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, type, description } = req.body;

    const [existingTemplate] = await db.select()
      .from(filterTemplates)
      .where(eq(filterTemplates.id, id))
      .limit(1);

    if (!existingTemplate) {
      throw new AppError(404, 'Filter template not found', 'TEMPLATE_NOT_FOUND');
    }

    const [updatedTemplate] = await db.update(filterTemplates)
      .set({
        name,
        type,
        description,
        updatedAt: new Date()
      })
      .where(eq(filterTemplates.id, id))
      .returning();

    logger.info(`Filter template updated: ${updatedTemplate.name}`);

    res.json({ data: updatedTemplate });
  } catch (error) {
    next(error);
  }
};

// Delete filter template
export const deleteFilterTemplate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const [existingTemplate] = await db.select()
      .from(filterTemplates)
      .where(eq(filterTemplates.id, id))
      .limit(1);

    if (!existingTemplate) {
      throw new AppError(404, 'Filter template not found', 'TEMPLATE_NOT_FOUND');
    }

    // Items will be deleted automatically due to cascade
    await db.delete(filterTemplates).where(eq(filterTemplates.id, id));

    logger.info(`Filter template deleted: ${existingTemplate.name}`);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// Get all items for a template
export const getFilterTemplateItems = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { templateId } = req.params;

    // Verify template exists
    const [template] = await db.select()
      .from(filterTemplates)
      .where(eq(filterTemplates.id, templateId))
      .limit(1);

    if (!template) {
      throw new AppError(404, 'Filter template not found', 'TEMPLATE_NOT_FOUND');
    }

    const items = await db.select()
      .from(filterTemplateItems)
      .where(eq(filterTemplateItems.templateId, templateId))
      .orderBy(asc(filterTemplateItems.position));

    res.json({ data: items });
  } catch (error) {
    next(error);
  }
};

// Create filter template item
export const createFilterTemplateItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { templateId } = req.params;
    const { filterType, label, config, position, isActive } = req.body;

    // Verify template exists
    const [template] = await db.select()
      .from(filterTemplates)
      .where(eq(filterTemplates.id, templateId))
      .limit(1);

    if (!template) {
      throw new AppError(404, 'Filter template not found', 'TEMPLATE_NOT_FOUND');
    }

    // Get max position if not provided
    let finalPosition = position;
    if (finalPosition === undefined) {
      const items = await db.select()
        .from(filterTemplateItems)
        .where(eq(filterTemplateItems.templateId, templateId));
      finalPosition = items.length;
    }

    const [newItem] = await db.insert(filterTemplateItems).values({
      templateId,
      filterType,
      label,
      config: config || null,
      position: finalPosition,
      isActive: isActive !== undefined ? isActive : true,
      updatedAt: new Date()
    }).returning();

    logger.info(`Filter template item created: ${newItem.label} for template ${templateId}`);

    res.status(201).json({ data: newItem });
  } catch (error) {
    next(error);
  }
};

// Update filter template item
export const updateFilterTemplateItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { filterType, label, config, position, isActive } = req.body;

    const [existingItem] = await db.select()
      .from(filterTemplateItems)
      .where(eq(filterTemplateItems.id, id))
      .limit(1);

    if (!existingItem) {
      throw new AppError(404, 'Filter template item not found', 'ITEM_NOT_FOUND');
    }

    const [updatedItem] = await db.update(filterTemplateItems)
      .set({
        filterType,
        label,
        config: config || null,
        position,
        isActive,
        updatedAt: new Date()
      })
      .where(eq(filterTemplateItems.id, id))
      .returning();

    logger.info(`Filter template item updated: ${updatedItem.label}`);

    res.json({ data: updatedItem });
  } catch (error) {
    next(error);
  }
};

// Delete filter template item
export const deleteFilterTemplateItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const [existingItem] = await db.select()
      .from(filterTemplateItems)
      .where(eq(filterTemplateItems.id, id))
      .limit(1);

    if (!existingItem) {
      throw new AppError(404, 'Filter template item not found', 'ITEM_NOT_FOUND');
    }

    await db.delete(filterTemplateItems).where(eq(filterTemplateItems.id, id));

    logger.info(`Filter template item deleted: ${existingItem.label}`);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// Reorder filter template items
export const reorderFilterTemplateItems = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { templateId } = req.params;
    const { itemIds } = req.body; // Array of item IDs in new order

    if (!Array.isArray(itemIds)) {
      throw new AppError(400, 'itemIds must be an array', 'INVALID_ITEM_IDS');
    }

    // Update position for each item
    await Promise.all(
      itemIds.map((itemId, index) =>
        db.update(filterTemplateItems)
          .set({ position: index, updatedAt: new Date() })
          .where(eq(filterTemplateItems.id, itemId))
      )
    );

    logger.info(`Filter template items reordered for template ${templateId}`);

    res.json({ message: 'Items reordered successfully' });
  } catch (error) {
    next(error);
  }
};
