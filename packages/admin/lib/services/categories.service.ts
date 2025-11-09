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
    }
  ): Promise<CategoryResponse> => {
    const response = await apiClient.put<CategoryResponse>(`/categories/${id}`, data);
    return response.data;
  },

  deleteCategory: async (id: string): Promise<void> => {
    await apiClient.delete(`/categories/${id}`);
  },
};
