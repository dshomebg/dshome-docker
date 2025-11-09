import { apiClient } from '../api';

export interface RichSnippetsSettings {
  id: string;

  // Organization Settings
  organizationEnabled: boolean;
  organizationName: string;
  organizationLogo: string;
  organizationType: string;
  telephone: string;
  email: string;
  addressStreet: string;
  addressCity: string;
  addressPostalCode: string;
  addressCountry: string;
  socialFacebook: string;
  socialInstagram: string;
  socialTwitter: string;

  // Product Snippets
  productSnippetsEnabled: boolean;
  productDescriptionType: 'short' | 'full';
  productIncludeSpecifications: boolean;
  productIncludePrice: boolean;
  productIncludeAvailability: boolean;
  productIncludeSku: boolean;
  productIncludeImages: boolean;
  productIncludeBrand: boolean;
  defaultCurrency: string;

  // Breadcrumbs
  breadcrumbsEnabled: boolean;

  // Website Search
  websiteSearchEnabled: boolean;
  searchUrlPattern: string;

  // Blog Snippets
  blogSnippetsEnabled: boolean;
  defaultAuthorName: string;
  defaultAuthorImage: string;

  createdAt: string;
  updatedAt: string;
}

export interface RichSnippetsSettingsResponse {
  data: RichSnippetsSettings;
}

export const richSnippetsSettingsService = {
  getRichSnippetsSettings: async (): Promise<RichSnippetsSettingsResponse> => {
    const response = await apiClient.get<RichSnippetsSettingsResponse>('/rich-snippets-settings');
    return response.data;
  },

  updateRichSnippetsSettings: async (data: Partial<RichSnippetsSettings>): Promise<RichSnippetsSettingsResponse> => {
    const response = await apiClient.put<RichSnippetsSettingsResponse>('/rich-snippets-settings', data);
    return response.data;
  }
};
