import { apiClient } from "../api";

export interface Review {
  id: string;
  productId: string;
  customerId?: string;
  rating: number;
  title?: string;
  content: string;
  reviewerName: string;
  reviewerEmail?: string;
  isAnonymous: boolean;
  isVerifiedPurchase: boolean;
  images: string[];
  helpfulCount: number;
  notHelpfulCount: number;
  storeReply?: string;
  storeReplyDate?: string;
  storeRepliedBy?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface ReviewWithProduct {
  review: Review;
  product: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface ReviewsResponse {
  data: Review[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AdminReviewsResponse {
  data: ReviewWithProduct[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ReviewSummary {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<number, number>;
  ratingPercentages: Record<number, number>;
}

export interface CreateReviewData {
  productId: string;
  customerId?: string;
  rating: number;
  title?: string;
  content: string;
  reviewerName: string;
  reviewerEmail?: string;
  isAnonymous?: boolean;
  images?: string[];
}

export interface UpdateReviewData {
  rating?: number;
  title?: string;
  content?: string;
  reviewerName?: string;
  isAnonymous?: boolean;
  isVerifiedPurchase?: boolean;
  images?: string[];
  status?: 'pending' | 'approved' | 'rejected';
}

export interface VoteHelpfulData {
  customerId?: string;
  sessionId?: string;
  isHelpful: boolean;
}

export const reviewsService = {
  // Public: Get reviews for a specific product with filtering
  getProductReviews: async (
    productId: string,
    params?: {
      page?: number;
      limit?: number;
      sort?: 'newest' | 'helpful' | 'highestRated' | 'lowestRated';
      rating?: number;
      verifiedOnly?: boolean;
    }
  ): Promise<ReviewsResponse> => {
    const response = await apiClient.get(`/reviews/product/${productId}`, { params });
    return response.data;
  },

  // Public: Get rating breakdown and summary for a product
  getProductReviewSummary: async (productId: string): Promise<{ data: ReviewSummary }> => {
    const response = await apiClient.get(`/reviews/product/${productId}/summary`);
    return response.data;
  },

  // Public: Create a new review (customer)
  createReview: async (data: CreateReviewData): Promise<{ success: boolean; data: Review; message: string }> => {
    const response = await apiClient.post('/reviews', data);
    return response.data;
  },

  // Public: Vote helpful/not helpful on a review
  voteHelpful: async (id: string, data: VoteHelpfulData): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post(`/reviews/${id}/helpful`, data);
    return response.data;
  },

  // Admin: Get all reviews with filtering
  getAllReviews: async (params?: {
    page?: number;
    limit?: number;
    status?: 'pending' | 'approved' | 'rejected';
    productId?: string;
    rating?: number;
    search?: string;
  }): Promise<AdminReviewsResponse> => {
    const response = await apiClient.get('/reviews/admin/all', { params });
    return response.data;
  },

  // Admin: Update review details
  updateReview: async (id: string, data: UpdateReviewData): Promise<{ success: boolean; data: Review }> => {
    const response = await apiClient.put(`/reviews/${id}`, data);
    return response.data;
  },

  // Admin: Approve review
  approveReview: async (id: string, isVerifiedPurchase?: boolean): Promise<{ success: boolean; data: Review; message: string }> => {
    const response = await apiClient.patch(`/reviews/${id}/approve`, { isVerifiedPurchase });
    return response.data;
  },

  // Admin: Reject review
  rejectReview: async (id: string): Promise<{ success: boolean; data: Review; message: string }> => {
    const response = await apiClient.patch(`/reviews/${id}/reject`);
    return response.data;
  },

  // Admin: Add store reply to review
  addStoreReply: async (id: string, storeReply: string, repliedBy?: string): Promise<{ success: boolean; data: Review; message: string }> => {
    const response = await apiClient.post(`/reviews/${id}/reply`, { storeReply, repliedBy });
    return response.data;
  },

  // Admin: Delete review
  deleteReview: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete(`/reviews/${id}`);
    return response.data;
  },
};
