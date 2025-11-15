import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { similarProductsSettings } from '../db/schema';
import { eq } from 'drizzle-orm';
import { logger } from '../utils/logger';

/**
 * Get similar products settings (singleton)
 */
export const getSettings = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    logger.info('GET /api/similar-products-settings');

    // Get first (and only) settings record
    const [settings] = await db
      .select()
      .from(similarProductsSettings)
      .limit(1);

    if (!settings) {
      return res.status(404).json({
        success: false,
        message: 'Settings not found'
      });
    }

    logger.info('Fetched similar products settings');

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    logger.error('Error fetching similar products settings:', error);
    next(error);
  }
};

/**
 * Update similar products settings
 */
export const updateSettings = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    logger.info('PUT /api/similar-products-settings');

    const { id, createdAt, updatedAt, ...updateData } = req.body;

    // Get existing settings
    const [existingSettings] = await db
      .select()
      .from(similarProductsSettings)
      .limit(1);

    if (!existingSettings) {
      return res.status(404).json({
        success: false,
        message: 'Settings not found'
      });
    }

    // Update settings (exclude id, createdAt, updatedAt from update)
    const [updatedSettings] = await db
      .update(similarProductsSettings)
      .set({
        ...updateData,
        updatedAt: new Date()
      })
      .where(eq(similarProductsSettings.id, existingSettings.id))
      .returning();

    logger.info('Updated similar products settings');

    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: updatedSettings
    });
  } catch (error) {
    logger.error('Error updating similar products settings:', error);
    next(error);
  }
};

/**
 * Reset settings to defaults
 */
export const resetSettings = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    logger.info('POST /api/similar-products-settings/reset');

    // Get existing settings
    const [existingSettings] = await db
      .select()
      .from(similarProductsSettings)
      .limit(1);

    if (!existingSettings) {
      return res.status(404).json({
        success: false,
        message: 'Settings not found'
      });
    }

    // Reset to defaults (delete and recreate)
    await db.delete(similarProductsSettings);

    const [newSettings] = await db
      .insert(similarProductsSettings)
      .values({})
      .returning();

    logger.info('Reset similar products settings to defaults');

    res.json({
      success: true,
      message: 'Settings reset to defaults',
      data: newSettings
    });
  } catch (error) {
    logger.error('Error resetting similar products settings:', error);
    next(error);
  }
};
