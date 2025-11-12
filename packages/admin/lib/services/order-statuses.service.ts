import { apiClient } from "../api";

export interface OrderStatus {
  id: string;
  name: string;
  color: string;
  visibleToCustomer: boolean;
  sendEmail: boolean;
  emailTemplateId: string | null;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrderStatusFormData {
  name: string;
  color: string;
  visibleToCustomer: boolean;
  sendEmail: boolean;
  emailTemplateId?: string | null;
  position?: number;
}

export const orderStatusesService = {
  // Get all order statuses
  getOrderStatuses: async (): Promise<{ data: OrderStatus[] }> => {
    const response = await apiClient.get('/order-statuses');
    return response.data;
  },

  // Get single order status by ID
  getOrderStatus: async (id: string): Promise<{ data: OrderStatus }> => {
    const response = await apiClient.get(`/order-statuses/${id}`);
    return response.data;
  },

  // Create new order status
  createOrderStatus: async (data: OrderStatusFormData): Promise<{ data: OrderStatus }> => {
    const response = await apiClient.post('/order-statuses', data);
    return response.data;
  },

  // Update order status
  updateOrderStatus: async (id: string, data: OrderStatusFormData): Promise<{ data: OrderStatus }> => {
    const response = await apiClient.put(`/order-statuses/${id}`, data);
    return response.data;
  },

  // Delete order status
  deleteOrderStatus: async (id: string): Promise<void> => {
    await apiClient.delete(`/order-statuses/${id}`);
  },
};
