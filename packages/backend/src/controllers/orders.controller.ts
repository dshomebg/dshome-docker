import { Request, Response, NextFunction } from 'express';
import { db, sql } from '../db';
import { orders, orderItems, shippingAddresses } from '../db/schema/orders';
import { customers } from '../db/schema/customers';
import { couriers } from '../db/schema/couriers';
import { orderStatuses } from '../db/schema/order-statuses';
import { products } from '../db/schema/products';
import { eq, desc, ilike, or, count, and, gte, lte } from 'drizzle-orm';
import { AppError } from '../middleware/error.middleware';
import { logger } from '../utils/logger';

// Helper to convert snake_case to camelCase
const toCamelCase = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(toCamelCase);
  }
  // Handle Date objects - don't process them
  if (obj instanceof Date) {
    return obj;
  }
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((result: any, key: string) => {
      const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
      result[camelKey] = toCamelCase(obj[key]);
      return result;
    }, {});
  }
  return obj;
};

// Create new order
export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      customerEmail,
      customerPhone,
      customerFirstName,
      customerLastName,
      customerCompanyName,
      customerVatNumber,
      courierId,
      trackingNumber,
      items,
      shippingAddress,
      notes,
      adminNotes,
      weight
    } = req.body;

    // Validate required fields
    if (!customerEmail || !customerPhone) {
      throw new AppError(400, 'Email и телефон са задължителни');
    }

    if (!items || items.length === 0) {
      throw new AppError(400, 'Поръчката трябва да съдържа поне един продукт');
    }

    // Calculate totals
    let subtotal = 0;
    for (const item of items) {
      const itemTotal = parseFloat(item.unitPrice) * parseInt(item.quantity);
      subtotal += itemTotal;
    }

    const shippingCost = parseFloat(req.body.shippingCost || '0');
    const total = subtotal + shippingCost;

    // Create order with temporary order number
    const [newOrder] = await db
      .insert(orders)
      .values({
        orderNumber: 'TEMP', // Temporary, will be updated to ID
        customerEmail,
        customerPhone,
        customerFirstName: customerFirstName || null,
        customerLastName: customerLastName || null,
        customerCompanyName: customerCompanyName || null,
        customerVatNumber: customerVatNumber || null,
        courierId: courierId || null,
        trackingNumber: trackingNumber || null,
        status: 'pending',
        subtotal: subtotal.toString(),
        shippingCost: shippingCost.toString(),
        total: total.toString(),
        currency: 'EUR',
        notes: notes || null,
        adminNotes: adminNotes || null,
        weight: weight || null,
      })
      .returning();

    // Update order number to be the same as ID
    // For simplicity, we'll use a counter based on created_at order
    const orderCountResult = await sql`
      SELECT COUNT(*) as count FROM orders WHERE created_at <= ${newOrder.createdAt}
    `;
    const orderNumber = orderCountResult[0]?.count?.toString() || '1';

    // Update the order with the sequential number
    await db
      .update(orders)
      .set({ orderNumber })
      .where(eq(orders.id, newOrder.id));

    // Update the newOrder object with the correct order number
    newOrder.orderNumber = orderNumber;

    // Create order items
    const orderItemsData = items.map((item: any) => ({
      orderId: newOrder.id,
      productId: item.productId,
      productName: item.productName,
      productSku: item.productSku,
      quantity: parseInt(item.quantity),
      unitPrice: item.unitPrice,
      total: (parseFloat(item.unitPrice) * parseInt(item.quantity)).toString(),
    }));

    await db.insert(orderItems).values(orderItemsData);

    // Create shipping address if provided
    if (shippingAddress) {
      await db.insert(shippingAddresses).values({
        orderId: newOrder.id,
        fullName: shippingAddress.fullName,
        phone: shippingAddress.phone,
        address: shippingAddress.address,
        city: shippingAddress.city,
        postalCode: shippingAddress.postalCode,
        country: shippingAddress.country || 'Bulgaria',
      });
    }

    logger.info(`Created new order ${newOrder.id}`);

    res.status(201).json({
      data: newOrder,
      message: 'Поръчката е създадена успешно'
    });
  } catch (error) {
    next(error);
  }
};

