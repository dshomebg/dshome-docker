import { apiClient } from "../api";

export interface ExcelColumn {
  index: number;
  letter: string;
  header: string;
}

export interface ParseExcelResponse {
  success: boolean;
  data: {
    columns: ExcelColumn[];
    preview: Record<string, any>[];
    totalRows: number;
  };
}

export interface ImportResult {
  success: boolean;
  totalRows: number;
  processedRows: number;
  updatedProducts: number;
  updatedPrices: number;
  updatedInventories: number;
  skippedRows: number;
  errors: Array<{
    row: number;
    sku: string;
    reason: string;
  }>;
}

export interface ImportResponse {
  success: boolean;
  data: ImportResult;
}

export interface ValidateImportResponse {
  success: boolean;
  errors: string[];
  totalRows: number;
}

export const productImportService = {
  // Parse Excel file and return columns for mapping
  parseExcel: async (file: File): Promise<ParseExcelResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post('/product-import/parse', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Validate import data
  validateImport: async (file: File, columnMapping: Record<string, string>): Promise<ValidateImportResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('columnMapping', JSON.stringify(columnMapping));

    const response = await apiClient.post('/product-import/validate', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Process import
  processImport: async (file: File, columnMapping: Record<string, string>): Promise<ImportResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('columnMapping', JSON.stringify(columnMapping));

    const response = await apiClient.post('/product-import/process', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }
};
