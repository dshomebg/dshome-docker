import { apiClient } from "../api";

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode?: string;
  country: string;
  companyName?: string;
  vatNumber?: string;
  isRegistered: boolean;
  isActive: boolean;
  notes?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomersResponse {
  data: Customer[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CustomerFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode?: string;
  country: string;
  companyName?: string;
  vatNumber?: string;
  isRegistered?: boolean;
  password?: string;
  notes?: string;
}

export interface CustomerStats {
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  lastOrderDate: string | null;
}

export const customersService = {
  // Get all customers with optional filters
  getCustomers: async (params?: {
    search?: string;
    page?: number;
    limit?: number;
    isRegistered?: boolean;
    isActive?: boolean;
  }): Promise<CustomersResponse> => {
    const response = await apiClient.get('/customers', { params });
    return response.data;
  },

  // Get single customer by ID
  getCustomer: async (id: string): Promise<{ data: Customer }> => {
    const response = await apiClient.get(`/customers/${id}`);
    return response.data;
  },

  // Create new customer
  createCustomer: async (data: CustomerFormData): Promise<{ data: Customer }> => {
    const response = await apiClient.post('/customers', data);
    return response.data;
  },

  // Update customer
  updateCustomer: async (id: string, data: CustomerFormData): Promise<{ data: Customer }> => {
    const response = await apiClient.put(`/customers/${id}`, data);
    return response.data;
  },

  // Delete customer
  deleteCustomer: async (id: string): Promise<void> => {
    await apiClient.delete(`/customers/${id}`);
  },

  // Get customer statistics
  getCustomerStats: async (id: string): Promise<{ data: CustomerStats }> => {
    const response = await apiClient.get(`/customers/${id}/stats`);
    return response.data;
  },

  // Change customer password
  changePassword: async (id: string, password: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.patch(`/customers/${id}/password`, { password });
    return response.data;
  },
};
