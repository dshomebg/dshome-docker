import { apiClient } from "../api";

export interface ImportTemplate {
  id: string;
  name: string;
  columnMapping: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export interface ImportTemplatesResponse {
  data: ImportTemplate[];
}

export interface ImportTemplateResponse {
  data: ImportTemplate;
}

export interface ImportTemplateFormData {
  name: string;
  columnMapping: Record<string, string>;
}

export const importTemplatesService = {
  // Get all import templates
  getImportTemplates: async (): Promise<ImportTemplatesResponse> => {
    const response = await apiClient.get('/import-templates');
    return response.data;
  },

  // Get single import template by ID
  getImportTemplate: async (id: string): Promise<ImportTemplateResponse> => {
    const response = await apiClient.get(`/import-templates/${id}`);
    return response.data;
  },

  // Create new import template
  createImportTemplate: async (data: ImportTemplateFormData): Promise<ImportTemplateResponse> => {
    const response = await apiClient.post('/import-templates', data);
    return response.data;
  },

  // Update import template
  updateImportTemplate: async (id: string, data: Partial<ImportTemplateFormData>): Promise<ImportTemplateResponse> => {
    const response = await apiClient.put(`/import-templates/${id}`, data);
    return response.data;
  },

  // Delete import template
  deleteImportTemplate: async (id: string): Promise<void> => {
    await apiClient.delete(`/import-templates/${id}`);
  }
};
