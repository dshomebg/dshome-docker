import { apiClient } from '../api';

export interface SeoSettings {
  id: string;
  productUrlFormat: string;
  productUrlSuffix: string;
  categoryUrlFormat: string;
  categoryUrlSuffix: string;
  brandUrlFormat: string;
  brandUrlSuffix: string;
  cmsUrlFormat: string;
  cmsUrlSuffix: string;
  cmsCategoryUrlFormat: string;
  cmsCategoryUrlSuffix: string;
  blogUrlFormat: string;
  blogUrlSuffix: string;
  blogCategoryUrlFormat: string;
  blogCategoryUrlSuffix: string;
  canonicalEnabled: boolean;
  productMetaTitleTemplate: string;
  productMetaDescriptionTemplate: string;
  categoryMetaTitleTemplate: string;
  categoryMetaDescriptionTemplate: string;
  createdAt: string;
  updatedAt: string;
}

export interface SeoSettingsResponse {
  data: SeoSettings;
}

export interface GenerateMetaResponse {
  success: boolean;
  data: {
    generated: number;
    skipped: number;
    total: number;
  };
}

export const seoSettingsService = {
  getSeoSettings: async (): Promise<SeoSettingsResponse> => {
    const response = await apiClient.get<SeoSettingsResponse>('/seo-settings');
    return response.data;
  },

  updateSeoSettings: async (data: Partial<SeoSettings>): Promise<SeoSettingsResponse> => {
    const response = await apiClient.put<SeoSettingsResponse>('/seo-settings', data);
    return response.data;
  },

  generateProductMeta: async (): Promise<GenerateMetaResponse> => {
    const response = await apiClient.post<GenerateMetaResponse>('/seo-settings/generate-product-meta');
    return response.data;
  },

  generateCategoryMeta: async (): Promise<GenerateMetaResponse> => {
    const response = await apiClient.post<GenerateMetaResponse>('/seo-settings/generate-category-meta');
    return response.data;
  }
};
