import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { generalSettings } from '../db/schema/general-settings';
import { eq } from 'drizzle-orm';
import { AppError } from '../middleware/error.middleware';
import { logger } from '../utils/logger';

// Get general settings (there should be only one row)
export const getGeneralSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const settings = await db
      .select()
      .from(generalSettings)
      .limit(1);

    // If no settings exist, create default
    if (settings.length === 0) {
      const [newSettings] = await db
        .insert(generalSettings)
        .values({
          baseUrl: 'https://example.com'
        })
        .returning();

      return res.json({ data: newSettings });
    }

    res.json({ data: settings[0] });
  } catch (error) {
    next(error);
  }
};

// Update general settings
export const updateGeneralSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updateData = req.body;

    // Get existing settings
    const existing = await db
      .select()
      .from(generalSettings)
      .limit(1);

    if (existing.length === 0) {
      throw new AppError(404, 'General settings not found', 'SETTINGS_NOT_FOUND');
    }

    const [updatedSettings] = await db
      .update(generalSettings)
      .set({
        ...updateData,
        updatedAt: new Date()
      })
      .where(eq(generalSettings.id, existing[0].id))
      .returning();

    logger.info(`Updated general settings`);

    res.json({ data: updatedSettings });
  } catch (error) {
    next(error);
  }
};
