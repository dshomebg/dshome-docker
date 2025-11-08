import { apiClient } from "../api";

export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  shortDescription?: string;
  description?: string;
  productType: 'simple' | 'combination';

  // Associations
  brandId?: string;
  supplierId?: string;

  // Physical attributes
  weight?: number;
  width?: number;
  height?: number;
  depth?: number;

  // SEO
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonicalUrl?: string;
  robotsIndex: boolean;
  robotsFollow: boolean;

  status: 'active' | 'inactive' | 'archived';
  createdAt: string;
  updatedAt: string;

  // Extended fields from API
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
  firstImage?: {
    id: string;
    url: string;
    thumbnailUrl: string;
  };
  currentPrice?: {
    price: number;
    compareAtPrice?: number;
    currency: string;
  };
  totalInventory: number;
}

export interface ProductCategory {
  categoryId: string;
  isPrimary: boolean;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface ProductsResponse {
  data: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ProductFormData {
  sku: string;
  name: string;
  slug: string;
  shortDescription?: string;
  description?: string;
  productType: 'simple' | 'combination';

  // Associations
  brandId?: string;
  supplierId?: string;
  categories: { categoryId: string; isPrimary: boolean }[];

  // Images
  images?: { url: string; position: number; isPrimary: boolean }[];

  // Features
  features?: { featureValueId: string }[];

  // Combinations (for combination products)
  combinations?: {
    sku: string;
    name?: string;
    priceImpact: string;
    weightImpact: string;
    quantity: string;
    isDefault: boolean;
    attributeValueIds: string[];
  }[];

  // Inventory (simple quantity for basic tab)
  quantity?: number;
  warehouseId?: string;

  // Physical attributes
  weight?: number;
  width?: number;
  height?: number;
  depth?: number;

  // Pricing
  price: number;
  compareAtPrice?: number;

  // SEO
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonicalUrl?: string;
  robotsIndex?: boolean;
  robotsFollow?: boolean;

  status: 'active' | 'inactive' | 'archived';
}

export const productsService = {
  // Get all products with optional filters
  getProducts: async (params?: {
    search?: string;
    page?: number;
    limit?: number;
    status?: 'active' | 'inactive' | 'draft' | 'archived';
    brandId?: string;
    supplierId?: string;
    categoryId?: string;
    productType?: 'simple' | 'combination';
  }): Promise<ProductsResponse> => {
    const response = await apiClient.get('/products', { params });
    return response.data;
  },

  // Get single product by ID
  getProduct: async (id: string): Promise<{ data: any }> => {
    const response = await apiClient.get(`/products/${id}`);
    return response.data;
  },

  // Create new product
  createProduct: async (data: ProductFormData): Promise<{ data: Product }> => {
    const response = await apiClient.post('/products', data);
    return response.data;
  },

  // Update product
  updateProduct: async (id: string, data: Partial<ProductFormData>): Promise<{ data: Product }> => {
    const response = await apiClient.put(`/products/${id}`, data);
    return response.data;
  },

  // Delete product
  deleteProduct: async (id: string): Promise<void> => {
    await apiClient.delete(`/products/${id}`);
  },
};
