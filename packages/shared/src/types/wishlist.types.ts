// Wishlist related types

export interface Wishlist {
  id: string;
  customerId: string | null;
  sessionId: string | null;
  productId: string;
  combinationId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface WishlistItem extends Wishlist {
  product?: {
    id: string;
    name: string;
    slug: string;
    sku: string;
    description: string | null;
    status: string;
  };
}

export interface WishlistWithDetails {
  wishlist: Wishlist;
  product: {
    id: string;
    name: string;
    slug: string;
    sku: string;
    description: string | null;
    status: string;
  } | null;
}

export interface AddToWishlistRequest {
  customerId?: string;
  sessionId?: string;
  productId: string;
  combinationId?: string;
}

export interface RemoveFromWishlistRequest {
  id: string;
}

export interface ClearWishlistRequest {
  customerId?: string;
  sessionId?: string;
}

export interface MergeWishlistRequest {
  customerId: string;
  sessionId: string;
}

export interface WishlistCountResponse {
  count: number;
}

export interface MergeWishlistResponse {
  mergedCount: number;
}

// Admin types
export interface AdminWishlistItem {
  wishlist: Wishlist;
  product: {
    id: string;
    name: string;
    slug: string;
    sku: string;
  } | null;
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
}

export interface PopularWishlistProduct {
  productId: string;
  wishlistCount: number;
  product: {
    id: string;
    name: string;
    slug: string;
    sku: string;
  } | null;
}

export interface WishlistFilters {
  customerId?: string;
  productId?: string;
  page?: number;
  limit?: number;
}
