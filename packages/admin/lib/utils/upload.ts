import { apiClient } from '../api';

export interface UploadResponse {
  success: boolean;
  message: string;
  data: {
    url: string;
    filename: string;
    // New fields for multi-size image generation
    urls?: Record<string, string>;
    originalUrl?: string;
    generatedSizes?: string[];
  };
}

export type EntityType = 'product' | 'category' | 'brand' | 'blog';

/**
 * Upload an image file to the server
 * @param file - The file to upload
 * @param entityType - Type of entity (product, category, brand, blog)
 * @param entityId - ID of the entity
 * @returns Promise with upload response containing the image URLs
 */
export const uploadImage = async (
  file: File,
  entityType?: EntityType,
  entityId?: string
): Promise<string> => {
  const formData = new FormData();
  formData.append('image', file);

  // Add entityType and entityId if provided (for new multi-size system)
  if (entityType && entityId) {
    formData.append('entityType', entityType);
    formData.append('entityId', entityId);
  }

  const response = await apiClient.post<UploadResponse>('/upload/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  if (!response.data.success) {
    throw new Error(response.data.message || 'Failed to upload image');
  }

  // Return relative URLs - Nginx will handle proxying to backend
  // On production: /uploads/* -> proxied to backend via Nginx
  // On development: /uploads/* -> served by backend on localhost:4000

  // If using new multi-size system, return the original URL (always unique)
  // For admin panel, we want the original high-quality image
  if (response.data.data.originalUrl) {
    return response.data.data.originalUrl;
  }

  // Fallback for legacy uploads
  if (response.data.data.url) {
    return response.data.data.url;
  }

  // Last resort fallback to original from urls object
  if (response.data.data.urls?.original) {
    return response.data.data.urls.original;
  }

  throw new Error('No URL found in upload response');
};

/**
 * Upload an image with full response (all generated URLs)
 * @param file - The file to upload
 * @param entityType - Type of entity (product, category, brand, blog)
 * @param entityId - ID of the entity
 * @returns Promise with full upload response
 */
export const uploadImageWithDetails = async (
  file: File,
  entityType: EntityType,
  entityId: string
): Promise<UploadResponse['data']> => {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('entityType', entityType);
  formData.append('entityId', entityId);

  const response = await apiClient.post<UploadResponse>('/upload/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  if (!response.data.success) {
    throw new Error(response.data.message || 'Failed to upload image');
  }

  // Return relative URLs - Nginx will handle proxying to backend
  // Backend returns relative URLs like /uploads/... which work on both dev and production
  return response.data.data;
};

/**
 * Delete an image from the server (legacy)
 * @param filename - The filename to delete
 */
export const deleteImage = async (filename: string): Promise<void> => {
  await apiClient.delete(`/upload/image/${filename}`);
};

/**
 * Delete all images for an entity
 * @param entityType - Type of entity
 * @param entityId - ID of the entity
 */
export const deleteEntityImages = async (entityType: EntityType, entityId: string): Promise<void> => {
  await apiClient.delete(`/upload/${entityType}/${entityId}`);
};

/**
 * Convert base64 to File object
 * @param base64 - Base64 string
 * @param filename - Name for the file
 * @returns File object
 */
export const base64ToFile = (base64: string, filename: string): File => {
  const arr = base64.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new File([u8arr], filename, { type: mime });
};
