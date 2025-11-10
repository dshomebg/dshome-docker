import { apiClient } from "../api";

export type EntityType = 'product' | 'category' | 'brand' | 'blog';
export type FitMode = 'inside' | 'cover' | 'fill' | 'contain';
export type ImageFormat = 'webp' | 'jpeg' | 'png';

export interface ImageSizeTemplate {
  id: string;
  name: string;
  displayName: string;
  entityType: EntityType;
  width: number;
  height: number;
  fitMode: FitMode;
  quality: number;
  format: ImageFormat;
  isActive: boolean;
  sortOrder: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ImageSizesResponse {
  data: ImageSizeTemplate[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ImageSizeFormData {
  name: string;
  displayName: string;
  entityType: EntityType;
  width: number;
  height: number;
  fitMode?: FitMode;
  quality?: number;
  format?: ImageFormat;
  isActive?: boolean;
  sortOrder?: number;
  description?: string;
}

export const imageSizesService = {
  // Get all image size templates
  getImageSizes: async (params?: {
    search?: string;
    entityType?: EntityType;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }): Promise<ImageSizesResponse> => {
    const response = await apiClient.get('/design/image-sizes', { params });
    return response.data;
  },

  // Get single image size template by ID
  getImageSize: async (id: string): Promise<{ data: ImageSizeTemplate }> => {
    const response = await apiClient.get(`/design/image-sizes/${id}`);
    return response.data;
  },

  // Get active templates by entity type
  getActiveByType: async (entityType: EntityType): Promise<{ data: ImageSizeTemplate[] }> => {
    const response = await apiClient.get(`/design/image-sizes/active/${entityType}`);
    return response.data;
  },

  // Create new image size template
  createImageSize: async (data: ImageSizeFormData): Promise<{ data: ImageSizeTemplate }> => {
    const response = await apiClient.post('/design/image-sizes', data);
    return response.data;
  },

  // Update image size template
  updateImageSize: async (id: string, data: Partial<ImageSizeFormData>): Promise<{ data: ImageSizeTemplate }> => {
    const response = await apiClient.put(`/design/image-sizes/${id}`, data);
    return response.data;
  },

  // Toggle active status
  toggleActive: async (id: string): Promise<{ data: ImageSizeTemplate }> => {
    const response = await apiClient.patch(`/design/image-sizes/${id}/toggle-active`);
    return response.data;
  },

  // Delete image size template
  deleteImageSize: async (id: string): Promise<void> => {
    await apiClient.delete(`/design/image-sizes/${id}`);
  },

  // Trigger image regeneration for template
  regenerateImages: async (id: string): Promise<{ data: any; message: string }> => {
    const response = await apiClient.post(`/design/image-sizes/${id}/regenerate`);
    return response.data;
  },
};
