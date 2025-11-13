import { apiClient } from "../api";

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  unitPrice: string;
  total: string;
  referenceNumber?: string;
  productImage?: string;
}

export interface ShippingAddress {
  id: string;
  orderId: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId?: string;
  customerEmail: string;
  customerPhone: string;
  customerFirstName?: string;
  customerLastName?: string;
  customerCompanyName?: string;
  customerVatNumber?: string;
  courierId?: string;
  courierName?: string;
  courierTrackingUrl?: string;
  trackingNumber?: string;
  status: string;
  subtotal: string;
  shippingCost: string;
  total: string;
  currency: string;
  notes?: string;
  adminNotes?: string;
  weight?: string;
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
  shippingAddress?: ShippingAddress;
}

export interface OrdersResponse {
  data: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UpdateOrderData {
  courierId?: string;
  trackingNumber?: string;
  status?: string;
  notes?: string;
  adminNotes?: string;
  weight?: string;
}

export interface CreateOrderData {
  customerEmail: string;
  customerPhone: string;
  customerFirstName?: string;
  customerLastName?: string;
  customerCompanyName?: string;
  customerVatNumber?: string;
  courierId?: string;
  trackingNumber?: string;
  shippingCost?: string;
  notes?: string;
  adminNotes?: string;
  weight?: string;
  items: {
    productId: string;
    productName: string;
    productSku: string;
    quantity: number;
    unitPrice: string;
  }[];
  shippingAddress?: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
    country?: string;
  };
}

export const ordersService = {
  // Get all orders with optional filters
  getOrders: async (params?: {
    search?: string;
    page?: number;
    limit?: number;
    status?: string;
    courierId?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<OrdersResponse> => {
    const response = await apiClient.get('/orders', { params });
    return response.data;
  },

  // Create new order
  createOrder: async (data: CreateOrderData): Promise<{ data: Order; message: string }> => {
    const response = await apiClient.post('/orders', data);
    return response.data;
  },

  // Get single order by ID
  getOrder: async (id: string): Promise<{ data: Order }> => {
    const response = await apiClient.get(`/orders/${id}`);
    return response.data;
  },

  // Update order details
  updateOrder: async (id: string, data: UpdateOrderData): Promise<{ data: Order; message: string }> => {
    const response = await apiClient.put(`/orders/${id}`, data);
    return response.data;
  },

  // Update order status
  updateOrderStatus: async (id: string, status: string): Promise<{ data: Order; message: string }> => {
    const response = await apiClient.patch(`/orders/${id}/status`, { status });
    return response.data;
  },

  // Delete order
  deleteOrder: async (id: string): Promise<void> => {
    await apiClient.delete(`/orders/${id}`);
  },
};
