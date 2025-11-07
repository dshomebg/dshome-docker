import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { attributeGroups, attributeValues } from '../db/schema';
import { eq, desc, ilike, or, asc, count } from 'drizzle-orm';
import { AppError } from '../middleware/error.middleware';
import { logger } from '../utils/logger';

// Get all attribute groups with optional search and pagination
export const getAttributeGroups = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, page = '1', limit = '20', status } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    let query = db.select().from(attributeGroups);

    // Apply filters
    const conditions = [];
    if (search) {
      conditions.push(ilike(attributeGroups.name, `%${search}%`));
    }
    if (status) {
      conditions.push(eq(attributeGroups.status, status as any));
    }

    if (conditions.length > 0) {
      query = query.where(conditions[0]) as any;
    }

    const groupsList = await query
      .orderBy(desc(attributeGroups.createdAt))
      .limit(limitNum)
      .offset(offset);

    const [{ value: totalCount }] = await db
      .select({ value: count() })
      .from(attributeGroups);

    logger.info(`Fetched ${groupsList.length} attribute groups`);

    res.json({
      data: groupsList,
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

// Get single attribute group by ID with its values
export const getAttributeGroup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const [group] = await db.select().from(attributeGroups).where(eq(attributeGroups.id, id)).limit(1);

    if (!group) {
      throw new AppError(404, 'Attribute group not found', 'ATTRIBUTE_GROUP_NOT_FOUND');
    }

    // Get all values for this group
    const values = await db.select()
      .from(attributeValues)
      .where(eq(attributeValues.attributeGroupId, id))
      .orderBy(asc(attributeValues.position));

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

// Create new attribute group
export const createAttributeGroup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, displayType, status } = req.body;

    const [newGroup] = await db.insert(attributeGroups).values({
      name,
      displayType: displayType || 'dropdown',
      status: status || 'active',
      updatedAt: new Date()
    }).returning();

    logger.info(`Attribute group created: ${newGroup.name} (${newGroup.id})`);

    res.status(201).json({ data: newGroup });
  } catch (error) {
    next(error);
  }
};

// Update attribute group
export const updateAttributeGroup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, displayType, status } = req.body;

    // Check if group exists
    const [existingGroup] = await db.select().from(attributeGroups).where(eq(attributeGroups.id, id)).limit(1);
    if (!existingGroup) {
      throw new AppError(404, 'Attribute group not found', 'ATTRIBUTE_GROUP_NOT_FOUND');
    }

    const [updatedGroup] = await db.update(attributeGroups)
      .set({
        name,
        displayType,
        status,
        updatedAt: new Date()
      })
      .where(eq(attributeGroups.id, id))
      .returning();

    logger.info(`Attribute group updated: ${updatedGroup.name} (${updatedGroup.id})`);

    res.json({ data: updatedGroup });
  } catch (error) {
    next(error);
  }
};

// Delete attribute group
export const deleteAttributeGroup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const [existingGroup] = await db.select().from(attributeGroups).where(eq(attributeGroups.id, id)).limit(1);
    if (!existingGroup) {
      throw new AppError(404, 'Attribute group not found', 'ATTRIBUTE_GROUP_NOT_FOUND');
    }

    // Values will be deleted automatically due to cascade
    await db.delete(attributeGroups).where(eq(attributeGroups.id, id));

    logger.info(`Attribute group deleted: ${existingGroup.name} (${id})`);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// Get all values for a specific attribute group
export const getAttributeValues = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { groupId } = req.params;

    // Verify group exists
    const [group] = await db.select().from(attributeGroups).where(eq(attributeGroups.id, groupId)).limit(1);
    if (!group) {
      throw new AppError(404, 'Attribute group not found', 'ATTRIBUTE_GROUP_NOT_FOUND');
    }

    const values = await db.select()
      .from(attributeValues)
      .where(eq(attributeValues.attributeGroupId, groupId))
      .orderBy(asc(attributeValues.position));

    res.json({ data: values });
  } catch (error) {
    next(error);
  }
};

// Create new attribute value
export const createAttributeValue = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { groupId } = req.params;
    const { name, colorHex, textureImage, position } = req.body;

    // Verify group exists
    const [group] = await db.select().from(attributeGroups).where(eq(attributeGroups.id, groupId)).limit(1);
    if (!group) {
      throw new AppError(404, 'Attribute group not found', 'ATTRIBUTE_GROUP_NOT_FOUND');
    }

    // Get max position if not provided
    let finalPosition = position;
    if (finalPosition === undefined) {
      const [maxPos] = await db.select({ max: attributeValues.position })
        .from(attributeValues)
        .where(eq(attributeValues.attributeGroupId, groupId)) as any;
      finalPosition = (maxPos?.max || 0) + 1;
    }

    const [newValue] = await db.insert(attributeValues).values({
      attributeGroupId: groupId,
      name,
      colorHex,
      textureImage,
      position: finalPosition,
      updatedAt: new Date()
    }).returning();

    logger.info(`Attribute value created: ${newValue.name} for group ${groupId}`);

    res.status(201).json({ data: newValue });
  } catch (error) {
    next(error);
  }
};

// Update attribute value
export const updateAttributeValue = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, colorHex, textureImage, position } = req.body;

    // Check if value exists
    const [existingValue] = await db.select().from(attributeValues).where(eq(attributeValues.id, id)).limit(1);
    if (!existingValue) {
      throw new AppError(404, 'Attribute value not found', 'ATTRIBUTE_VALUE_NOT_FOUND');
    }

    const [updatedValue] = await db.update(attributeValues)
      .set({
        name,
        colorHex,
        textureImage,
        position,
        updatedAt: new Date()
      })
      .where(eq(attributeValues.id, id))
      .returning();

    logger.info(`Attribute value updated: ${updatedValue.name} (${updatedValue.id})`);

    res.json({ data: updatedValue });
  } catch (error) {
    next(error);
  }
};

// Delete attribute value
export const deleteAttributeValue = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const [existingValue] = await db.select().from(attributeValues).where(eq(attributeValues.id, id)).limit(1);
    if (!existingValue) {
      throw new AppError(404, 'Attribute value not found', 'ATTRIBUTE_VALUE_NOT_FOUND');
    }

    await db.delete(attributeValues).where(eq(attributeValues.id, id));

    logger.info(`Attribute value deleted: ${existingValue.name} (${id})`);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// Reorder attribute values
export const reorderAttributeValues = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { groupId } = req.params;
    const { valueIds } = req.body; // Array of value IDs in new order

    if (!Array.isArray(valueIds)) {
      throw new AppError(400, 'valueIds must be an array', 'INVALID_VALUE_IDS');
    }

    // Update position for each value
    await Promise.all(
      valueIds.map((valueId, index) =>
        db.update(attributeValues)
          .set({ position: index, updatedAt: new Date() })
          .where(eq(attributeValues.id, valueId))
      )
    );

    logger.info(`Attribute values reordered for group ${groupId}`);

    res.json({ message: 'Values reordered successfully' });
  } catch (error) {
    next(error);
  }
};
