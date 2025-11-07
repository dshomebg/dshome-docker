import { z } from 'zod';
import { OrderStatus } from '../types';

export const createOrderSchema = z.object({
  customerEmail: z.string().email(),
  customerPhone: z.string().min(1),
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().min(1)
  })).min(1),
  shippingAddress: z.object({
    fullName: z.string().min(1),
    phone: z.string().min(1),
    address: z.string().min(1),
    city: z.string().min(1),
    postalCode: z.string().min(1),
    country: z.string().default('Bulgaria')
  }),
  notes: z.string().nullable().optional()
});

export const updateOrderStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
  courierTrackingUrl: z.string().url().nullable().optional()
});
