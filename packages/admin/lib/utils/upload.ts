import { apiClient } from '../api';

export interface UploadResponse {
  success: boolean;
  message: string;
  data: {
    url: string;
    filename: string;
  };
}

/**
 * Upload an image file to the server
 * @param file - The file to upload
 * @returns Promise with upload response containing the image URL
 */
export const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await apiClient.post<UploadResponse>('/upload/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  if (!response.data.success) {
    throw new Error(response.data.message || 'Failed to upload image');
  }

  // Return full URL with backend base URL (without /api suffix)
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
  const backendUrl = apiUrl.replace('/api', '');
  return `${backendUrl}${response.data.data.url}`;
};

/**
 * Delete an image from the server
 * @param filename - The filename to delete
 */
export const deleteImage = async (filename: string): Promise<void> => {
  await apiClient.delete(`/upload/image/${filename}`);
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
