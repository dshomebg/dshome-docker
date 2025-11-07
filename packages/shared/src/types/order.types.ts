// Order related types

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string | null;
  customerEmail: string;
  customerPhone: string;
  status: OrderStatus;
  subtotal: number;
  shippingCost: number;
  total: number;
  currency: string;
  notes: string | null;
  courierTrackingUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  unitPrice: number;
  total: number;
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
}

export interface OrderWithDetails extends Order {
  items: OrderItem[];
  shippingAddress: ShippingAddress;
}
