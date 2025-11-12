import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { customers } from '../db/schema';
import { eq, desc, ilike, or, count } from 'drizzle-orm';
import { AppError } from '../middleware/error.middleware';
import { logger } from '../utils/logger';
import bcrypt from 'bcryptjs';

// Get all customers with optional search and pagination
export const getCustomers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, page = '1', limit = '20', isRegistered, isActive } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    let query = db.select().from(customers);

    // Apply filters
    const conditions = [];
    if (search) {
      conditions.push(
        or(
          ilike(customers.firstName, `%${search}%`),
          ilike(customers.lastName, `%${search}%`),
          ilike(customers.email, `%${search}%`),
          ilike(customers.phone, `%${search}%`),
          ilike(customers.companyName, `%${search}%`)
        )
      );
    }
    if (isRegistered !== undefined) {
      conditions.push(eq(customers.isRegistered, isRegistered === 'true'));
    }
    if (isActive !== undefined) {
      conditions.push(eq(customers.isActive, isActive === 'true'));
    }

    if (conditions.length > 0) {
      query = query.where(conditions[0]) as any;
    }

    // Build count query with same filters
    let countQuery = db.select({ count: count() }).from(customers);
    if (conditions.length > 0) {
      countQuery = countQuery.where(conditions[0]) as any;
    }

    const [customersList, countResult] = await Promise.all([
      query
        .orderBy(desc(customers.createdAt))
        .limit(limitNum)
        .offset(offset),
      countQuery
    ]);

    const totalCount = Number(countResult[0]?.count || 0);

    // Remove password from response
    const customersData = customersList.map(({ password, ...customer }) => customer);

    logger.info(`Fetched ${customersList.length} customers`);

    res.json({
      data: customersData,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limitNum)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get single customer by ID
export const getCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const [customer] = await db.select().from(customers).where(eq(customers.id, id)).limit(1);

    if (!customer) {
      throw new AppError(404, 'Customer not found', 'CUSTOMER_NOT_FOUND');
    }

    // Remove password from response
    const { password, ...customerData } = customer;

    res.json({ data: customerData });
  } catch (error) {
    next(error);
  }
};

// Create new customer
export const createCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      address,
      city,
      postalCode,
      country = 'Bulgaria',
      companyName,
      vatNumber,
      isRegistered = false,
      password,
      notes
    } = req.body;

    // Check if email already exists
    const [existingCustomer] = await db.select().from(customers).where(eq(customers.email, email)).limit(1);
    if (existingCustomer) {
      throw new AppError(400, 'Customer with this email already exists', 'EMAIL_EXISTS');
    }

    // Hash password if provided and customer is registered
    let hashedPassword = null;
    if (isRegistered && password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const [newCustomer] = await db.insert(customers).values({
      firstName,
      lastName,
      email,
      phone,
      address,
      city,
      postalCode,
      country,
      companyName,
      vatNumber,
      isRegistered,
      password: hashedPassword,
      notes,
      isActive: true
    }).returning();

    // Remove password from response
    const { password: _, ...customerData } = newCustomer;

    logger.info(`Created new customer: ${email}`);

    res.status(201).json({ data: customerData });
  } catch (error) {
    next(error);
  }
};

// Update customer
export const updateCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const {
      firstName,
      lastName,
      email,
      phone,
      address,
      city,
      postalCode,
      country,
      companyName,
      vatNumber,
      isRegistered,
      password,
      isActive,
      notes
    } = req.body;

    // Check if customer exists
    const [existingCustomer] = await db.select().from(customers).where(eq(customers.id, id)).limit(1);
    if (!existingCustomer) {
      throw new AppError(404, 'Customer not found', 'CUSTOMER_NOT_FOUND');
    }

    // Check if email is being changed and if new email already exists
    if (email && email !== existingCustomer.email) {
      const [emailExists] = await db.select().from(customers).where(eq(customers.email, email)).limit(1);
      if (emailExists) {
        throw new AppError(400, 'Customer with this email already exists', 'EMAIL_EXISTS');
      }
    }

    // Prepare update data
    const updateData: any = {
      firstName,
      lastName,
      email,
      phone,
      address,
      city,
      postalCode,
      country,
      companyName,
      vatNumber,
      isRegistered,
      isActive,
      notes,
      updatedAt: new Date()
    };

    // Hash new password if provided
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const [updatedCustomer] = await db
      .update(customers)
      .set(updateData)
      .where(eq(customers.id, id))
      .returning();

    // Remove password from response
    const { password: _, ...customerData } = updatedCustomer;

    logger.info(`Updated customer: ${id}`);

    res.json({ data: customerData });
  } catch (error) {
    next(error);
  }
};

// Delete customer
export const deleteCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Check if customer exists
    const [existingCustomer] = await db.select().from(customers).where(eq(customers.id, id)).limit(1);
    if (!existingCustomer) {
      throw new AppError(404, 'Customer not found', 'CUSTOMER_NOT_FOUND');
    }

    // TODO: Check if customer has orders - might want to prevent deletion or soft delete

    await db.delete(customers).where(eq(customers.id, id));

    logger.info(`Deleted customer: ${id}`);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// Get customer statistics
export const getCustomerStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Check if customer exists
    const [customer] = await db.select().from(customers).where(eq(customers.id, id)).limit(1);
    if (!customer) {
      throw new AppError(404, 'Customer not found', 'CUSTOMER_NOT_FOUND');
    }

    // TODO: Get orders count, total spent, etc. when orders module is ready
    const stats = {
      totalOrders: 0,
      totalSpent: 0,
      averageOrderValue: 0,
      lastOrderDate: null
    };

    res.json({ data: stats });
  } catch (error) {
    next(error);
  }
};

// Change customer password
export const changeCustomerPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      throw new AppError(400, 'Password must be at least 6 characters', 'INVALID_PASSWORD');
    }

    // Check if customer exists
    const [customer] = await db.select().from(customers).where(eq(customers.id, id)).limit(1);
    if (!customer) {
      throw new AppError(404, 'Customer not found', 'CUSTOMER_NOT_FOUND');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password and mark as registered if not already
    await db
      .update(customers)
      .set({
        password: hashedPassword,
        isRegistered: true, // Automatically mark as registered when password is set
        updatedAt: new Date()
      })
      .where(eq(customers.id, id));

    logger.info(`Changed password for customer: ${id}`);

    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    next(error);
  }
};
