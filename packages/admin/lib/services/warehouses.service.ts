import { apiClient } from "../api";

export interface Warehouse {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  workingHours?: string;
  url?: string;
  latitude?: string;
  longitude?: string;
  isPhysicalStore: boolean;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface WarehousesResponse {
  data: Warehouse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface WarehouseFormData {
  name: string;
  address?: string;
  phone?: string;
  workingHours?: string;
  url?: string;
  latitude?: string;
  longitude?: string;
  isPhysicalStore?: boolean;
  status: 'active' | 'inactive';
}

export const warehousesService = {
  // Get all warehouses with optional filters
  getWarehouses: async (params?: {
    search?: string;
    page?: number;
    limit?: number;
    status?: 'active' | 'inactive';
  }): Promise<WarehousesResponse> => {
    const response = await apiClient.get('/warehouses', { params });
    return response.data;
  },

  // Get single warehouse by ID
  getWarehouse: async (id: string): Promise<{ data: Warehouse }> => {
    const response = await apiClient.get(`/warehouses/${id}`);
    return response.data;
  },

  // Create new warehouse
  createWarehouse: async (data: WarehouseFormData): Promise<{ data: Warehouse }> => {
    const response = await apiClient.post('/warehouses', data);
    return response.data;
  },

  // Update warehouse
  updateWarehouse: async (id: string, data: WarehouseFormData): Promise<{ data: Warehouse }> => {
    const response = await apiClient.put(`/warehouses/${id}`, data);
    return response.data;
  },

  // Delete warehouse
  deleteWarehouse: async (id: string): Promise<void> => {
    await apiClient.delete(`/warehouses/${id}`);
  },
};
