import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { warehouses } from '../db/schema';
import { eq, desc, ilike, or } from 'drizzle-orm';
import { AppError } from '../middleware/error.middleware';
import { logger } from '../utils/logger';

// Get all warehouses with optional search and pagination
export const getWarehouses = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, page = '1', limit = '20', status } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    let query = db.select().from(warehouses);

    // Apply filters
    const conditions = [];
    if (search) {
      conditions.push(
        or(
          ilike(warehouses.name, `%${search}%`),
          ilike(warehouses.address, `%${search}%`)
        )
      );
    }
    if (status) {
      conditions.push(eq(warehouses.status, status as any));
    }

    if (conditions.length > 0) {
      query = query.where(conditions[0]) as any;
    }

    const [warehousesList, [{ count }]] = await Promise.all([
      query
        .orderBy(desc(warehouses.createdAt))
        .limit(limitNum)
        .offset(offset),
      db.select({ count: warehouses.id }).from(warehouses) as any
    ]);

    logger.info(`Fetched ${warehousesList.length} warehouses`);

    res.json({
      data: warehousesList,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: parseInt(count),
        totalPages: Math.ceil(parseInt(count) / limitNum)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get single warehouse by ID
export const getWarehouse = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const [warehouse] = await db.select().from(warehouses).where(eq(warehouses.id, id)).limit(1);

    if (!warehouse) {
      throw new AppError(404, 'Warehouse not found', 'WAREHOUSE_NOT_FOUND');
    }

    res.json({ data: warehouse });
  } catch (error) {
    next(error);
  }
};

// Create new warehouse
export const createWarehouse = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, address, phone, workingHours, url, latitude, longitude, isPhysicalStore, status } = req.body;

    const [newWarehouse] = await db.insert(warehouses).values({
      name,
      address,
      phone,
      workingHours,
      url,
      latitude: latitude && latitude !== '' ? latitude : null,
      longitude: longitude && longitude !== '' ? longitude : null,
      isPhysicalStore: isPhysicalStore || false,
      status: status || 'active',
      updatedAt: new Date()
    }).returning();

    logger.info(`Warehouse created: ${newWarehouse.name} (${newWarehouse.id})`);

    res.status(201).json({ data: newWarehouse });
  } catch (error) {
    next(error);
  }
};

// Update warehouse
export const updateWarehouse = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, address, phone, workingHours, url, latitude, longitude, isPhysicalStore, status } = req.body;

    // Check if warehouse exists
    const [existingWarehouse] = await db.select().from(warehouses).where(eq(warehouses.id, id)).limit(1);
    if (!existingWarehouse) {
      throw new AppError(404, 'Warehouse not found', 'WAREHOUSE_NOT_FOUND');
    }

    const [updatedWarehouse] = await db.update(warehouses)
      .set({
        name,
        address,
        phone,
        workingHours,
        url,
        latitude: latitude && latitude !== '' ? latitude : null,
        longitude: longitude && longitude !== '' ? longitude : null,
        isPhysicalStore,
        status,
        updatedAt: new Date()
      })
      .where(eq(warehouses.id, id))
      .returning();

    logger.info(`Warehouse updated: ${updatedWarehouse.name} (${updatedWarehouse.id})`);

    res.json({ data: updatedWarehouse });
  } catch (error) {
    next(error);
  }
};

// Delete warehouse
export const deleteWarehouse = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const [existingWarehouse] = await db.select().from(warehouses).where(eq(warehouses.id, id)).limit(1);
    if (!existingWarehouse) {
      throw new AppError(404, 'Warehouse not found', 'WAREHOUSE_NOT_FOUND');
    }

    await db.delete(warehouses).where(eq(warehouses.id, id));

    logger.info(`Warehouse deleted: ${existingWarehouse.name} (${id})`);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
