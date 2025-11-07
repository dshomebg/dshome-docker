import { apiClient } from "../api";

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  description?: string;
  status: 'active' | 'inactive';
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BrandsResponse {
  data: Brand[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface BrandFormData {
  name: string;
  slug: string;
  logo?: string;
  description?: string;
  status: 'active' | 'inactive';
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
}

export const brandsService = {
  // Get all brands with optional filters
  getBrands: async (params?: {
    search?: string;
    page?: number;
    limit?: number;
    status?: 'active' | 'inactive';
  }): Promise<BrandsResponse> => {
    const response = await apiClient.get('/brands', { params });
    return response.data;
  },

  // Get single brand by ID
  getBrand: async (id: string): Promise<{ data: Brand }> => {
    const response = await apiClient.get(`/brands/${id}`);
    return response.data;
  },

  // Create new brand
  createBrand: async (data: BrandFormData): Promise<{ data: Brand }> => {
    const response = await apiClient.post('/brands', data);
    return response.data;
  },

  // Update brand
  updateBrand: async (id: string, data: BrandFormData): Promise<{ data: Brand }> => {
    const response = await apiClient.put(`/brands/${id}`, data);
    return response.data;
  },

  // Delete brand
  deleteBrand: async (id: string): Promise<void> => {
    await apiClient.delete(`/brands/${id}`);
  },
};
