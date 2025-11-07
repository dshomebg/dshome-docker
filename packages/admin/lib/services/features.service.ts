import { apiClient } from '../api';

export interface FeatureGroup {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
  values?: FeatureValue[];
}

export interface FeatureValue {
  id: string;
  featureGroupId: string;
  name: string;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface FeatureGroupsResponse {
  data: FeatureGroup[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface FeatureGroupResponse {
  data: FeatureGroup;
}

export interface FeatureValuesResponse {
  data: FeatureValue[];
}

export interface FeatureValueResponse {
  data: FeatureValue;
}

export const featuresService = {
  // Feature Groups
  getFeatureGroups: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: 'active' | 'inactive';
  }): Promise<FeatureGroupsResponse> => {
    const response = await apiClient.get<FeatureGroupsResponse>('/features/groups', { params });
    return response.data;
  },

  getFeatureGroup: async (id: string): Promise<FeatureGroupResponse> => {
    const response = await apiClient.get<FeatureGroupResponse>(`/features/groups/${id}`);
    return response.data;
  },

  createFeatureGroup: async (data: {
    name: string;
    status?: 'active' | 'inactive';
  }): Promise<FeatureGroupResponse> => {
    const response = await apiClient.post<FeatureGroupResponse>('/features/groups', data);
    return response.data;
  },

  updateFeatureGroup: async (
    id: string,
    data: {
      name: string;
      status: 'active' | 'inactive';
    }
  ): Promise<FeatureGroupResponse> => {
    const response = await apiClient.put<FeatureGroupResponse>(`/features/groups/${id}`, data);
    return response.data;
  },

  deleteFeatureGroup: async (id: string): Promise<void> => {
    await apiClient.delete(`/features/groups/${id}`);
  },

  // Feature Values
  getFeatureValues: async (groupId: string): Promise<FeatureValuesResponse> => {
    const response = await apiClient.get<FeatureValuesResponse>(`/features/groups/${groupId}/values`);
    return response.data;
  },

  createFeatureValue: async (
    groupId: string,
    data: { name: string; position?: number }
  ): Promise<FeatureValueResponse> => {
    const response = await apiClient.post<FeatureValueResponse>(
      `/features/groups/${groupId}/values`,
      data
    );
    return response.data;
  },

  updateFeatureValue: async (
    id: string,
    data: { name: string; position?: number }
  ): Promise<FeatureValueResponse> => {
    const response = await apiClient.put<FeatureValueResponse>(`/features/values/${id}`, data);
    return response.data;
  },

  deleteFeatureValue: async (id: string): Promise<void> => {
    await apiClient.delete(`/features/values/${id}`);
  },

  reorderFeatureValues: async (groupId: string, valueIds: string[]): Promise<void> => {
    await apiClient.post(`/features/groups/${groupId}/values/reorder`, { valueIds });
  },
};