// Get all orders with optional filters and pagination
export const getOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      search,
      page = '1',
      limit = '20',
      status,
      courierId,
      dateFrom,
      dateTo
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    // Cast query parameters to strings
    const searchStr = search as string | undefined;
    const statusStr = status as string | undefined;
    const courierIdStr = courierId as string | undefined;
    const dateFromStr = dateFrom as string | undefined;
    const dateToStr = dateTo as string | undefined;

    // Use raw SQL query with postgres client to bypass Drizzle ORM issues
    const searchPattern = searchStr ? `%${searchStr}%` : null;

    const ordersList = await sql`
      SELECT
        o.*,
        c.name as courier_name
      FROM orders o
      LEFT JOIN couriers c ON o.courier_id = c.id
      WHERE 1=1
        ${searchStr ? sql`AND (
          o.order_number ILIKE ${searchPattern}
          OR o.customer_email ILIKE ${searchPattern}
          OR o.customer_phone ILIKE ${searchPattern}
          OR o.customer_first_name ILIKE ${searchPattern}
          OR o.customer_last_name ILIKE ${searchPattern}
        )` : sql``}
        ${statusStr ? sql`AND o.status = ${statusStr}` : sql``}
        ${courierIdStr ? sql`AND o.courier_id = ${courierIdStr}` : sql``}
        ${dateFromStr ? sql`AND o.created_at >= ${dateFromStr}` : sql``}
        ${dateToStr ? sql`AND o.created_at <= ${dateToStr}` : sql``}
      ORDER BY o.created_at DESC
      LIMIT ${limitNum}
      OFFSET ${offset}
    `;

    // Get total count using postgres client
    const countResult = await sql`
      SELECT COUNT(*) as count FROM orders o
      WHERE 1=1
        ${searchStr ? sql`AND (
          o.order_number ILIKE ${searchPattern}
          OR o.customer_email ILIKE ${searchPattern}
          OR o.customer_phone ILIKE ${searchPattern}
          OR o.customer_first_name ILIKE ${searchPattern}
          OR o.customer_last_name ILIKE ${searchPattern}
        )` : sql``}
        ${statusStr ? sql`AND o.status = ${statusStr}` : sql``}
        ${courierIdStr ? sql`AND o.courier_id = ${courierIdStr}` : sql``}
        ${dateFromStr ? sql`AND o.created_at >= ${dateFromStr}` : sql``}
        ${dateToStr ? sql`AND o.created_at <= ${dateToStr}` : sql``}
    `;
    const totalCount = Number(countResult[0]?.count || 0);

    // Fetch order items for each order to show products
    const ordersWithItems = await Promise.all(
      ordersList.map(async (order: any) => {
        const items = await db
          .select()
          .from(orderItems)
          .where(eq(orderItems.orderId, order.id as string));

        // Convert to camelCase
        return toCamelCase({
          ...order,
          items,
        });
      })
    );

    logger.info(`Fetched ${ordersList.length} orders`);

    res.json({
      data: ordersWithItems,
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

// Get single order by ID with full details
export const getOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Get order data using postgres client to avoid LEFT JOIN issues
    const orderData = await sql`
      SELECT * FROM orders WHERE id = ${id}
    `;

    if (!orderData || orderData.length === 0) {
      throw new AppError(404, 'Поръчката не е намерена');
    }

    const order = orderData[0];

    // Fetch order items
    const items = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, id as string));

    // Fetch shipping address
    const shippingAddressData = await db
      .select()
      .from(shippingAddresses)
      .where(eq(shippingAddresses.orderId, id as string))
      .limit(1);

    const shippingAddress = shippingAddressData[0] || null;

    logger.info(`Fetched order ${id}`);

    res.json({
      data: toCamelCase({
        ...order,
        items,
        shippingAddress,
      })
    });
  } catch (error) {
    next(error);
  }
};

// Update order status
export const updateOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      throw new AppError(400, 'Статусът е задължителен');
    }

    // Verify order exists
    const existingOrder = await db
      .select()
      .from(orders)
      .where(eq(orders.id, id as string))
      .limit(1);

    if (!existingOrder || existingOrder.length === 0) {
      throw new AppError(404, 'Поръчката не е намерена');
    }

    // Update order status
    const [updatedOrder] = await db
      .update(orders)
      .set({
        status,
        updatedAt: new Date()
      })
      .where(eq(orders.id, id as string))
      .returning();

    logger.info(`Updated order ${id} status to ${status}`);

    res.json({
      data: updatedOrder,
      message: 'Статусът на поръчката е актуализиран успешно'
    });
  } catch (error) {
    next(error);
  }
};

// Update order details
export const updateOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const {
      courierId,
      trackingNumber,
      status,
      notes,
      adminNotes,
      weight
    } = req.body;

    // Verify order exists
    const existingOrder = await db
      .select()
      .from(orders)
      .where(eq(orders.id, id as string))
      .limit(1);

    if (!existingOrder || existingOrder.length === 0) {
      throw new AppError(404, 'Поръчката не е намерена');
    }

    // Build update object
    const updateData: any = {
      updatedAt: new Date()
    };

    if (courierId !== undefined) updateData.courierId = courierId;
    if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber;
    if (status !== undefined) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;
    if (weight !== undefined) updateData.weight = weight;

    // Update order
    const [updatedOrder] = await db
      .update(orders)
      .set(updateData)
      .where(eq(orders.id, id as string))
      .returning();

    logger.info(`Updated order ${id}`);

    res.json({
      data: updatedOrder,
      message: 'Поръчката е актуализирана успешно'
    });
  } catch (error) {
    next(error);
  }
};

// Delete order
export const deleteOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Verify order exists
    const existingOrder = await db
      .select()
      .from(orders)
      .where(eq(orders.id, id as string))
      .limit(1);

    if (!existingOrder || existingOrder.length === 0) {
      throw new AppError(404, 'Поръчката не е намерена');
    }

    // Delete order (cascade will delete order items and shipping address)
    await db.delete(orders).where(eq(orders.id, id as string));

    logger.info(`Deleted order ${id}`);

    res.json({
      message: 'Поръчката е изтрита успешно'
    });
  } catch (error) {
    next(error);
  }
};
