import { apiClient } from '../api';

export interface SimilarProductsSettings {
  id: string;

  // Global
  moduleEnabled: boolean;
  defaultLimit: number;
  cacheDuration: number;
  excludeOutOfStock: boolean;

  // Same Category
  sameCategoryEnabled: boolean;
  sameCategoryLimit: number;
  sameCategoryTitle: string;
  sameCategorySort: string;
  sameCategoryMatchType: string;
  sameCategoryShowImage: boolean;
  sameCategoryShowPrice: boolean;
  sameCategoryShowAddToCart: boolean;

  // Similar Features
  similarFeaturesEnabled: boolean;
  similarFeaturesLimit: number;
  similarFeaturesTitle: string;
  similarFeaturesMinSimilarity: number;
  similarFeaturesShowScore: boolean;
  similarFeaturesFallback: string;
  similarFeaturesCombineWithSameCategory: boolean;
  similarFeaturesShowImage: boolean;
  similarFeaturesShowPrice: boolean;
  similarFeaturesShowAddToCart: boolean;

  // Related Products
  relatedEnabled: boolean;
  relatedLimit: number;
  relatedTitle: string;
  relatedBidirectional: boolean;
  relatedPriority: string;
  relatedShowImage: boolean;
  relatedShowPrice: boolean;
  relatedShowAddToCart: boolean;

  // Display
  layoutType: string;
  gridColumns: number;
  cardStyle: string;
  showSectionDividers: boolean;
  animation: string;
  mobileLayout: string;

  // Advanced
  excludedCategoryIds: string[];
  excludedProductIds: string[];
  maxCandidates: number;
  enableQueryCaching: boolean;
  moduleOrder: string[];

  createdAt: string;
  updatedAt: string;
}

export const similarProductsSettingsService = {
  getSettings: async (): Promise<{
    success: boolean;
    data: SimilarProductsSettings;
  }> => {
    const response = await apiClient.get('/similar-products-settings');
    return response.data;
  },

  updateSettings: async (
    settings: Partial<SimilarProductsSettings>
  ): Promise<{
    success: boolean;
    message: string;
    data: SimilarProductsSettings;
  }> => {
    const response = await apiClient.put('/similar-products-settings', settings);
    return response.data;
  },

  resetSettings: async (): Promise<{
    success: boolean;
    message: string;
    data: SimilarProductsSettings;
  }> => {
    const response = await apiClient.post('/similar-products-settings/reset');
    return response.data;
  }
};
