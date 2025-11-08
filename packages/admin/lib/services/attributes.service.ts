import { apiClient } from "../api";

export interface AttributeValue {
  id: string;
  attributeGroupId: string;
  name: string;
  colorHex?: string;
  textureImage?: string;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface AttributeGroup {
  id: string;
  name: string;
  displayType: 'dropdown' | 'radio' | 'color';
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
  values?: AttributeValue[];
}

export interface AttributeGroupsResponse {
  data: AttributeGroup[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AttributeGroupFormData {
  name: string;
  displayType: 'dropdown' | 'radio' | 'color';
  status: 'active' | 'inactive';
}

export interface AttributeValueFormData {
  name: string;
  colorHex?: string;
  textureImage?: string;
  position?: number;
}

export const attributesService = {
  // Attribute Groups
  getAttributeGroups: async (params?: {
    search?: string;
    page?: number;
    limit?: number;
    status?: 'active' | 'inactive';
    include?: string;
  }): Promise<AttributeGroupsResponse> => {
    const response = await apiClient.get('/attributes/groups', { params });
    return response.data;
  },

  getAttributeGroup: async (id: string): Promise<{ data: AttributeGroup }> => {
    const response = await apiClient.get(`/attributes/groups/${id}`);
    return response.data;
  },

  createAttributeGroup: async (data: AttributeGroupFormData): Promise<{ data: AttributeGroup }> => {
    const response = await apiClient.post('/attributes/groups', data);
    return response.data;
  },

  updateAttributeGroup: async (id: string, data: AttributeGroupFormData): Promise<{ data: AttributeGroup }> => {
    const response = await apiClient.put(`/attributes/groups/${id}`, data);
    return response.data;
  },

  deleteAttributeGroup: async (id: string): Promise<void> => {
    await apiClient.delete(`/attributes/groups/${id}`);
  },

  // Attribute Values
  getAttributeValues: async (groupId: string): Promise<{ data: AttributeValue[] }> => {
    const response = await apiClient.get(`/attributes/groups/${groupId}/values`);
    return response.data;
  },

  createAttributeValue: async (groupId: string, data: AttributeValueFormData): Promise<{ data: AttributeValue }> => {
    const response = await apiClient.post(`/attributes/groups/${groupId}/values`, data);
    return response.data;
  },

  updateAttributeValue: async (id: string, data: AttributeValueFormData): Promise<{ data: AttributeValue }> => {
    const response = await apiClient.put(`/attributes/values/${id}`, data);
    return response.data;
  },

  deleteAttributeValue: async (id: string): Promise<void> => {
    await apiClient.delete(`/attributes/values/${id}`);
  },

  reorderAttributeValues: async (groupId: string, valueIds: string[]): Promise<void> => {
    await apiClient.post(`/attributes/groups/${groupId}/values/reorder`, { valueIds });
  },
};
