import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { suppliers } from '../db/schema';
import { eq, desc, ilike, or, count } from 'drizzle-orm';
import { AppError } from '../middleware/error.middleware';
import { logger } from '../utils/logger';

// Get all suppliers with optional search and pagination
export const getSuppliers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, page = '1', limit = '20', status } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    let query = db.select().from(suppliers);

    // Apply filters
    const conditions = [];
    if (search) {
      conditions.push(
        or(
          ilike(suppliers.name, `%${search}%`),
          ilike(suppliers.slug, `%${search}%`),
          ilike(suppliers.email, `%${search}%`)
        )
      );
    }
    if (status) {
      conditions.push(eq(suppliers.status, status as any));
    }

    if (conditions.length > 0) {
      query = query.where(conditions[0]) as any;
    }

    const suppliersList = await query
      .orderBy(desc(suppliers.createdAt))
      .limit(limitNum)
      .offset(offset);

    const [{ value: totalCount }] = await db
      .select({ value: count() })
      .from(suppliers);

    logger.info(`Fetched ${suppliersList.length} suppliers`);

    res.json({
      data: suppliersList,
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

// Get single supplier by ID
export const getSupplier = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const [supplier] = await db.select().from(suppliers).where(eq(suppliers.id, id)).limit(1);

    if (!supplier) {
      throw new AppError(404, 'Supplier not found', 'SUPPLIER_NOT_FOUND');
    }

    res.json({ data: supplier });
  } catch (error) {
    next(error);
  }
};

// Create new supplier
export const createSupplier = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, slug, email, phone, address, vat, contactPerson, description, status, isDefault } = req.body;

    // Check if slug already exists
    const [existingSupplier] = await db.select().from(suppliers).where(eq(suppliers.slug, slug)).limit(1);
    if (existingSupplier) {
      throw new AppError(400, 'Supplier with this slug already exists', 'SLUG_EXISTS');
    }

    // If setting as default, unset other default suppliers
    if (isDefault) {
      await db.update(suppliers).set({ isDefault: false }).where(eq(suppliers.isDefault, true));
    }

    const [newSupplier] = await db.insert(suppliers).values({
      name,
      slug,
      email,
      phone,
      address,
      vat,
      contactPerson,
      description,
      status: status || 'active',
      isDefault: isDefault || false,
      updatedAt: new Date()
    }).returning();

    logger.info(`Supplier created: ${newSupplier.name} (${newSupplier.id})`);

    res.status(201).json({ data: newSupplier });
  } catch (error) {
    next(error);
  }
};

// Update supplier
export const updateSupplier = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, slug, email, phone, address, vat, contactPerson, description, status, isDefault } = req.body;

    // Check if supplier exists
    const [existingSupplier] = await db.select().from(suppliers).where(eq(suppliers.id, id)).limit(1);
    if (!existingSupplier) {
      throw new AppError(404, 'Supplier not found', 'SUPPLIER_NOT_FOUND');
    }

    // Check if slug is taken by another supplier
    if (slug && slug !== existingSupplier.slug) {
      const [supplierWithSlug] = await db.select().from(suppliers).where(eq(suppliers.slug, slug)).limit(1);
      if (supplierWithSlug && supplierWithSlug.id !== id) {
        throw new AppError(400, 'Supplier with this slug already exists', 'SLUG_EXISTS');
      }
    }

    // If setting as default, unset other default suppliers
    if (isDefault && !existingSupplier.isDefault) {
      await db.update(suppliers).set({ isDefault: false }).where(eq(suppliers.isDefault, true));
    }

    const [updatedSupplier] = await db.update(suppliers)
      .set({
        name,
        slug,
        email,
        phone,
        address,
        vat,
        contactPerson,
        description,
        status,
        isDefault,
        updatedAt: new Date()
      })
      .where(eq(suppliers.id, id))
      .returning();

    logger.info(`Supplier updated: ${updatedSupplier.name} (${updatedSupplier.id})`);

    res.json({ data: updatedSupplier });
  } catch (error) {
    next(error);
  }
};

// Delete supplier
export const deleteSupplier = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const [existingSupplier] = await db.select().from(suppliers).where(eq(suppliers.id, id)).limit(1);
    if (!existingSupplier) {
      throw new AppError(404, 'Supplier not found', 'SUPPLIER_NOT_FOUND');
    }

    await db.delete(suppliers).where(eq(suppliers.id, id));

    logger.info(`Supplier deleted: ${existingSupplier.name} (${id})`);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// Get default supplier
export const getDefaultSupplier = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [defaultSupplier] = await db.select().from(suppliers).where(eq(suppliers.isDefault, true)).limit(1);

    if (!defaultSupplier) {
      return res.json({ data: null });
    }

    res.json({ data: defaultSupplier });
  } catch (error) {
    next(error);
  }
};
