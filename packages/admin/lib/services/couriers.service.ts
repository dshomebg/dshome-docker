import { apiClient } from "../api";

export type DeliveryType = 'address' | 'office';

export interface CourierPricingRange {
  id?: string;
  deliveryType: DeliveryType;
  weightFrom: string;
  weightTo: string;
  price: string;
}

export interface Courier {
  id: string;
  name: string;
  isActive: boolean;
  trackingUrl?: string;
  logoUrl?: string;
  offersOfficeDelivery: boolean;
  palletDeliveryEnabled: boolean;
  palletWeightThreshold?: string;
  palletMaxWeight?: string;
  palletPrice?: string;
  pricingRanges?: CourierPricingRange[];
  createdAt: string;
  updatedAt: string;
}

export interface CourierFormData {
  name: string;
  isActive?: boolean;
  trackingUrl?: string;
  logoUrl?: string;
  offersOfficeDelivery?: boolean;
  palletDeliveryEnabled?: boolean;
  palletWeightThreshold?: string;
  palletMaxWeight?: string;
  palletPrice?: string;
  pricingRanges?: CourierPricingRange[];
}

export interface DeliveryPriceCalculation {
  price: number;
  deliveryMethod: 'standard' | 'pallet';
  palletCount?: number;
}

export const couriersService = {
  // Get all couriers
  getCouriers: async (params?: {
    search?: string;
    isActive?: boolean;
  }): Promise<{ data: Courier[] }> => {
    const response = await apiClient.get('/couriers', { params });
    return response.data;
  },

  // Get single courier by ID
  getCourier: async (id: string): Promise<{ data: Courier }> => {
    const response = await apiClient.get(`/couriers/${id}`);
    return response.data;
  },

  // Create new courier
  createCourier: async (data: CourierFormData): Promise<{ data: Courier }> => {
    const response = await apiClient.post('/couriers', data);
    return response.data;
  },

  // Update courier
  updateCourier: async (id: string, data: CourierFormData): Promise<{ data: Courier }> => {
    const response = await apiClient.put(`/couriers/${id}`, data);
    return response.data;
  },

  // Delete courier
  deleteCourier: async (id: string): Promise<void> => {
    await apiClient.delete(`/couriers/${id}`);
  },

  // Calculate delivery price
  calculateDeliveryPrice: async (
    courierId: string,
    weight: number,
    deliveryType: DeliveryType
  ): Promise<{ data: DeliveryPriceCalculation }> => {
    const response = await apiClient.post('/couriers/calculate-price', {
      courierId,
      weight,
      deliveryType,
    });
    return response.data;
  },
};
