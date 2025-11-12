import { apiClient } from "../api";

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmailTemplateFormData {
  name: string;
  subject: string;
  content: string;
}

export interface EmailVariable {
  key: string;
  description: string;
}

export const emailTemplatesService = {
  // Get all email templates
  getEmailTemplates: async (params?: {
    search?: string;
  }): Promise<{ data: EmailTemplate[] }> => {
    const response = await apiClient.get('/design/email-templates', { params });
    return response.data;
  },

  // Get single email template by ID
  getEmailTemplate: async (id: string): Promise<{ data: EmailTemplate }> => {
    const response = await apiClient.get(`/design/email-templates/${id}`);
    return response.data;
  },

  // Create new email template
  createEmailTemplate: async (data: EmailTemplateFormData): Promise<{ data: EmailTemplate }> => {
    const response = await apiClient.post('/design/email-templates', data);
    return response.data;
  },

  // Update email template
  updateEmailTemplate: async (id: string, data: EmailTemplateFormData): Promise<{ data: EmailTemplate }> => {
    const response = await apiClient.put(`/design/email-templates/${id}`, data);
    return response.data;
  },

  // Delete email template
  deleteEmailTemplate: async (id: string): Promise<void> => {
    await apiClient.delete(`/design/email-templates/${id}`);
  },

  // Get available variables
  getAvailableVariables: async (): Promise<{ data: EmailVariable[] }> => {
    const response = await apiClient.get('/design/email-templates/variables');
    return response.data;
  },

  // Send test email
  sendTestEmail: async (id: string, email: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post(`/design/email-templates/${id}/send-test`, { email });
    return response.data;
  },
};
