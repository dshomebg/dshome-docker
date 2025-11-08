// Product related types

export enum ProductStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DRAFT = 'draft',
  ARCHIVED = 'archived'
}

export enum ProductType {
  SIMPLE = 'simple',
  COMBINATION = 'combination'
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  productType: ProductType;

  // Associations
  brandId: string | null;
  supplierId: string | null;

  // Physical attributes
  weight: number | null; // in kg
  width: number | null; // in cm
  height: number | null; // in cm
  depth: number | null; // in cm

  // SEO fields
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  canonicalUrl: string | null;
  robotsIndex: boolean;
  robotsFollow: boolean;

  status: ProductStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductCombination {
  id: string;
  productId: string;
  sku: string;
  name: string | null;
  price: number | null;
  compareAtPrice: number | null;
  position: number;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductCombinationAttribute {
  id: string;
  combinationId: string;
  attributeValueId: string;
  createdAt: Date;
}

export interface ProductCategory {
  id: string;
  productId: string;
  categoryId: string;
  isPrimary: boolean;
  createdAt: Date;
}

export interface ProductFeature {
  id: string;
  productId: string;
  featureValueId: string;
  createdAt: Date;
}

export interface ProductImage {
  id: string;
  productId: string | null;
  combinationId: string | null;
  url: string;
  thumbnailUrl: string;
  position: number;
  altText: string | null;
  createdAt: Date;
}

export interface ProductPrice {
  id: string;
  productId: string;
  price: number;
  compareAtPrice: number | null;
  currency: string;
  validFrom: Date;
  validTo: Date | null;
  createdAt: Date;
}

export interface ProductInventory {
  id: string;
  productId: string | null;
  combinationId: string | null;
  warehouseId: string;
  quantity: number;
  reservedQuantity: number;
  updatedAt: Date;
}

// Extended types with joined data
export interface ProductWithDetails extends Product {
  images: ProductImage[];
  currentPrice: ProductPrice | null;
  categories: ProductCategory[];
  combinations: ProductCombination[];
  features: ProductFeature[];
  totalInventory: number;
  brand?: {
    id: string;
    name: string;
    slug: string;
  };
  supplier?: {
    id: string;
    name: string;
  };
  primaryCategory?: {
    id: string;
    name: string;
    slug: string;
  };
}
