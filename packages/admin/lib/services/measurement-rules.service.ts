import { apiClient } from '../api';

export interface MeasurementRule {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  calculationType: 'package_based' | 'minimum_quantity' | 'step_quantity';
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface MeasurementRulesResponse {
  data: MeasurementRule[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface MeasurementRuleResponse {
  data: MeasurementRule;
}

export interface ProductMeasurementConfig {
  id: string;
  productId: string;
  measurementRuleId: string;
  pricingUnit: string;
  sellingUnit: string;
  unitsPerPackage: string | null;
  minimumQuantity: string | null;
  stepQuantity: string | null;
  displayBothUnits: boolean;
  calculatorEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CalculationResult {
  requestedUnits: number;
  pricingUnit: string;
  sellingUnit: string;
  packagesNeeded?: number;
  actualUnits: number;
  unitsPerPackage?: number;
  minimumQuantity?: number;
  stepQuantity?: number;
  stepsNeeded?: number;
  difference: number;
}

export const measurementRulesService = {
  getMeasurementRules: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: 'active' | 'inactive';
    calculationType?: 'package_based' | 'minimum_quantity' | 'step_quantity';
  }): Promise<MeasurementRulesResponse> => {
    const response = await apiClient.get<MeasurementRulesResponse>('/measurement-rules', { params });
    return response.data;
  },

  getMeasurementRule: async (id: string): Promise<MeasurementRuleResponse> => {
    const response = await apiClient.get<MeasurementRuleResponse>(`/measurement-rules/${id}`);
    return response.data;
  },

  createMeasurementRule: async (data: {
    name: string;
    slug: string;
    description?: string;
    calculationType: 'package_based' | 'minimum_quantity' | 'step_quantity';
    status?: 'active' | 'inactive';
  }): Promise<MeasurementRuleResponse> => {
    const response = await apiClient.post<MeasurementRuleResponse>('/measurement-rules', data);
    return response.data;
  },

  updateMeasurementRule: async (
    id: string,
    data: {
      name?: string;
      slug?: string;
      description?: string;
      calculationType?: 'package_based' | 'minimum_quantity' | 'step_quantity';
      status?: 'active' | 'inactive';
    }
  ): Promise<MeasurementRuleResponse> => {
    const response = await apiClient.put<MeasurementRuleResponse>(`/measurement-rules/${id}`, data);
    return response.data;
  },

  deleteMeasurementRule: async (id: string): Promise<void> => {
    await apiClient.delete(`/measurement-rules/${id}`);
  },

  calculate: async (data: {
    productId: string;
    requestedUnits: number;
  }): Promise<{ data: CalculationResult }> => {
    const response = await apiClient.post<{ data: CalculationResult }>('/measurement-rules/calculate', data);
    return response.data;
  }
};
