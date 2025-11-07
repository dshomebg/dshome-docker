import { z } from 'zod';
import { ProductStatus } from '../types';

export const createProductSchema = z.object({
  sku: z.string().min(1).max(100),
  name: z.string().min(1).max(255),
  description: z.string().nullable().optional(),
  categoryId: z.string().uuid(),
  status: z.nativeEnum(ProductStatus).default(ProductStatus.DRAFT)
});

export const updateProductSchema = createProductSchema.partial();

export const productImageSchema = z.object({
  url: z.string().url(),
  position: z.number().int().min(0),
  altText: z.string().nullable().optional()
});
