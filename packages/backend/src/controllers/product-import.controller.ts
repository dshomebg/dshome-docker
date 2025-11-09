import { Request, Response, NextFunction } from 'express';
import { parseExcelFile, getExcelPreview, applyColumnMapping } from '../services/excel-parser.service';
import { processImport, validateImportData, ImportRowData } from '../services/product-import.service';
import { AppError } from '../middleware/error.middleware';
import { logger } from '../utils/logger';

/**
 * Parse Excel file and return column headers for mapping
 */
export const parseExcelForMapping = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      throw new AppError(400, 'No file uploaded', 'NO_FILE');
    }

    const buffer = req.file.buffer;
    const preview = getExcelPreview(buffer, 5); // Get first 5 rows as preview

    logger.info(`Excel file parsed: ${preview.columns.length} columns, ${preview.totalRows} total rows`);

    res.json({
      success: true,
      data: {
        columns: preview.columns,
        preview: preview.rows,
        totalRows: preview.totalRows
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Process import with provided column mapping
 */
export const processProductImport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      throw new AppError(400, 'No file uploaded', 'NO_FILE');
    }

    const { columnMapping } = req.body;

    if (!columnMapping) {
      throw new AppError(400, 'Column mapping is required', 'MISSING_MAPPING');
    }

    // Parse column mapping (it comes as JSON string from multipart form)
    let mapping: Record<string, string>;
    try {
      mapping = typeof columnMapping === 'string' ? JSON.parse(columnMapping) : columnMapping;
    } catch (error) {
      throw new AppError(400, 'Invalid column mapping format', 'INVALID_MAPPING');
    }

    // Parse the Excel file
    const buffer = req.file.buffer;
    const parsedData = parseExcelFile(buffer);

    logger.info(`Processing import: ${parsedData.totalRows} rows`);

    // Apply column mapping to convert Excel columns to our field names
    const mappedRows = applyColumnMapping(parsedData.rows, mapping) as ImportRowData[];

    // Validate the data
    const validation = await validateImportData(mappedRows);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        errors: validation.errors
      });
    }

    // Process the import
    const result = await processImport(mappedRows);

    logger.info(`Import completed: ${result.updatedProducts} products updated`);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Validate import data without processing
 */
export const validateProductImport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      throw new AppError(400, 'No file uploaded', 'NO_FILE');
    }

    const { columnMapping } = req.body;

    if (!columnMapping) {
      throw new AppError(400, 'Column mapping is required', 'MISSING_MAPPING');
    }

    // Parse column mapping
    let mapping: Record<string, string>;
    try {
      mapping = typeof columnMapping === 'string' ? JSON.parse(columnMapping) : columnMapping;
    } catch (error) {
      throw new AppError(400, 'Invalid column mapping format', 'INVALID_MAPPING');
    }

    // Parse the Excel file
    const buffer = req.file.buffer;
    const parsedData = parseExcelFile(buffer);

    // Apply column mapping
    const mappedRows = applyColumnMapping(parsedData.rows, mapping) as ImportRowData[];

    // Validate the data
    const validation = await validateImportData(mappedRows);

    res.json({
      success: validation.valid,
      errors: validation.errors,
      totalRows: mappedRows.length
    });
  } catch (error) {
    next(error);
  }
};
