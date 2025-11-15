import { apiClient } from '../api';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  parentId: string | null;
  position: number;
  status: 'active' | 'inactive';
  style: 'navigation' | 'product';
  h1: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  canonicalUrl: string | null;
  skipMetaGeneration: boolean;
  createdAt: string;
  updatedAt: string;
  productCount?: number;
  children?: Category[];
}

export interface CategoriesResponse {
  data: Category[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CategoryResponse {
  data: Category;
}

export interface CategoryTreeResponse {
  data: Category[];
}

export const categoriesService = {
  getCategories: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: 'active' | 'inactive';
    tree?: boolean;
  }): Promise<CategoriesResponse> => {
    const response = await apiClient.get<CategoriesResponse>('/categories', { params });
    return response.data;
  },

  getCategoryTree: async (params?: {
    status?: 'active' | 'inactive';
  }): Promise<CategoryTreeResponse> => {
    const response = await apiClient.get<CategoryTreeResponse>('/categories/tree', { params });
    return response.data;
  },

  getCategory: async (id: string): Promise<CategoryResponse> => {
    const response = await apiClient.get<CategoryResponse>(`/categories/${id}`);
    return response.data;
  },

  createCategory: async (data: {
    name: string;
    slug: string;
    description?: string;
    image?: string;
    parentId?: string;
    status?: 'active' | 'inactive';
    style?: 'navigation' | 'product';
    h1?: string;
    metaTitle?: string;
    metaDescription?: string;
    canonicalUrl?: string;
    skipMetaGeneration?: boolean;
  }): Promise<CategoryResponse> => {
    const response = await apiClient.post<CategoryResponse>('/categories', data);
    return response.data;
  },

  updateCategory: async (
    id: string,
    data: {
      name?: string;
      slug?: string;
      description?: string;
      image?: string;
      parentId?: string;
      status?: 'active' | 'inactive';
      style?: 'navigation' | 'product';
      h1?: string;
      metaTitle?: string;
      metaDescription?: string;
      canonicalUrl?: string;
      skipMetaGeneration?: boolean;
    }
  ): Promise<CategoryResponse> => {
    const response = await apiClient.put<CategoryResponse>(`/categories/${id}`, data);
    return response.data;
  },

  deleteCategory: async (id: string): Promise<void> => {
    await apiClient.delete(`/categories/${id}`);
  },

  // Feature Weights
  getCategoryFeatureWeights: async (categoryId: string): Promise<{
    success: boolean;
    data: {
      categoryId: string;
      categoryName: string;
      weights: Array<{
        id: string;
        type: 'price' | 'feature_group';
        featureGroupId?: string;
        featureGroupName?: string;
        weight: number;
        position: number;
      }>;
      totalWeight: number;
    };
  }> => {
    const response = await apiClient.get(`/categories/${categoryId}/feature-weights`);
    return response.data;
  },

  updateCategoryFeatureWeights: async (
    categoryId: string,
    weights: Array<{
      type: 'price' | 'feature_group';
      featureGroupId?: string;
      weight: number;
    }>
  ): Promise<{
    success: boolean;
    message: string;
    data: {
      categoryId: string;
      totalWeight: number;
      weightsCount: number;
    };
  }> => {
    const response = await apiClient.put(`/categories/${categoryId}/feature-weights`, { weights });
    return response.data;
  },

  getAllowedFeatureGroups: async (categoryId: string): Promise<{
    success: boolean;
    data: {
      categoryId: string;
      categoryName: string;
      allowedGroups: Array<{
        id: string;
        name: string;
        weight: number;
        features: Array<{
          id: string;
          name: string;
          position: number;
        }>;
      }>;
      hasConfiguration: boolean;
    };
  }> => {
    const response = await apiClient.get(`/categories/${categoryId}/allowed-feature-groups`);
    return response.data;
  },
};
