import { z } from 'zod';
import { ProductStatus, ProductType } from '../types';

export const createProductSchema = z.object({
  sku: z.string().min(1).max(100),
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(255).regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  shortDescription: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  productType: z.nativeEnum(ProductType).default(ProductType.SIMPLE),

  // Associations
  brandId: z.string().uuid().nullable().optional(),
  supplierId: z.string().uuid().nullable().optional(),

  // Categories (array of category IDs with one marked as primary)
  categories: z.array(z.object({
    categoryId: z.string().uuid(),
    isPrimary: z.boolean()
  })).min(1, 'At least one category is required'),

  // Physical attributes
  weight: z.number().min(0).nullable().optional(),
  width: z.number().min(0).nullable().optional(),
  height: z.number().min(0).nullable().optional(),
  depth: z.number().min(0).nullable().optional(),

  // Pricing
  price: z.number().min(0),
  compareAtPrice: z.number().min(0).nullable().optional(),

  // SEO fields
  metaTitle: z.string().max(255).nullable().optional(),
  metaDescription: z.string().nullable().optional(),
  metaKeywords: z.string().nullable().optional(),
  ogTitle: z.string().max(255).nullable().optional(),
  ogDescription: z.string().nullable().optional(),
  ogImage: z.string().max(500).nullable().optional(),
  canonicalUrl: z.string().max(500).nullable().optional(),
  robotsIndex: z.boolean().default(true),
  robotsFollow: z.boolean().default(true),

  status: z.nativeEnum(ProductStatus).default(ProductStatus.DRAFT)
});

export const updateProductSchema = createProductSchema.partial();

export const productImageSchema = z.object({
  url: z.string().url(),
  position: z.number().int().min(0),
  altText: z.string().nullable().optional(),
  productId: z.string().uuid().nullable().optional(),
  combinationId: z.string().uuid().nullable().optional()
});

export const productCombinationSchema = z.object({
  sku: z.string().min(1).max(100),
  name: z.string().max(255).nullable().optional(),
  price: z.number().min(0).nullable().optional(),
  compareAtPrice: z.number().min(0).nullable().optional(),
  position: z.number().int().min(0).default(0),
  isDefault: z.boolean().default(false),
  attributeValues: z.array(z.string().uuid()).min(1, 'At least one attribute value is required')
});

export const productFeatureSchema = z.object({
  featureValueId: z.string().uuid()
});

export const productInventorySchema = z.object({
  warehouseId: z.string().uuid(),
  quantity: z.number().int().min(0),
  reservedQuantity: z.number().int().min(0).default(0),
  productId: z.string().uuid().nullable().optional(),
  combinationId: z.string().uuid().nullable().optional()
});
