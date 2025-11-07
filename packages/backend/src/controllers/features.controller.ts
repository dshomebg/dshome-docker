import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { featureGroups, featureValues } from '../db/schema';
import { eq, desc, ilike, asc, count } from 'drizzle-orm';
import { AppError } from '../middleware/error.middleware';
import { logger } from '../utils/logger';

// Get all feature groups with optional search and pagination
export const getFeatureGroups = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, page = '1', limit = '20', status } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    let query = db.select().from(featureGroups);

    // Apply filters
    const conditions = [];
    if (search) {
      conditions.push(ilike(featureGroups.name, `%${search}%`));
    }
    if (status) {
      conditions.push(eq(featureGroups.status, status as any));
    }

    if (conditions.length > 0) {
      query = query.where(conditions[0]) as any;
    }

    const groupsList = await query
      .orderBy(desc(featureGroups.createdAt))
      .limit(limitNum)
      .offset(offset);

    // Load values count for each group
    const groupsWithValues = await Promise.all(
      groupsList.map(async (group) => {
        const values = await db.select()
          .from(featureValues)
          .where(eq(featureValues.featureGroupId, group.id));
        return {
          ...group,
          values
        };
      })
    );

    const [{ value: totalCount }] = await db
      .select({ value: count() })
      .from(featureGroups);

    logger.info(`Fetched ${groupsList.length} feature groups`);

    res.json({
      data: groupsWithValues,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount || 0,
        totalPages: Math.ceil((totalCount || 0) / limitNum)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get single feature group by ID with its values
export const getFeatureGroup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const [group] = await db.select().from(featureGroups).where(eq(featureGroups.id, id)).limit(1);

    if (!group) {
      throw new AppError(404, 'Feature group not found', 'FEATURE_GROUP_NOT_FOUND');
    }

    // Get all values for this group
    const values = await db.select()
      .from(featureValues)
      .where(eq(featureValues.featureGroupId, id))
      .orderBy(asc(featureValues.position));

    res.json({
      data: {
        ...group,
        values
      }
    });
  } catch (error) {
    next(error);
  }
};

// Create new feature group
export const createFeatureGroup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, status } = req.body;

    const [newGroup] = await db.insert(featureGroups).values({
      name,
      status: status || 'active',
      updatedAt: new Date()
    }).returning();

    logger.info(`Feature group created: ${newGroup.name} (${newGroup.id})`);

    res.status(201).json({ data: newGroup });
  } catch (error) {
    next(error);
  }
};

// Update feature group
export const updateFeatureGroup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, status } = req.body;

    // Check if group exists
    const [existingGroup] = await db.select().from(featureGroups).where(eq(featureGroups.id, id)).limit(1);
    if (!existingGroup) {
      throw new AppError(404, 'Feature group not found', 'FEATURE_GROUP_NOT_FOUND');
    }

    const [updatedGroup] = await db.update(featureGroups)
      .set({
        name,
        status,
        updatedAt: new Date()
      })
      .where(eq(featureGroups.id, id))
      .returning();

    logger.info(`Feature group updated: ${updatedGroup.name} (${updatedGroup.id})`);

    res.json({ data: updatedGroup });
  } catch (error) {
    next(error);
  }
};

// Delete feature group
export const deleteFeatureGroup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const [existingGroup] = await db.select().from(featureGroups).where(eq(featureGroups.id, id)).limit(1);
    if (!existingGroup) {
      throw new AppError(404, 'Feature group not found', 'FEATURE_GROUP_NOT_FOUND');
    }

    // Values will be deleted automatically due to cascade
    await db.delete(featureGroups).where(eq(featureGroups.id, id));

    logger.info(`Feature group deleted: ${existingGroup.name} (${id})`);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// Get all values for a specific feature group
export const getFeatureValues = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { groupId } = req.params;

    // Verify group exists
    const [group] = await db.select().from(featureGroups).where(eq(featureGroups.id, groupId)).limit(1);
    if (!group) {
      throw new AppError(404, 'Feature group not found', 'FEATURE_GROUP_NOT_FOUND');
    }

    const values = await db.select()
      .from(featureValues)
      .where(eq(featureValues.featureGroupId, groupId))
      .orderBy(asc(featureValues.position));

    res.json({ data: values });
  } catch (error) {
    next(error);
  }
};

// Create new feature value
export const createFeatureValue = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { groupId } = req.params;
    const { name, position } = req.body;

    // Verify group exists
    const [group] = await db.select().from(featureGroups).where(eq(featureGroups.id, groupId)).limit(1);
    if (!group) {
      throw new AppError(404, 'Feature group not found', 'FEATURE_GROUP_NOT_FOUND');
    }

    // Get max position if not provided
    let finalPosition = position;
    if (finalPosition === undefined) {
      const [maxPos] = await db.select({ max: featureValues.position })
        .from(featureValues)
        .where(eq(featureValues.featureGroupId, groupId)) as any;
      finalPosition = (maxPos?.max || 0) + 1;
    }

    const [newValue] = await db.insert(featureValues).values({
      featureGroupId: groupId,
      name,
      position: finalPosition,
      updatedAt: new Date()
    }).returning();

    logger.info(`Feature value created: ${newValue.name} for group ${groupId}`);

    res.status(201).json({ data: newValue });
  } catch (error) {
    next(error);
  }
};

// Update feature value
export const updateFeatureValue = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, position } = req.body;

    // Check if value exists
    const [existingValue] = await db.select().from(featureValues).where(eq(featureValues.id, id)).limit(1);
    if (!existingValue) {
      throw new AppError(404, 'Feature value not found', 'FEATURE_VALUE_NOT_FOUND');
    }

    const [updatedValue] = await db.update(featureValues)
      .set({
        name,
        position,
        updatedAt: new Date()
      })
      .where(eq(featureValues.id, id))
      .returning();

    logger.info(`Feature value updated: ${updatedValue.name} (${updatedValue.id})`);

    res.json({ data: updatedValue });
  } catch (error) {
    next(error);
  }
};

// Delete feature value
export const deleteFeatureValue = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const [existingValue] = await db.select().from(featureValues).where(eq(featureValues.id, id)).limit(1);
    if (!existingValue) {
      throw new AppError(404, 'Feature value not found', 'FEATURE_VALUE_NOT_FOUND');
    }

    await db.delete(featureValues).where(eq(featureValues.id, id));

    logger.info(`Feature value deleted: ${existingValue.name} (${id})`);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// Reorder feature values
export const reorderFeatureValues = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { groupId } = req.params;
    const { valueIds } = req.body; // Array of value IDs in new order

    if (!Array.isArray(valueIds)) {
      throw new AppError(400, 'valueIds must be an array', 'INVALID_VALUE_IDS');
    }

    // Update position for each value
    await Promise.all(
      valueIds.map((valueId, index) =>
        db.update(featureValues)
          .set({ position: index, updatedAt: new Date() })
          .where(eq(featureValues.id, valueId))
      )
    );

    logger.info(`Feature values reordered for group ${groupId}`);

    res.json({ message: 'Values reordered successfully' });
  } catch (error) {
    next(error);
  }
};
