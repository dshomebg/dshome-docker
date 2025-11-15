import { apiClient } from "../api";

export interface Wishlist {
  id: string;
  customerId: string | null;
  sessionId: string | null;
  productId: string;
  combinationId: string | null;
  createdAt: string;
  updatedAt: string;
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

export interface WishlistResponse {
  success: boolean;
  data: WishlistWithDetails[];
}

export interface AdminWishlistsResponse {
  data: AdminWishlistItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PopularProductsResponse {
  success: boolean;
  data: PopularWishlistProduct[];
}

export interface AddToWishlistData {
  customerId?: string;
  sessionId?: string;
  productId: string;
  combinationId?: string;
}

export interface ClearWishlistData {
  customerId?: string;
  sessionId?: string;
}

export interface MergeWishlistData {
  customerId: string;
  sessionId: string;
}

export interface WishlistCountResponse {
  success: boolean;
  data: {
    count: number;
  };
}

export interface MergeWishlistResponse {
  success: boolean;
  message: string;
  data: {
    mergedCount: number;
  };
}

export const wishlistsService = {
  // Public: Get wishlist for customer or guest session
  getWishlist: async (params: {
    customerId?: string;
    sessionId?: string;
  }): Promise<WishlistResponse> => {
    const response = await apiClient.get('/wishlists', { params });
    return response.data;
  },

  // Public: Get wishlist item count
  getWishlistCount: async (params: {
    customerId?: string;
    sessionId?: string;
  }): Promise<WishlistCountResponse> => {
    const response = await apiClient.get('/wishlists/count', { params });
    return response.data;
  },

  // Public: Add item to wishlist
  addToWishlist: async (data: AddToWishlistData): Promise<{ success: boolean; data: Wishlist; message: string }> => {
    const response = await apiClient.post('/wishlists', data);
    return response.data;
  },

  // Public: Remove item from wishlist
  removeFromWishlist: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete(`/wishlists/${id}`);
    return response.data;
  },

  // Public: Clear entire wishlist
  clearWishlist: async (data: ClearWishlistData): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete('/wishlists/clear', { data });
    return response.data;
  },

  // Public: Merge guest wishlist to customer wishlist (on login)
  mergeWishlist: async (data: MergeWishlistData): Promise<MergeWishlistResponse> => {
    const response = await apiClient.post('/wishlists/merge', data);
    return response.data;
  },

  // Admin: Get all wishlists with filtering
  getAllWishlists: async (params?: {
    page?: number;
    limit?: number;
    customerId?: string;
    productId?: string;
  }): Promise<AdminWishlistsResponse> => {
    const response = await apiClient.get('/wishlists/admin/all', { params });
    return response.data;
  },

  // Admin: Get popular wishlist products
  getPopularWishlistProducts: async (limit?: number): Promise<PopularProductsResponse> => {
    const response = await apiClient.get('/wishlists/admin/popular', {
      params: { limit }
    });
    return response.data;
  },
};
