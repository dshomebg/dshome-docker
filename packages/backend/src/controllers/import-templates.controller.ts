import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { importTemplates } from '../db/schema';
import { eq } from 'drizzle-orm';
import { AppError } from '../middleware/error.middleware';
import { logger } from '../utils/logger';

// Get all import templates
export const getImportTemplates = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const templates = await db.select().from(importTemplates);

    logger.info(`Fetched ${templates.length} import templates`);

    res.json({ data: templates });
  } catch (error) {
    next(error);
  }
};

// Get import template by ID
export const getImportTemplate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const [template] = await db.select()
      .from(importTemplates)
      .where(eq(importTemplates.id, id))
      .limit(1);

    if (!template) {
      throw new AppError(404, 'Import template not found', 'TEMPLATE_NOT_FOUND');
    }

    logger.info(`Fetched import template: ${template.name}`);

    res.json({ data: template });
  } catch (error) {
    next(error);
  }
};

// Create import template
export const createImportTemplate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, columnMapping } = req.body;

    if (!name || !columnMapping) {
      throw new AppError(400, 'Name and columnMapping are required', 'MISSING_REQUIRED_FIELDS');
    }

    const [newTemplate] = await db.insert(importTemplates).values({
      name,
      columnMapping,
      updatedAt: new Date()
    }).returning();

    logger.info(`Import template created: ${newTemplate.name}`);

    res.status(201).json({ data: newTemplate });
  } catch (error) {
    next(error);
  }
};

// Update import template
export const updateImportTemplate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, columnMapping } = req.body;

    const [existingTemplate] = await db.select()
      .from(importTemplates)
      .where(eq(importTemplates.id, id))
      .limit(1);

    if (!existingTemplate) {
      throw new AppError(404, 'Import template not found', 'TEMPLATE_NOT_FOUND');
    }

    const [updatedTemplate] = await db.update(importTemplates)
      .set({
        name,
        columnMapping,
        updatedAt: new Date()
      })
      .where(eq(importTemplates.id, id))
      .returning();

    logger.info(`Import template updated: ${updatedTemplate.name}`);

    res.json({ data: updatedTemplate });
  } catch (error) {
    next(error);
  }
};

// Delete import template
export const deleteImportTemplate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const [existingTemplate] = await db.select()
      .from(importTemplates)
      .where(eq(importTemplates.id, id))
      .limit(1);

    if (!existingTemplate) {
      throw new AppError(404, 'Import template not found', 'TEMPLATE_NOT_FOUND');
    }

    await db.delete(importTemplates).where(eq(importTemplates.id, id));

    logger.info(`Import template deleted: ${existingTemplate.name}`);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
