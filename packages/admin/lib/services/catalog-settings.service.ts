import { apiClient } from "../api";

export interface CatalogSettings {
  id: string;
  vatPercentage: string;
  productsPerPage: number;
  newProductPeriodDays: number;
  defaultSorting: 'name_asc' | 'name_desc' | 'price_asc' | 'price_desc' | 'created_desc' | 'created_asc';
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryTimeTemplate {
  id: string;
  name: string;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface CatalogSettingsFormData {
  vatPercentage: string;
  productsPerPage: number;
  newProductPeriodDays: number;
  defaultSorting: 'name_asc' | 'name_desc' | 'price_asc' | 'price_desc' | 'created_desc' | 'created_asc';
}

export interface DeliveryTimeTemplateFormData {
  name: string;
  position?: number;
}

export const catalogSettingsService = {
  // Get catalog settings
  getCatalogSettings: async (): Promise<{ data: CatalogSettings }> => {
    const response = await apiClient.get('/catalog-settings');
    return response.data;
  },

  // Update catalog settings
  updateCatalogSettings: async (data: CatalogSettingsFormData): Promise<{ data: CatalogSettings }> => {
    const response = await apiClient.put('/catalog-settings', data);
    return response.data;
  },

  // Get all delivery time templates
  getDeliveryTimeTemplates: async (): Promise<{ data: DeliveryTimeTemplate[] }> => {
    const response = await apiClient.get('/catalog-settings/delivery-time-templates');
    return response.data;
  },

  // Create delivery time template
  createDeliveryTimeTemplate: async (data: DeliveryTimeTemplateFormData): Promise<{ data: DeliveryTimeTemplate }> => {
    const response = await apiClient.post('/catalog-settings/delivery-time-templates', data);
    return response.data;
  },

  // Update delivery time template
  updateDeliveryTimeTemplate: async (id: string, data: DeliveryTimeTemplateFormData): Promise<{ data: DeliveryTimeTemplate }> => {
    const response = await apiClient.put(`/catalog-settings/delivery-time-templates/${id}`, data);
    return response.data;
  },

  // Delete delivery time template
  deleteDeliveryTimeTemplate: async (id: string): Promise<void> => {
    await apiClient.delete(`/catalog-settings/delivery-time-templates/${id}`);
  },

  // Reorder delivery time templates
  reorderDeliveryTimeTemplates: async (templateIds: string[]): Promise<{ message: string }> => {
    const response = await apiClient.put('/catalog-settings/delivery-time-templates/reorder', { templateIds });
    return response.data;
  },
};
