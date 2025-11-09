import { db } from '../db';
import { products, productPrices, productInventory } from '../db/schema';
import { warehouses } from '../db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { logger } from '../utils/logger';

export interface ImportRowData {
  sku: string;
  salePrice?: string | number; // Price with VAT
  purchasePrice?: string | number; // Supplier price (cost)
  warehouse1Id?: string;
  warehouse1Qty?: string | number;
  warehouse2Id?: string;
  warehouse2Qty?: string | number;
  warehouse3Id?: string;
  warehouse3Qty?: string | number;
  warehouse4Id?: string;
  warehouse4Qty?: string | number;
  warehouse5Id?: string;
  warehouse5Qty?: string | number;
  warehouse6Id?: string;
  warehouse6Qty?: string | number;
}

export interface ImportResult {
  success: boolean;
  totalRows: number;
  processedRows: number;
  updatedProducts: number;
  updatedPrices: number;
  updatedInventories: number;
  skippedRows: number;
  errors: ImportError[];
}

export interface ImportError {
  row: number;
  sku: string;
  reason: string;
}

const BATCH_SIZE = 100; // Process 100 rows at a time

/**
 * Process import data in batches
 * @param rows - Array of import rows with mapped data
 * @returns Import result with statistics
 */
export const processImport = async (rows: ImportRowData[]): Promise<ImportResult> => {
  const result: ImportResult = {
    success: true,
    totalRows: rows.length,
    processedRows: 0,
    updatedProducts: 0,
    updatedPrices: 0,
    updatedInventories: 0,
    skippedRows: 0,
    errors: []
  };

  logger.info(`Starting import process: ${rows.length} rows`);

  try {
    // Process in batches
    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE);
      await processBatch(batch, i, result);
    }

    result.success = true;
    logger.info(`Import completed: ${result.updatedProducts} products updated`);
  } catch (error) {
    result.success = false;
    logger.error('Import process failed:', error);
    throw error;
  }

  return result;
};

/**
 * Process a batch of import rows
 */
const processBatch = async (
  batch: ImportRowData[],
  startIndex: number,
  result: ImportResult
): Promise<void> => {
  // Extract all SKUs from batch
  const skus = batch.map(row => row.sku).filter(Boolean);

  // Fetch all products in this batch
  const batchProducts = await db.select()
    .from(products)
    .where(inArray(products.sku, skus));

  // Create a map for quick lookup
  const productMap = new Map(batchProducts.map(p => [p.sku, p]));

  // Extract all warehouse IDs from batch (only valid UUIDs)
  const warehouseIds = new Set<string>();
  const isValidUUID = (str: string) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  };

  batch.forEach(row => {
    if (row.warehouse1Id && isValidUUID(row.warehouse1Id)) warehouseIds.add(row.warehouse1Id);
    if (row.warehouse2Id && isValidUUID(row.warehouse2Id)) warehouseIds.add(row.warehouse2Id);
    if (row.warehouse3Id && isValidUUID(row.warehouse3Id)) warehouseIds.add(row.warehouse3Id);
    if (row.warehouse4Id && isValidUUID(row.warehouse4Id)) warehouseIds.add(row.warehouse4Id);
    if (row.warehouse5Id && isValidUUID(row.warehouse5Id)) warehouseIds.add(row.warehouse5Id);
    if (row.warehouse6Id && isValidUUID(row.warehouse6Id)) warehouseIds.add(row.warehouse6Id);
  });

  // Fetch all warehouses in this batch
  const batchWarehouses = warehouseIds.size > 0
    ? await db.select().from(warehouses).where(inArray(warehouses.id, Array.from(warehouseIds)))
    : [];

  const warehouseMap = new Map(batchWarehouses.map(w => [w.id, w]));

  // Process each row
  for (let i = 0; i < batch.length; i++) {
    const row = batch[i];
    const rowNumber = startIndex + i + 1;

    try {
      await processRow(row, rowNumber, productMap, warehouseMap, result);
    } catch (error) {
      result.errors.push({
        row: rowNumber,
        sku: row.sku,
        reason: error instanceof Error ? error.message : 'Unknown error'
      });
      result.skippedRows++;
    }
  }
};

/**
 * Process a single import row
 */
const processRow = async (
  row: ImportRowData,
  rowNumber: number,
  productMap: Map<string, any>,
  warehouseMap: Map<string, any>,
  result: ImportResult
): Promise<void> => {
  // Validate SKU exists
  const product = productMap.get(row.sku);
  if (!product) {
    logger.debug(`Row ${rowNumber}: SKU ${row.sku} not found - IGNORED`);
    result.skippedRows++;
    return;
  }

  // Update price if provided
  if (row.salePrice !== undefined && row.salePrice !== null && row.salePrice !== '') {
    await updateProductPrice(product.id, row.salePrice, row.purchasePrice);
    result.updatedPrices++;
  }

  // Update warehouse inventories
  const warehouseUpdates = extractWarehouseUpdates(row);
  let inventoryUpdated = false;

  for (const update of warehouseUpdates) {
    // Validate warehouse exists
    if (!warehouseMap.has(update.warehouseId)) {
      logger.debug(`Row ${rowNumber}: Warehouse ${update.warehouseId} not found - IGNORED`);
      continue;
    }

    await updateProductInventory(product.id, update.warehouseId, update.quantity);
    inventoryUpdated = true;
  }

  if (inventoryUpdated) {
    result.updatedInventories++;
  }

  result.processedRows++;
  result.updatedProducts++;
};

