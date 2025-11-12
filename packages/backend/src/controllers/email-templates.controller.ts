import { Request, Response, NextFunction } from 'express';
import { eq, desc, sql } from 'drizzle-orm';
import { db } from '../db';
import { emailTemplates } from '../db/schema';
import { AppError } from '../middleware/error.middleware';

// Get all email templates
export const getEmailTemplates = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search } = req.query;

    let query = db.select().from(emailTemplates);

    if (search) {
      query = query.where(
        sql`${emailTemplates.name} ILIKE ${`%${search}%`} OR ${emailTemplates.subject} ILIKE ${`%${search}%`}`
      ) as any;
    }

    const result = await query.orderBy(desc(emailTemplates.createdAt));

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// Get single email template
export const getEmailTemplate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const template = await db.select().from(emailTemplates).where(eq(emailTemplates.id, id)).limit(1);

    if (!template.length) {
      throw new AppError(404, 'Email template not found', 'TEMPLATE_NOT_FOUND');
    }

    res.json({
      success: true,
      data: template[0],
    });
  } catch (error) {
    next(error);
  }
};

// Create email template
export const createEmailTemplate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, subject, content } = req.body;

    if (!name || !subject || !content) {
      throw new AppError(400, 'Name, subject, and content are required', 'VALIDATION_ERROR');
    }

    // Check if template with this name already exists
    const existing = await db
      .select()
      .from(emailTemplates)
      .where(eq(emailTemplates.name, name))
      .limit(1);

    if (existing.length > 0) {
      throw new AppError(400, 'Email template with this name already exists', 'DUPLICATE_NAME');
    }

    const [newTemplate] = await db
      .insert(emailTemplates)
      .values({
        name,
        subject,
        content,
      })
      .returning();

    res.status(201).json({
      success: true,
      data: newTemplate,
    });
  } catch (error) {
    next(error);
  }
};

// Update email template
export const updateEmailTemplate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, subject, content } = req.body;

    const existing = await db.select().from(emailTemplates).where(eq(emailTemplates.id, id)).limit(1);

    if (!existing.length) {
      throw new AppError(404, 'Email template not found', 'TEMPLATE_NOT_FOUND');
    }

    // Check if new name conflicts with another template
    if (name && name !== existing[0].name) {
      const nameExists = await db
        .select()
        .from(emailTemplates)
        .where(eq(emailTemplates.name, name))
        .limit(1);

      if (nameExists.length > 0) {
        throw new AppError(400, 'Email template with this name already exists', 'DUPLICATE_NAME');
      }
    }

    const [updated] = await db
      .update(emailTemplates)
      .set({
        name,
        subject,
        content,
        updatedAt: new Date(),
      })
      .where(eq(emailTemplates.id, id))
      .returning();

    res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// Delete email template
export const deleteEmailTemplate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const existing = await db.select().from(emailTemplates).where(eq(emailTemplates.id, id)).limit(1);

    if (!existing.length) {
      throw new AppError(404, 'Email template not found', 'TEMPLATE_NOT_FOUND');
    }

    await db.delete(emailTemplates).where(eq(emailTemplates.id, id));

    res.json({
      success: true,
      message: 'Email template deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Get available variables
export const getAvailableVariables = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const variables = [
      { key: '{shop_name}', description: 'Име на магазина' },
      { key: '{shop_email}', description: 'Email на магазина' },
      { key: '{shop_url}', description: 'URL на магазина' },
      { key: '{customer_first_name}', description: 'Име на клиента' },
      { key: '{customer_last_name}', description: 'Фамилия на клиента' },
      { key: '{customer_email}', description: 'Email на клиента' },
      { key: '{order_reference}', description: 'Номер на поръчка' },
      { key: '{order_total}', description: 'Обща стойност на поръчката' },
      { key: '{order_date}', description: 'Дата на поръчката' },
      { key: '{order_status}', description: 'Статус на поръчката' },
      { key: '{tracking_number}', description: 'Номер за проследяване' },
      { key: '{tracking_url}', description: 'URL за проследяване' },
      { key: '{courier_name}', description: 'Име на куриера' },
      { key: '{products_list}', description: 'Списък с продукти (HTML таблица)' },
      { key: '{delivery_address}', description: 'Адрес за доставка' },
      { key: '{billing_address}', description: 'Адрес за фактуриране' },
      { key: '{payment_method}', description: 'Метод на плащане' },
    ];

    res.json({
      success: true,
      data: variables,
    });
  } catch (error) {
    next(error);
  }
};
