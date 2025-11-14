import { apiClient } from "../api";

export interface ProductQuestion {
  id: string;
  productId: string;
  customerId?: string;
  questionText: string;
  askerName: string;
  askerEmail: string;
  status: 'pending' | 'approved';
  createdAt: string;
  updatedAt: string;
}

export interface ProductAnswer {
  id: string;
  questionId: string;
  customerId?: string;
  answerText: string;
  answererName: string;
  answererEmail?: string;
  isStoreOfficial: boolean;
  status: 'pending' | 'approved';
  createdAt: string;
  updatedAt: string;
}

export interface QuestionWithAnswers extends ProductQuestion {
  answers: ProductAnswer[];
}

export interface QuestionWithProduct {
  question: ProductQuestion;
  product: {
    id: string;
    name: string;
    slug: string;
  };
  answers: ProductAnswer[];
}

export interface QuestionsResponse {
  data: QuestionWithAnswers[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AdminQuestionsResponse {
  data: QuestionWithProduct[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ProductQaSettings {
  id: string;
  autoApproveQuestions: boolean;
  autoApproveCustomerAnswers: boolean;
  emailTemplateId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateQuestionData {
  productId: string;
  customerId?: string;
  questionText: string;
  askerName: string;
  askerEmail: string;
}

export interface CreateAnswerData {
  customerId?: string;
  answerText: string;
  answererName: string;
  answererEmail?: string;
  isStoreOfficial?: boolean;
}

export interface UpdateQaSettingsData {
  autoApproveQuestions?: boolean;
  autoApproveCustomerAnswers?: boolean;
  emailTemplateId?: string;
}

export const productQaService = {
  // Public: Get questions for a specific product with answers
  getProductQuestions: async (
    productId: string,
    params?: {
      page?: number;
      limit?: number;
    }
  ): Promise<QuestionsResponse> => {
    const response = await apiClient.get(`/product-qa/product/${productId}`, { params });
    return response.data;
  },

  // Public: Ask a question (customer or guest)
  askQuestion: async (data: CreateQuestionData): Promise<{ success: boolean; data: ProductQuestion; message: string }> => {
    const response = await apiClient.post('/product-qa/questions', data);
    return response.data;
  },

  // Public/Admin: Add answer to a question
  addAnswer: async (questionId: string, data: CreateAnswerData): Promise<{ success: boolean; data: ProductAnswer; message: string }> => {
    const response = await apiClient.post(`/product-qa/questions/${questionId}/answers`, data);
    return response.data;
  },

  // Admin: Get all questions with filtering
  getAllQuestions: async (params?: {
    page?: number;
    limit?: number;
    status?: 'pending' | 'approved';
    productId?: string;
    withoutAnswers?: boolean;
  }): Promise<AdminQuestionsResponse> => {
    const response = await apiClient.get('/product-qa/admin/questions', { params });
    return response.data;
  },

  // Admin: Get single question with answers
  getQuestion: async (id: string): Promise<{ data: QuestionWithProduct }> => {
    const response = await apiClient.get(`/product-qa/admin/questions/${id}`);
    return response.data;
  },

  // Admin: Approve question
  approveQuestion: async (id: string): Promise<{ success: boolean; data: ProductQuestion; message: string }> => {
    const response = await apiClient.patch(`/product-qa/questions/${id}/approve`);
    return response.data;
  },

  // Admin: Approve answer
  approveAnswer: async (id: string): Promise<{ success: boolean; data: ProductAnswer; message: string }> => {
    const response = await apiClient.patch(`/product-qa/answers/${id}/approve`);
    return response.data;
  },

  // Admin: Delete question
  deleteQuestion: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete(`/product-qa/questions/${id}`);
    return response.data;
  },

  // Admin: Delete answer
  deleteAnswer: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete(`/product-qa/answers/${id}`);
    return response.data;
  },

  // Admin: Get Q&A settings
  getQaSettings: async (): Promise<{ data: ProductQaSettings }> => {
    const response = await apiClient.get('/product-qa/settings');
    return response.data;
  },

  // Admin: Update Q&A settings
  updateQaSettings: async (data: UpdateQaSettingsData): Promise<{ success: boolean; data: ProductQaSettings; message: string }> => {
    const response = await apiClient.put('/product-qa/settings', data);
    return response.data;
  },
};