/**
 * Update product price (only if price is provided)
 */
const updateProductPrice = async (
  productId: string,
  salePrice: string | number,
  purchasePrice?: string | number
): Promise<void> => {
  const price = parseFloat(String(salePrice));
  const supplierPrice = purchasePrice ? parseFloat(String(purchasePrice)) : undefined;

  if (isNaN(price)) {
    logger.warn(`Invalid sale price: ${salePrice}`);
    return;
  }

  // Check if there's an active price record
  const [existingPrice] = await db.select()
    .from(productPrices)
    .where(
      and(
        eq(productPrices.productId, productId),
        eq(productPrices.validTo, null as any) // Active price has no validTo date
      )
    )
    .limit(1);

  if (existingPrice) {
    // Update existing price
    await db.update(productPrices)
      .set({
        price: String(price),
        supplierPrice: supplierPrice ? String(supplierPrice) : existingPrice.supplierPrice,
        updatedAt: new Date()
      })
      .where(eq(productPrices.id, existingPrice.id));
  } else {
    // Create new price record
    await db.insert(productPrices).values({
      productId,
      price: String(price),
      supplierPrice: supplierPrice ? String(supplierPrice) : null,
      currency: 'EUR',
      validFrom: new Date()
    });
  }

  logger.debug(`Updated price for product ${productId}: ${price} EUR`);
};

/**
 * Update product inventory for a specific warehouse
 */
const updateProductInventory = async (
  productId: string,
  warehouseId: string,
  quantity: number
): Promise<void> => {
  // Check if inventory record exists
  const [existingInventory] = await db.select()
    .from(productInventory)
    .where(
      and(
        eq(productInventory.productId, productId),
        eq(productInventory.warehouseId, warehouseId)
      )
    )
    .limit(1);

  if (existingInventory) {
    // Update existing inventory
    await db.update(productInventory)
      .set({
        quantity,
        updatedAt: new Date()
      })
      .where(eq(productInventory.id, existingInventory.id));
  } else {
    // Create new inventory record
    await db.insert(productInventory).values({
      productId,
      warehouseId,
      quantity,
      reservedQuantity: 0
    });
  }

  logger.debug(`Updated inventory for product ${productId} in warehouse ${warehouseId}: ${quantity}`);
};

/**
 * Extract warehouse updates from import row
 */
const extractWarehouseUpdates = (row: ImportRowData): Array<{ warehouseId: string; quantity: number }> => {
  const updates: Array<{ warehouseId: string; quantity: number }> = [];

  // Process all 6 possible warehouses
  const warehouseFields = [
    { id: row.warehouse1Id, qty: row.warehouse1Qty },
    { id: row.warehouse2Id, qty: row.warehouse2Qty },
    { id: row.warehouse3Id, qty: row.warehouse3Qty },
    { id: row.warehouse4Id, qty: row.warehouse4Qty },
    { id: row.warehouse5Id, qty: row.warehouse5Qty },
    { id: row.warehouse6Id, qty: row.warehouse6Qty }
  ];

  for (const field of warehouseFields) {
    if (field.id && field.qty !== undefined && field.qty !== null && field.qty !== '') {
      const quantity = parseInt(String(field.qty));
      if (!isNaN(quantity)) {
        updates.push({
          warehouseId: field.id,
          quantity
        });
      }
    }
  }

  return updates;
};

/**
 * Validate import data before processing
 * @param rows - Array of import rows
 * @returns Validation result with any errors
 */
export const validateImportData = async (rows: ImportRowData[]): Promise<{
  valid: boolean;
  errors: string[];
}> => {
  const errors: string[] = [];

  if (!rows || rows.length === 0) {
    errors.push('No data to import');
    return { valid: false, errors };
  }

  // Check for required SKU field
  const rowsWithoutSku = rows.filter(row => !row.sku || row.sku.trim() === '');
  if (rowsWithoutSku.length > 0) {
    errors.push(`${rowsWithoutSku.length} rows missing SKU field`);
  }

  // Check for at least one data field (price or warehouse)
  const rowsWithoutData = rows.filter(row => {
    const hasSalePrice = row.salePrice !== undefined && row.salePrice !== null && row.salePrice !== '';
    const hasPurchasePrice = row.purchasePrice !== undefined && row.purchasePrice !== null && row.purchasePrice !== '';
    const hasWarehouse = !!(
      row.warehouse1Id || row.warehouse2Id || row.warehouse3Id ||
      row.warehouse4Id || row.warehouse5Id || row.warehouse6Id
    );
    return !hasSalePrice && !hasPurchasePrice && !hasWarehouse;
  });

  if (rowsWithoutData.length > 0) {
    errors.push(`${rowsWithoutData.length} rows have no data to update (no price or warehouse info)`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
};
