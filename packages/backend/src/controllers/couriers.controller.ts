import { Request, Response, NextFunction } from 'express';
import { eq, desc, sql, and, or, lte, gte } from 'drizzle-orm';
import { db } from '../db';
import { couriers, courierPricingRanges } from '../db/schema';
import { AppError } from '../middleware/error.middleware';

// Get all couriers
export const getCouriers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, isActive } = req.query;

    let query = db.select().from(couriers);

    // Build where conditions
    const conditions = [];
    if (search) {
      conditions.push(sql`${couriers.name} ILIKE ${`%${search}%`}`);
    }
    if (isActive !== undefined) {
      conditions.push(eq(couriers.isActive, isActive === 'true'));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    const result = await query.orderBy(desc(couriers.createdAt));

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// Get single courier with pricing ranges
export const getCourier = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const courier = await db.select().from(couriers).where(eq(couriers.id, id)).limit(1);

    if (!courier.length) {
      throw new AppError(404, 'Courier not found', 'COURIER_NOT_FOUND');
    }

    // Get pricing ranges
    const pricingRanges = await db
      .select()
      .from(courierPricingRanges)
      .where(eq(courierPricingRanges.courierId, id))
      .orderBy(courierPricingRanges.deliveryType, courierPricingRanges.weightFrom);

    res.json({
      success: true,
      data: {
        ...courier[0],
        pricingRanges,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Create courier
export const createCourier = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      name,
      isActive,
      trackingUrl,
      logoUrl,
      offersOfficeDelivery,
      palletDeliveryEnabled,
      palletWeightThreshold,
      palletMaxWeight,
      palletPrice,
      pricingRanges,
    } = req.body;

    // Validate required fields
    if (!name) {
      throw new AppError(400, 'Name is required', 'VALIDATION_ERROR');
    }

    // Validate pricing ranges if provided
    if (pricingRanges && pricingRanges.length > 0) {
      validatePricingRanges(pricingRanges);
    }

    // Create courier
    const [newCourier] = await db
      .insert(couriers)
      .values({
        name,
        isActive: isActive ?? true,
        trackingUrl,
        logoUrl,
        offersOfficeDelivery: offersOfficeDelivery ?? false,
        palletDeliveryEnabled: palletDeliveryEnabled ?? false,
        palletWeightThreshold,
        palletMaxWeight,
        palletPrice,
      })
      .returning();

    // Create pricing ranges if provided
    if (pricingRanges && pricingRanges.length > 0) {
      const rangesToInsert = pricingRanges.map((range: any) => ({
        courierId: newCourier.id,
        deliveryType: range.deliveryType,
        weightFrom: range.weightFrom,
        weightTo: range.weightTo,
        price: range.price,
      }));

      await db.insert(courierPricingRanges).values(rangesToInsert);
    }

    // Fetch complete courier with ranges
    const result = await db.select().from(couriers).where(eq(couriers.id, newCourier.id)).limit(1);

    const ranges = await db
      .select()
      .from(courierPricingRanges)
      .where(eq(courierPricingRanges.courierId, newCourier.id));

    res.status(201).json({
      success: true,
      data: {
        ...result[0],
        pricingRanges: ranges,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Update courier
export const updateCourier = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const {
      name,
      isActive,
      trackingUrl,
      logoUrl,
      offersOfficeDelivery,
      palletDeliveryEnabled,
      palletWeightThreshold,
      palletMaxWeight,
      palletPrice,
      pricingRanges,
    } = req.body;

    // Check if courier exists
    const existing = await db.select().from(couriers).where(eq(couriers.id, id)).limit(1);

    if (!existing.length) {
      throw new AppError(404, 'Courier not found', 'COURIER_NOT_FOUND');
    }

    // Validate pricing ranges if provided
    if (pricingRanges && pricingRanges.length > 0) {
      validatePricingRanges(pricingRanges);
    }

    // Update courier
    await db
      .update(couriers)
      .set({
        name,
        isActive,
        trackingUrl,
        logoUrl,
        offersOfficeDelivery,
        palletDeliveryEnabled,
        palletWeightThreshold,
        palletMaxWeight,
        palletPrice,
        updatedAt: new Date(),
      })
      .where(eq(couriers.id, id));

    // Update pricing ranges if provided
    if (pricingRanges !== undefined) {
      // Delete existing ranges
      await db.delete(courierPricingRanges).where(eq(courierPricingRanges.courierId, id));

      // Insert new ranges
      if (pricingRanges.length > 0) {
        const rangesToInsert = pricingRanges.map((range: any) => ({
          courierId: id,
          deliveryType: range.deliveryType,
          weightFrom: range.weightFrom,
          weightTo: range.weightTo,
          price: range.price,
        }));

        await db.insert(courierPricingRanges).values(rangesToInsert);
      }
    }

    // Fetch updated courier with ranges
    const result = await db.select().from(couriers).where(eq(couriers.id, id)).limit(1);

    const ranges = await db
      .select()
      .from(courierPricingRanges)
      .where(eq(courierPricingRanges.courierId, id));

    res.json({
      success: true,
      data: {
        ...result[0],
        pricingRanges: ranges,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Delete courier
export const deleteCourier = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const existing = await db.select().from(couriers).where(eq(couriers.id, id)).limit(1);

    if (!existing.length) {
      throw new AppError(404, 'Courier not found', 'COURIER_NOT_FOUND');
    }

    // Delete courier (pricing ranges will be deleted via cascade)
    await db.delete(couriers).where(eq(couriers.id, id));

    res.json({
      success: true,
      message: 'Courier deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Calculate delivery price
export const calculateDeliveryPrice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { courierId, weight, deliveryType } = req.body;

    if (!courierId || !weight || !deliveryType) {
      throw new AppError(400, 'Courier ID, weight, and delivery type are required', 'VALIDATION_ERROR');
    }

    // Get courier
    const courier = await db.select().from(couriers).where(eq(couriers.id, courierId)).limit(1);

    if (!courier.length) {
      throw new AppError(404, 'Courier not found', 'COURIER_NOT_FOUND');
    }

    const courierData = courier[0];

    // Check if pallet delivery should be used
    if (
      courierData.palletDeliveryEnabled &&
      courierData.palletWeightThreshold &&
      courierData.palletMaxWeight &&
      courierData.palletPrice &&
      parseFloat(weight) >= parseFloat(courierData.palletWeightThreshold as any)
    ) {
      const palletCount = Math.ceil(parseFloat(weight) / parseFloat(courierData.palletMaxWeight as any));
      const totalPrice = palletCount * parseFloat(courierData.palletPrice as any);

      return res.json({
        success: true,
        data: {
          price: totalPrice,
          deliveryMethod: 'pallet',
          palletCount,
        },
      });
    }

    // Find matching price range
    const ranges = await db
      .select()
      .from(courierPricingRanges)
      .where(
        and(
          eq(courierPricingRanges.courierId, courierId),
          eq(courierPricingRanges.deliveryType, deliveryType),
          lte(courierPricingRanges.weightFrom, weight),
          gte(courierPricingRanges.weightTo, weight)
        )
      )
      .limit(1);

    if (!ranges.length) {
      throw new AppError(404, 'No pricing range found for this weight', 'PRICING_RANGE_NOT_FOUND');
    }

    res.json({
      success: true,
      data: {
        price: parseFloat(ranges[0].price as any),
        deliveryMethod: 'standard',
      },
    });
  } catch (error) {
    next(error);
  }
};

// Validate pricing ranges
function validatePricingRanges(ranges: any[]) {
  const addressRanges = ranges.filter((r) => r.deliveryType === 'address').sort((a, b) => parseFloat(a.weightFrom) - parseFloat(b.weightFrom));
  const officeRanges = ranges.filter((r) => r.deliveryType === 'office').sort((a, b) => parseFloat(a.weightFrom) - parseFloat(b.weightFrom));

  // Validate each type separately
  validateRangeType(addressRanges, 'address');
  validateRangeType(officeRanges, 'office');
}

function validateRangeType(ranges: any[], type: string) {
  if (ranges.length === 0) return;

  // Check first range starts at 0
  if (parseFloat(ranges[0].weightFrom) !== 0) {
    throw new AppError(400, `First ${type} delivery range must start at 0 kg`, 'VALIDATION_ERROR');
  }

  // Check ranges don't overlap and have no gaps
  for (let i = 0; i < ranges.length - 1; i++) {
    const current = ranges[i];
    const next = ranges[i + 1];

    if (parseFloat(current.weightTo) >= parseFloat(next.weightFrom)) {
      throw new AppError(400, `${type} delivery ranges overlap or have invalid ordering`, 'VALIDATION_ERROR');
    }
  }

  // Check all weights are positive
  for (const range of ranges) {
    if (parseFloat(range.weightFrom) < 0 || parseFloat(range.weightTo) <= 0 || parseFloat(range.price) < 0) {
      throw new AppError(400, `${type} delivery range has invalid values`, 'VALIDATION_ERROR');
    }

    if (parseFloat(range.weightFrom) >= parseFloat(range.weightTo)) {
      throw new AppError(400, `${type} delivery range: weightFrom must be less than weightTo`, 'VALIDATION_ERROR');
    }
  }
}
