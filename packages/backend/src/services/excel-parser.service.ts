import * as XLSX from 'xlsx';
import { logger } from '../utils/logger';

export interface ExcelColumn {
  index: number;
  letter: string;
  header: string;
}

export interface ExcelParseResult {
  columns: ExcelColumn[];
  rows: Record<string, any>[];
  totalRows: number;
}

/**
 * Parse Excel file from buffer
 * @param buffer - File buffer from uploaded Excel file
 * @returns Parsed Excel data with columns and rows
 */
export const parseExcelFile = (buffer: Buffer): ExcelParseResult => {
  try {
    // Read the workbook from buffer
    const workbook = XLSX.read(buffer, { type: 'buffer' });

    // Get the first sheet
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Get the range of the worksheet
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');

    // Extract column headers (first row)
    const columns: ExcelColumn[] = [];
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: range.s.r, c: col });
      const cell = worksheet[cellAddress];
      const letter = XLSX.utils.encode_col(col);
      const header = cell ? String(cell.v).trim() : `Column ${letter}`;

      columns.push({
        index: col,
        letter,
        header
      });
    }

    // Convert sheet to JSON, starting from row 2 (skip header row)
    const jsonData = XLSX.utils.sheet_to_json(worksheet, {
      raw: false, // Keep values as strings for consistency
      defval: '', // Default value for empty cells
      blankrows: false // Skip blank rows
    });

    logger.info(`Parsed Excel file: ${columns.length} columns, ${jsonData.length} rows`);

    return {
      columns,
      rows: jsonData,
      totalRows: jsonData.length
    };
  } catch (error) {
    logger.error('Error parsing Excel file:', error);
    throw new Error('Failed to parse Excel file. Please ensure it is a valid Excel file (.xlsx or .xls).');
  }
};

/**
 * Validate Excel file format
 * @param buffer - File buffer to validate
 * @returns true if valid Excel file
 */
export const isValidExcelFile = (buffer: Buffer): boolean => {
  try {
    XLSX.read(buffer, { type: 'buffer' });
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Get preview of Excel data (first N rows)
 * @param buffer - File buffer
 * @param maxRows - Maximum number of rows to preview (default: 10)
 * @returns Preview of Excel data
 */
export const getExcelPreview = (buffer: Buffer, maxRows: number = 10): ExcelParseResult => {
  try {
    const fullData = parseExcelFile(buffer);

    return {
      columns: fullData.columns,
      rows: fullData.rows.slice(0, maxRows),
      totalRows: fullData.totalRows
    };
  } catch (error) {
    logger.error('Error getting Excel preview:', error);
    throw error;
  }
};

/**
 * Apply column mapping to Excel data
 * @param rows - Raw Excel rows
 * @param columnMapping - Mapping of Excel columns to field names
 * @returns Rows with mapped field names
 */
export const applyColumnMapping = (
  rows: Record<string, any>[],
  columnMapping: Record<string, string>
): Record<string, any>[] => {
  return rows.map(row => {
    const mappedRow: Record<string, any> = {};

    for (const [excelColumn, fieldName] of Object.entries(columnMapping)) {
      if (fieldName && fieldName !== 'ignore') {
        mappedRow[fieldName] = row[excelColumn] || '';
      }
    }

    return mappedRow;
  });
};
