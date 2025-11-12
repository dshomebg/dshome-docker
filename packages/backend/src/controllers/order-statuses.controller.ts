import { Request, Response } from 'express';
import { db } from '../db';
import { orderStatuses } from '../db/schema';
import { eq, asc } from 'drizzle-orm';

// Get all order statuses
export const getOrderStatuses = async (req: Request, res: Response) => {
  try {
    const statuses = await db
      .select()
      .from(orderStatuses)
      .orderBy(asc(orderStatuses.position), asc(orderStatuses.name));

    res.json({
      success: true,
      data: statuses,
    });
  } catch (error: any) {
    console.error('Error fetching order statuses:', error);
    res.status(500).json({
      success: false,
      message: 'Неуспешно зареждане на статуси',
      error: error.message,
    });
  }
};

// Get single order status by ID
export const getOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [status] = await db
      .select()
      .from(orderStatuses)
      .where(eq(orderStatuses.id, id))
      .limit(1);

    if (!status) {
      return res.status(404).json({
        success: false,
        message: 'Статусът не е намерен',
      });
    }

    res.json({
      success: true,
      data: status,
    });
  } catch (error: any) {
    console.error('Error fetching order status:', error);
    res.status(500).json({
      success: false,
      message: 'Неуспешно зареждане на статус',
      error: error.message,
    });
  }
};

// Create order status
export const createOrderStatus = async (req: Request, res: Response) => {
  try {
    const { name, color, visibleToCustomer, sendEmail, emailTemplateId, position } = req.body;

    // Validate required fields
    if (!name || !color) {
      return res.status(400).json({
        success: false,
        message: 'Името и цветът са задължителни',
      });
    }

    // Validate HEX color format
    const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
    if (!hexColorRegex.test(color)) {
      return res.status(400).json({
        success: false,
        message: 'Невалиден HEX цвят формат',
      });
    }

    // Validate email template if sendEmail is true
    if (sendEmail && !emailTemplateId) {
      return res.status(400).json({
        success: false,
        message: 'Изберете email шаблон, когато изпращането на имейл е активирано',
      });
    }

    const [newStatus] = await db
      .insert(orderStatuses)
      .values({
        name: name.trim(),
        color,
        visibleToCustomer: visibleToCustomer ?? true,
        sendEmail: sendEmail ?? false,
        emailTemplateId: sendEmail ? emailTemplateId : null,
        position: position ?? 0,
      })
      .returning();

    res.status(201).json({
      success: true,
      data: newStatus,
      message: 'Статусът е създаден успешно',
    });
  } catch (error: any) {
    console.error('Error creating order status:', error);

    if (error.code === '23505') { // Unique constraint violation
      return res.status(400).json({
        success: false,
        message: 'Статус с това име вече съществува',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Неуспешно създаване на статус',
      error: error.message,
    });
  }
};

// Update order status
export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, color, visibleToCustomer, sendEmail, emailTemplateId, position } = req.body;

    // Check if status exists
    const [existingStatus] = await db
      .select()
      .from(orderStatuses)
      .where(eq(orderStatuses.id, id))
      .limit(1);

    if (!existingStatus) {
      return res.status(404).json({
        success: false,
        message: 'Статусът не е намерен',
      });
    }

    // Validate required fields
    if (!name || !color) {
      return res.status(400).json({
        success: false,
        message: 'Името и цветът са задължителни',
      });
    }

    // Validate HEX color format
    const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
    if (!hexColorRegex.test(color)) {
      return res.status(400).json({
        success: false,
        message: 'Невалиден HEX цвят формат',
      });
    }

    // Validate email template if sendEmail is true
    if (sendEmail && !emailTemplateId) {
      return res.status(400).json({
        success: false,
        message: 'Изберете email шаблон, когато изпращането на имейл е активирано',
      });
    }

    const [updatedStatus] = await db
      .update(orderStatuses)
      .set({
        name: name.trim(),
        color,
        visibleToCustomer: visibleToCustomer ?? true,
        sendEmail: sendEmail ?? false,
        emailTemplateId: sendEmail ? emailTemplateId : null,
        position: position ?? existingStatus.position,
        updatedAt: new Date(),
      })
      .where(eq(orderStatuses.id, id))
      .returning();

    res.json({
      success: true,
      data: updatedStatus,
      message: 'Статусът е актуализиран успешно',
    });
  } catch (error: any) {
    console.error('Error updating order status:', error);

    if (error.code === '23505') { // Unique constraint violation
      return res.status(400).json({
        success: false,
        message: 'Статус с това име вече съществува',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Неуспешно актуализиране на статус',
      error: error.message,
    });
  }
};

// Delete order status
export const deleteOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if status exists
    const [existingStatus] = await db
      .select()
      .from(orderStatuses)
      .where(eq(orderStatuses.id, id))
      .limit(1);

    if (!existingStatus) {
      return res.status(404).json({
        success: false,
        message: 'Статусът не е намерен',
      });
    }

    // TODO: Check if status is used in any orders before deleting
    // For now, we'll allow deletion

    await db
      .delete(orderStatuses)
      .where(eq(orderStatuses.id, id));

    res.json({
      success: true,
      message: 'Статусът е изтрит успешно',
    });
  } catch (error: any) {
    console.error('Error deleting order status:', error);
    res.status(500).json({
      success: false,
      message: 'Неуспешно изтриване на статус',
      error: error.message,
    });
  }
};
