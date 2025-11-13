import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { catalogSettings, deliveryTimeTemplates } from '../db/schema';
import { eq, asc } from 'drizzle-orm';
import { AppError } from '../middleware/error.middleware';
import { logger } from '../utils/logger';

// Get catalog settings (singleton)
export const getCatalogSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let [settings] = await db.select().from(catalogSettings).limit(1);

    // If no settings exist, create default settings
    if (!settings) {
      [settings] = await db.insert(catalogSettings)
        .values({
          vatPercentage: '20.00',
          productsPerPage: 24,
          newProductPeriodDays: 30,
          defaultSorting: 'created_desc'
        })
        .returning();

      logger.info('Created default catalog settings');
    }

    logger.info('Fetched catalog settings');

    res.json({ data: settings });
  } catch (error) {
    next(error);
  }
};

// Update catalog settings
export const updateCatalogSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { vatPercentage, productsPerPage, newProductPeriodDays, defaultSorting } = req.body;

    // Get the existing settings
    let [existingSettings] = await db.select().from(catalogSettings).limit(1);

    // If no settings exist, create them first
    if (!existingSettings) {
      [existingSettings] = await db.insert(catalogSettings)
        .values({
          vatPercentage: vatPercentage || '20.00',
          productsPerPage: productsPerPage || 24,
          newProductPeriodDays: newProductPeriodDays || 30,
          defaultSorting: defaultSorting || 'created_desc'
        })
        .returning();

      logger.info('Created catalog settings');
      res.json({ data: existingSettings });
      return;
    }

    const [updatedSettings] = await db.update(catalogSettings)
      .set({
        vatPercentage,
        productsPerPage,
        newProductPeriodDays,
        defaultSorting,
        updatedAt: new Date()
      })
      .where(eq(catalogSettings.id, existingSettings.id))
      .returning();

    logger.info('Catalog settings updated');

    res.json({ data: updatedSettings });
  } catch (error) {
    next(error);
  }
};

// Get all delivery time templates
export const getDeliveryTimeTemplates = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const templates = await db.select()
      .from(deliveryTimeTemplates)
      .orderBy(asc(deliveryTimeTemplates.position));

    logger.info(`Fetched ${templates.length} delivery time templates`);

    res.json({ data: templates });
  } catch (error) {
    next(error);
  }
};

// Create delivery time template
export const createDeliveryTimeTemplate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, position } = req.body;

    // Get max position if not provided
    let finalPosition = position;
    if (finalPosition === undefined) {
      const templates = await db.select().from(deliveryTimeTemplates);
      finalPosition = templates.length;
    }

    const [newTemplate] = await db.insert(deliveryTimeTemplates).values({
      name,
      position: finalPosition,
      updatedAt: new Date()
    }).returning();

    logger.info(`Delivery time template created: ${newTemplate.name}`);

    res.status(201).json({ data: newTemplate });
  } catch (error) {
    next(error);
  }
};

// Update delivery time template
export const updateDeliveryTimeTemplate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, position } = req.body;

    const [existingTemplate] = await db.select()
      .from(deliveryTimeTemplates)
      .where(eq(deliveryTimeTemplates.id, id))
      .limit(1);

    if (!existingTemplate) {
      throw new AppError(404, 'Delivery time template not found', 'TEMPLATE_NOT_FOUND');
    }

    const [updatedTemplate] = await db.update(deliveryTimeTemplates)
      .set({
        name,
        position,
        updatedAt: new Date()
      })
      .where(eq(deliveryTimeTemplates.id, id))
      .returning();

    logger.info(`Delivery time template updated: ${updatedTemplate.name}`);

    res.json({ data: updatedTemplate });
  } catch (error) {
    next(error);
  }
};

// Delete delivery time template
export const deleteDeliveryTimeTemplate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const [existingTemplate] = await db.select()
      .from(deliveryTimeTemplates)
      .where(eq(deliveryTimeTemplates.id, id))
      .limit(1);

    if (!existingTemplate) {
      throw new AppError(404, 'Delivery time template not found', 'TEMPLATE_NOT_FOUND');
    }

    await db.delete(deliveryTimeTemplates).where(eq(deliveryTimeTemplates.id, id));

    logger.info(`Delivery time template deleted: ${existingTemplate.name}`);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// Reorder delivery time templates
export const reorderDeliveryTimeTemplates = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { templateIds } = req.body; // Array of template IDs in new order

    if (!Array.isArray(templateIds)) {
      throw new AppError(400, 'templateIds must be an array', 'INVALID_TEMPLATE_IDS');
    }

    // Update position for each template
    await Promise.all(
      templateIds.map((templateId, index) =>
        db.update(deliveryTimeTemplates)
          .set({ position: index, updatedAt: new Date() })
          .where(eq(deliveryTimeTemplates.id, templateId))
      )
    );

    logger.info('Delivery time templates reordered');

    res.json({ message: 'Templates reordered successfully' });
  } catch (error) {
    next(error);
  }
};
