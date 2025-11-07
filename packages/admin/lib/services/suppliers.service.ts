import { apiClient } from "../api";

export interface Supplier {
  id: string;
  name: string;
  slug: string;
  email?: string;
  phone?: string;
  address?: string;
  vat?: string;
  contactPerson?: string;
  description?: string;
  status: 'active' | 'inactive';
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SuppliersResponse {
  data: Supplier[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SupplierFormData {
  name: string;
  slug: string;
  email?: string;
  phone?: string;
  address?: string;
  vat?: string;
  contactPerson?: string;
  description?: string;
  status: 'active' | 'inactive';
  isDefault?: boolean;
}

export const suppliersService = {
  // Get all suppliers with optional filters
  getSuppliers: async (params?: {
    search?: string;
    page?: number;
    limit?: number;
    status?: 'active' | 'inactive';
  }): Promise<SuppliersResponse> => {
    const response = await apiClient.get('/suppliers', { params });
    return response.data;
  },

  // Get single supplier by ID
  getSupplier: async (id: string): Promise<{ data: Supplier }> => {
    const response = await apiClient.get(`/suppliers/${id}`);
    return response.data;
  },

  // Create new supplier
  createSupplier: async (data: SupplierFormData): Promise<{ data: Supplier }> => {
    const response = await apiClient.post('/suppliers', data);
    return response.data;
  },

  // Update supplier
  updateSupplier: async (id: string, data: SupplierFormData): Promise<{ data: Supplier }> => {
    const response = await apiClient.put(`/suppliers/${id}`, data);
    return response.data;
  },

  // Delete supplier
  deleteSupplier: async (id: string): Promise<void> => {
    await apiClient.delete(`/suppliers/${id}`);
  },

  // Get default supplier
  getDefaultSupplier: async (): Promise<{ data: Supplier | null }> => {
    const response = await apiClient.get('/suppliers/default');
    return response.data;
  },
};
