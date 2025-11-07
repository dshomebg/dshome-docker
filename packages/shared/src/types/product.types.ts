// Product related types

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  categoryId: string;
  status: ProductStatus;
  createdAt: Date;
  updatedAt: Date;
}

export enum ProductStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DRAFT = 'draft',
  ARCHIVED = 'archived'
}

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  thumbnailUrl: string;
  position: number;
  altText: string | null;
}

export interface ProductPrice {
  id: string;
  productId: string;
  price: number;
  compareAtPrice: number | null;
  currency: string;
  validFrom: Date;
  validTo: Date | null;
}

export interface ProductInventory {
  id: string;
  productId: string;
  warehouseId: string;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  updatedAt: Date;
}

export interface ProductWithDetails extends Product {
  images: ProductImage[];
  currentPrice: ProductPrice | null;
  totalInventory: number;
}
