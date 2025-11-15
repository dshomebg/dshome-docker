import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { products, productCategories, productFeatures, categoryFeatureWeights, featureGroups, featureValues } from '../db/schema';
import { eq, and, ne, inArray, sql, desc } from 'drizzle-orm';
import { logger } from '../utils/logger';

interface SimilarProduct {
  id: string;
  name: string;
  slug: string;
  sku: string;
  image: string | null;
  price: number;
  compareAtPrice: number | null;
  similarityScore: number;
  matchDetails?: {
    sameCategory: boolean;
    featureMatches: Array<{
      groupName: string;
      weight: number;
      matched: boolean;
    }>;
    priceMatch?: {
      weight: number;
      score: number;
      priceDiff: number;
    };
  };
}

/**
 * Get similar products for a given product
 * Combines same category and similar features algorithms
 */
export const getSimilarProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const type = (req.query.type as string) || 'all'; // same_category | similar_features | all
    const limit = parseInt(req.query.limit as string) || 10;

    logger.info(`GET /api/products/${id}/similar-products`, { type, limit });

    // 1. Get the source product
    const [sourceProduct] = await db.select()
      .from(products)
      .where(eq(products.id, id))
      .limit(1);

    if (!sourceProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Get primary category
    const [primaryCategoryRel] = await db
      .select()
      .from(productCategories)
      .where(and(
        eq(productCategories.productId, id),
        eq(productCategories.isPrimary, true)
      ))
      .limit(1);

    if (!primaryCategoryRel) {
      return res.json({
        success: true,
        data: {
          productId: id,
          productName: sourceProduct.name,
          similarProducts: [],
          totalFound: 0
        }
      });
    }

    const primaryCategoryId = primaryCategoryRel.categoryId;

    let similarProducts: SimilarProduct[] = [];

    // 2. Execute requested similarity algorithms
    if (type === 'same_category' || type === 'all') {
      const sameCategoryProducts = await getSameCategoryProducts(
        id,
        primaryCategoryId,
        limit
      );
      similarProducts = [...similarProducts, ...sameCategoryProducts];
    }

    if (type === 'similar_features' || type === 'all') {
      const similarFeatureProducts = await getSimilarFeatureProducts(
        id,
        sourceProduct,
        primaryCategoryId,
        limit
      );
      similarProducts = [...similarProducts, ...similarFeatureProducts];
    }

    // 3. Merge and deduplicate results
    const uniqueProducts = deduplicateAndMerge(similarProducts);

    // 4. Sort by similarity score and limit
    const sortedProducts = uniqueProducts
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, limit);

    logger.info(`Found ${sortedProducts.length} similar products for ${sourceProduct.name}`);

    res.json({
      success: true,
      data: {
        productId: id,
        productName: sourceProduct.name,
        similarProducts: sortedProducts,
        totalFound: sortedProducts.length
      }
    });
  } catch (error) {
    logger.error('Error getting similar products:', error);
    next(error);
  }
};

/**
 * Sub-module 1: Get products from same category
 */
async function getSameCategoryProducts(
  productId: string,
  categoryId: string,
  limit: number
): Promise<SimilarProduct[]> {
  // Get products from same category, excluding current product
  const categoryProducts = await db
    .select({
      product: products,
      isPrimary: productCategories.isPrimary
    })
    .from(products)
    .innerJoin(productCategories, eq(productCategories.productId, products.id))
    .where(
      and(
        eq(productCategories.categoryId, categoryId),
        ne(products.id, productId),
        eq(products.status, 'active')
      )
    )
    .limit(limit * 2); // Get more to account for filtering

  // Convert to SimilarProduct format
  return categoryProducts
    .filter(p => p.isPrimary) // Only products where this is primary category
    .map(p => ({
      id: p.product.id,
      name: p.product.name,
      slug: p.product.slug,
      sku: p.product.sku,
      image: p.product.image,
      price: parseFloat(p.product.price || '0'),
      compareAtPrice: p.product.compareAtPrice ? parseFloat(p.product.compareAtPrice) : null,
      similarityScore: 50, // Base score for same category
      matchDetails: {
        sameCategory: true,
        featureMatches: []
      }
    }));
}

/**
 * Sub-module 2: Get products with similar features using weighted matching
 */
