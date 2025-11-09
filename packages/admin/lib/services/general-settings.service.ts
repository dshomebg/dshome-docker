import { apiClient } from '../api';

export interface GeneralSettings {
  id: string;
  baseUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface GeneralSettingsResponse {
  data: GeneralSettings;
}

export const generalSettingsService = {
  getGeneralSettings: async (): Promise<GeneralSettingsResponse> => {
    const response = await apiClient.get<GeneralSettingsResponse>('/general-settings');
    return response.data;
  },

  updateGeneralSettings: async (data: Partial<GeneralSettings>): Promise<GeneralSettingsResponse> => {
    const response = await apiClient.put<GeneralSettingsResponse>('/general-settings', data);
    return response.data;
  }
};
