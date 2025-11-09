import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { measurementRules, productMeasurementConfig } from '../db/schema/products';
import { eq, desc, ilike, or, and } from 'drizzle-orm';
import { AppError } from '../middleware/error.middleware';
import logger from '../utils/logger';

// Get all measurement rules with optional filters
export const getMeasurementRules = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      page = 1,
      limit = 50,
      search,
      status,
      calculationType
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    // Build where conditions
    const conditions = [];

    if (search) {
      conditions.push(
        or(
          ilike(measurementRules.name, `%${search}%`),
          ilike(measurementRules.description, `%${search}%`)
        )
      );
    }

    if (status) {
      conditions.push(eq(measurementRules.status, status as 'active' | 'inactive'));
    }

    if (calculationType) {
      conditions.push(eq(measurementRules.calculationType, calculationType as any));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get rules with pagination
    const rules = await db
      .select()
      .from(measurementRules)
      .where(whereClause)
      .orderBy(desc(measurementRules.createdAt))
      .limit(limitNum)
      .offset(offset);

    // Get total count
    const totalResult = await db
      .select()
      .from(measurementRules)
      .where(whereClause);

    const total = totalResult.length;
    const totalPages = Math.ceil(total / limitNum);

    res.json({
      data: rules,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get single measurement rule by ID
export const getMeasurementRule = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const [rule] = await db
      .select()
      .from(measurementRules)
      .where(eq(measurementRules.id, id))
      .limit(1);

    if (!rule) {
      throw new AppError(404, 'Measurement rule not found', 'RULE_NOT_FOUND');
    }

    res.json({ data: rule });
  } catch (error) {
    next(error);
  }
};

// Create new measurement rule
export const createMeasurementRule = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, slug, description, calculationType, status } = req.body;

    // Check if slug already exists
    const [existing] = await db
      .select()
      .from(measurementRules)
      .where(eq(measurementRules.slug, slug))
      .limit(1);

    if (existing) {
      throw new AppError(400, 'Measurement rule with this slug already exists', 'SLUG_EXISTS');
    }

    const [newRule] = await db
      .insert(measurementRules)
      .values({
        name,
        slug,
        description,
        calculationType,
        status: status || 'active'
      })
      .returning();

    logger.info(`Created measurement rule: ${name} (${newRule.id})`);

    res.status(201).json({ data: newRule });
  } catch (error) {
    next(error);
  }
};

// Update measurement rule
export const updateMeasurementRule = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if rule exists
    const [rule] = await db
      .select()
      .from(measurementRules)
      .where(eq(measurementRules.id, id))
      .limit(1);

    if (!rule) {
      throw new AppError(404, 'Measurement rule not found', 'RULE_NOT_FOUND');
    }

    // If updating slug, check it doesn't already exist
    if (updateData.slug && updateData.slug !== rule.slug) {
      const [existing] = await db
        .select()
        .from(measurementRules)
        .where(eq(measurementRules.slug, updateData.slug))
        .limit(1);

      if (existing) {
        throw new AppError(400, 'Measurement rule with this slug already exists', 'SLUG_EXISTS');
      }
    }

    const [updatedRule] = await db
      .update(measurementRules)
      .set({
        ...updateData,
        updatedAt: new Date()
      })
      .where(eq(measurementRules.id, id))
      .returning();

    logger.info(`Updated measurement rule: ${updatedRule.name} (${id})`);

    res.json({ data: updatedRule });
  } catch (error) {
    next(error);
  }
};

// Delete measurement rule
export const deleteMeasurementRule = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Check if rule exists
    const [rule] = await db
      .select()
      .from(measurementRules)
      .where(eq(measurementRules.id, id))
      .limit(1);

    if (!rule) {
      throw new AppError(404, 'Measurement rule not found', 'RULE_NOT_FOUND');
    }

    // Check if rule is used by any products
    const productsUsingRule = await db
      .select()
      .from(productMeasurementConfig)
      .where(eq(productMeasurementConfig.measurementRuleId, id));

    if (productsUsingRule.length > 0) {
      throw new AppError(
        400,
        `Cannot delete measurement rule. It is used by ${productsUsingRule.length} product(s)`,
        'RULE_IN_USE'
      );
    }

    await db.delete(measurementRules).where(eq(measurementRules.id, id));

    logger.info(`Deleted measurement rule: ${rule.name} (${id})`);

    res.json({ message: 'Measurement rule deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Calculate packages/units based on measurement config
export const calculateMeasurement = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId, requestedUnits } = req.body;

    if (!productId || !requestedUnits) {
      throw new AppError(400, 'productId and requestedUnits are required', 'MISSING_PARAMS');
    }

    // Get product measurement config
    const [config] = await db
      .select({
        config: productMeasurementConfig,
        rule: measurementRules
      })
      .from(productMeasurementConfig)
      .innerJoin(measurementRules, eq(productMeasurementConfig.measurementRuleId, measurementRules.id))
      .where(eq(productMeasurementConfig.productId, productId))
      .limit(1);

    if (!config) {
      throw new AppError(404, 'No measurement configuration found for this product', 'CONFIG_NOT_FOUND');
    }

    const { config: measurementConfig, rule } = config;
    const requestedUnitsNum = parseFloat(requestedUnits);

    let result: any = {
      requestedUnits: requestedUnitsNum,
      pricingUnit: measurementConfig.pricingUnit,
      sellingUnit: measurementConfig.sellingUnit
    };

    // Calculate based on rule type
    switch (rule.calculationType) {
      case 'package_based': {
        if (!measurementConfig.unitsPerPackage) {
          throw new AppError(400, 'Units per package not configured', 'MISSING_CONFIG');
        }

        const unitsPerPackage = parseFloat(measurementConfig.unitsPerPackage);
        const packagesNeeded = Math.ceil(requestedUnitsNum / unitsPerPackage);
        const actualUnits = packagesNeeded * unitsPerPackage;

        result = {
          ...result,
          packagesNeeded,
          actualUnits,
          unitsPerPackage,
          difference: actualUnits - requestedUnitsNum
        };
        break;
      }

      case 'minimum_quantity': {
        if (!measurementConfig.minimumQuantity) {
          throw new AppError(400, 'Minimum quantity not configured', 'MISSING_CONFIG');
        }

        const minimumQuantity = parseFloat(measurementConfig.minimumQuantity);
        const actualUnits = Math.max(requestedUnitsNum, minimumQuantity);

        result = {
          ...result,
          minimumQuantity,
          actualUnits,
          difference: actualUnits - requestedUnitsNum
        };
        break;
      }

      case 'step_quantity': {
        if (!measurementConfig.stepQuantity) {
          throw new AppError(400, 'Step quantity not configured', 'MISSING_CONFIG');
        }

        const stepQuantity = parseFloat(measurementConfig.stepQuantity);
        const steps = Math.ceil(requestedUnitsNum / stepQuantity);
        const actualUnits = steps * stepQuantity;

        result = {
          ...result,
          stepQuantity,
          stepsNeeded: steps,
          actualUnits,
          difference: actualUnits - requestedUnitsNum
        };
        break;
      }

      default:
        throw new AppError(400, 'Unknown calculation type', 'UNKNOWN_TYPE');
    }

    res.json({ data: result });
  } catch (error) {
    next(error);
  }
};