async function getSimilarFeatureProducts(
  productId: string,
  sourceProduct: any,
  categoryId: string,
  limit: number
): Promise<SimilarProduct[]> {
  // 1. Get category feature weights configuration
  const weights = await db
    .select({
      id: categoryFeatureWeights.id,
      featureGroupId: categoryFeatureWeights.featureGroupId,
      weightType: categoryFeatureWeights.weightType,
      weight: categoryFeatureWeights.weight,
      featureGroup: featureGroups
    })
    .from(categoryFeatureWeights)
    .leftJoin(featureGroups, eq(categoryFeatureWeights.featureGroupId, featureGroups.id))
    .where(eq(categoryFeatureWeights.categoryId, categoryId));

  if (weights.length === 0) {
    // No weights configured, return empty
    return [];
  }

  // 2. Get source product features
  const sourceFeatures = await db
    .select({
      featureValueId: productFeatures.featureValueId,
      featureGroupId: featureValues.featureGroupId
    })
    .from(productFeatures)
    .innerJoin(featureValues, eq(productFeatures.featureValueId, featureValues.id))
    .where(eq(productFeatures.productId, productId));

  // Map by feature group
  const sourceFeaturesByGroup = new Map<string, string>();
  sourceFeatures.forEach((pf) => {
    sourceFeaturesByGroup.set(pf.featureGroupId, pf.featureValueId);
  });

  // Get source product price
  const sourcePrice = parseFloat(sourceProduct.price || '0');

  // 3. Get candidate products from same category
  const candidateProducts = await db
    .select({
      product: products
    })
    .from(products)
    .innerJoin(productCategories, eq(productCategories.productId, products.id))
    .where(
      and(
        eq(productCategories.categoryId, categoryId),
        eq(productCategories.isPrimary, true),
        ne(products.id, sourceProduct.id),
        eq(products.status, 'active')
      )
    )
    .limit(100); // Get a larger pool for scoring

  // 4. Calculate similarity score for each candidate
  const scoredProducts: SimilarProduct[] = [];

  for (const candidate of candidateProducts) {
    const candidatePrice = parseFloat(candidate.product.price || '0');

    // Get candidate features
    const candidateFeatures = await db
      .select({
        featureValueId: productFeatures.featureValueId,
        featureGroupId: featureValues.featureGroupId
      })
      .from(productFeatures)
      .innerJoin(featureValues, eq(productFeatures.featureValueId, featureValues.id))
      .where(eq(productFeatures.productId, candidate.product.id));

    const candidateFeaturesByGroup = new Map<string, string>();
    candidateFeatures.forEach((pf) => {
      candidateFeaturesByGroup.set(pf.featureGroupId, pf.featureValueId);
    });

    // Calculate weighted similarity score
    let totalScore = 0;
    let maxPossibleScore = 0;
    const featureMatches: Array<{ groupName: string; weight: number; matched: boolean }> = [];
    let priceMatch: { weight: number; score: number; priceDiff: number } | undefined;

    for (const weight of weights) {
      if (weight.weightType === 'price') {
        // Price proximity scoring
        const priceDiff = Math.abs(candidatePrice - sourcePrice);
        const priceRange = sourcePrice * 0.5; // 50% price range
        const priceScore = Math.max(0, (priceRange - priceDiff) / priceRange) * weight.weight;

        totalScore += priceScore;
        maxPossibleScore += weight.weight;

        priceMatch = {
          weight: weight.weight,
          score: priceScore,
          priceDiff: priceDiff
        };
      } else if (weight.featureGroupId && weight.featureGroup) {
        // Feature group matching
        const sourceValue = sourceFeaturesByGroup.get(weight.featureGroupId);
        const candidateValue = candidateFeaturesByGroup.get(weight.featureGroupId);
        const matched = sourceValue && candidateValue && sourceValue === candidateValue;

        if (matched) {
          totalScore += weight.weight;
        }
        maxPossibleScore += weight.weight;

        featureMatches.push({
          groupName: weight.featureGroup.name,
          weight: weight.weight,
          matched: !!matched
        });
      }
    }

    // Calculate percentage similarity (0-100)
    const similarityScore = maxPossibleScore > 0
      ? Math.round((totalScore / maxPossibleScore) * 100)
      : 0;

    // Only include products with minimum 30% similarity
    if (similarityScore >= 30) {
      scoredProducts.push({
        id: candidate.product.id,
        name: candidate.product.name,
        slug: candidate.product.slug,
        sku: candidate.product.sku,
        image: candidate.product.image,
        price: candidatePrice,
        compareAtPrice: candidate.product.compareAtPrice
          ? parseFloat(candidate.product.compareAtPrice)
          : null,
        similarityScore,
        matchDetails: {
          sameCategory: true,
          featureMatches,
          priceMatch
        }
      });
    }
  }

  return scoredProducts;
}

/**
 * Deduplicate products and merge scores from different algorithms
 */
function deduplicateAndMerge(products: SimilarProduct[]): SimilarProduct[] {
  const productMap = new Map<string, SimilarProduct>();

  for (const product of products) {
    const existing = productMap.get(product.id);
    if (existing) {
      // Merge scores - take higher score
      if (product.similarityScore > existing.similarityScore) {
        productMap.set(product.id, product);
      }
    } else {
      productMap.set(product.id, product);
    }
  }

  return Array.from(productMap.values());
}
