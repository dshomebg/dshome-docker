import { apiClient } from "../api";

export type TemplateType = 'category' | 'search';
export type FilterType = 'price' | 'brand' | 'feature_group' | 'attribute_group';

export interface FilterTemplate {
  id: string;
  name: string;
  type: TemplateType;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FilterTemplateItem {
  id: string;
  templateId: string;
  filterType: FilterType;
  label: string;
  config: any; // JSON config specific to filter type
  position: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FilterTemplateWithItems extends FilterTemplate {
  items: FilterTemplateItem[];
}

export interface FilterTemplateFormData {
  name: string;
  type: TemplateType;
  description?: string | null;
}

export interface FilterTemplateItemFormData {
  filterType: FilterType;
  label: string;
  config?: any;
  position?: number;
  isActive?: boolean;
}

export const facetedNavigationService = {
  // Get all filter templates
  getFilterTemplates: async (): Promise<{ data: FilterTemplate[] }> => {
    const response = await apiClient.get('/faceted-navigation');
    return response.data;
  },

  // Get single filter template with items
  getFilterTemplate: async (id: string): Promise<{ data: FilterTemplateWithItems }> => {
    const response = await apiClient.get(`/faceted-navigation/${id}`);
    return response.data;
  },

  // Create filter template
  createFilterTemplate: async (data: FilterTemplateFormData): Promise<{ data: FilterTemplate }> => {
    const response = await apiClient.post('/faceted-navigation', data);
    return response.data;
  },

  // Update filter template
  updateFilterTemplate: async (id: string, data: FilterTemplateFormData): Promise<{ data: FilterTemplate }> => {
    const response = await apiClient.put(`/faceted-navigation/${id}`, data);
    return response.data;
  },

  // Delete filter template
  deleteFilterTemplate: async (id: string): Promise<void> => {
    await apiClient.delete(`/faceted-navigation/${id}`);
  },

  // Get all items for a template
  getFilterTemplateItems: async (templateId: string): Promise<{ data: FilterTemplateItem[] }> => {
    const response = await apiClient.get(`/faceted-navigation/${templateId}/items`);
    return response.data;
  },

  // Create filter template item
  createFilterTemplateItem: async (templateId: string, data: FilterTemplateItemFormData): Promise<{ data: FilterTemplateItem }> => {
    const response = await apiClient.post(`/faceted-navigation/${templateId}/items`, data);
    return response.data;
  },

  // Update filter template item
  updateFilterTemplateItem: async (id: string, data: FilterTemplateItemFormData): Promise<{ data: FilterTemplateItem }> => {
    const response = await apiClient.put(`/faceted-navigation/items/${id}`, data);
    return response.data;
  },

  // Delete filter template item
  deleteFilterTemplateItem: async (id: string): Promise<void> => {
    await apiClient.delete(`/faceted-navigation/items/${id}`);
  },

  // Reorder filter template items
  reorderFilterTemplateItems: async (templateId: string, itemIds: string[]): Promise<{ message: string }> => {
    const response = await apiClient.put(`/faceted-navigation/${templateId}/items/reorder`, { itemIds });
    return response.data;
  },
};
