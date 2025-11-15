import { apiClient } from "../api";
import {
  BlogCategory,
  BlogAuthor,
  BlogPost,
  BlogPostWithRelations,
  BlogCategoryFilters,
  BlogAuthorFilters,
  BlogPostFilters,
  CreateBlogCategoryRequest,
  UpdateBlogCategoryRequest,
  CreateBlogAuthorRequest,
  UpdateBlogAuthorRequest,
  CreateBlogPostRequest,
  UpdateBlogPostRequest,
  BlogStatistics
} from "@dshome/shared";

// Response interfaces
export interface BlogCategoriesResponse {
  success: boolean;
  data: BlogCategory[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface BlogCategoryResponse {
  success: boolean;
  data: BlogCategory;
}

export interface BlogCategoryTreeResponse {
  success: boolean;
  data: any[]; // Tree structure
}

export interface BlogAuthorsResponse {
  success: boolean;
  data: BlogAuthor[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface BlogAuthorResponse {
  success: boolean;
  data: BlogAuthor;
}

export interface BlogPostsResponse {
  success: boolean;
  data: Array<{
    post: BlogPost;
    category: BlogCategory | null;
    author: BlogAuthor | null;
  }>;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface BlogPostResponse {
  success: boolean;
  data: {
    post: BlogPost;
    category: BlogCategory | null;
    author: BlogAuthor | null;
  };
}

export interface BlogStatisticsResponse {
  success: boolean;
  data: BlogStatistics;
}

export const blogService = {
  // ==================== CATEGORIES ====================

  // Get all categories with filters
  getCategories: async (params?: BlogCategoryFilters): Promise<BlogCategoriesResponse> => {
    const response = await apiClient.get('/blog/categories', { params });
    return response.data;
  },

  // Get category tree
  getCategoryTree: async (): Promise<BlogCategoryTreeResponse> => {
    const response = await apiClient.get('/blog/categories/tree');
    return response.data;
  },

  // Get category by ID
  getCategoryById: async (id: string): Promise<BlogCategoryResponse> => {
    const response = await apiClient.get(`/blog/categories/id/${id}`);
    return response.data;
  },

  // Get category by slug
  getCategoryBySlug: async (slug: string): Promise<BlogCategoryResponse> => {
    const response = await apiClient.get(`/blog/categories/slug/${slug}`);
    return response.data;
  },

  // Create category
  createCategory: async (data: CreateBlogCategoryRequest): Promise<BlogCategoryResponse> => {
    const response = await apiClient.post('/blog/categories', data);
    return response.data;
  },

  // Update category
  updateCategory: async (id: string, data: Partial<UpdateBlogCategoryRequest>): Promise<BlogCategoryResponse> => {
    const response = await apiClient.put(`/blog/categories/${id}`, data);
    return response.data;
  },

  // Delete category
  deleteCategory: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete(`/blog/categories/${id}`);
    return response.data;
  },

  // ==================== AUTHORS ====================

  // Get all authors with filters
  getAuthors: async (params?: BlogAuthorFilters): Promise<BlogAuthorsResponse> => {
    const response = await apiClient.get('/blog/authors', { params });
    return response.data;
  },

  // Get authors with statistics
  getAuthorsWithStats: async (limit?: number): Promise<{
    success: boolean;
    data: Array<{
      author: BlogAuthor;
      postsCount: number;
      totalViews: number;
    }>;
  }> => {
    const response = await apiClient.get('/blog/authors/stats', { params: { limit } });
    return response.data;
  },

  // Get author by ID
  getAuthorById: async (id: string): Promise<BlogAuthorResponse> => {
    const response = await apiClient.get(`/blog/authors/id/${id}`);
    return response.data;
  },

  // Get author by slug
  getAuthorBySlug: async (slug: string): Promise<BlogAuthorResponse> => {
    const response = await apiClient.get(`/blog/authors/slug/${slug}`);
    return response.data;
  },

  // Create author
  createAuthor: async (data: CreateBlogAuthorRequest): Promise<BlogAuthorResponse> => {
    const response = await apiClient.post('/blog/authors', data);
    return response.data;
  },

  // Update author
  updateAuthor: async (id: string, data: Partial<UpdateBlogAuthorRequest>): Promise<BlogAuthorResponse> => {
    const response = await apiClient.put(`/blog/authors/${id}`, data);
    return response.data;
  },

  // Delete author
  deleteAuthor: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete(`/blog/authors/${id}`);
    return response.data;
  },

  // ==================== POSTS ====================

  // Get all posts with filters
  getPosts: async (params?: BlogPostFilters): Promise<BlogPostsResponse> => {
    const response = await apiClient.get('/blog/posts', { params });
    return response.data;
  },

  // Get post by ID
  getPostById: async (id: string): Promise<BlogPostResponse> => {
    const response = await apiClient.get(`/blog/posts/id/${id}`);
    return response.data;
  },

  // Get post by slug
  getPostBySlug: async (slug: string): Promise<BlogPostResponse> => {
    const response = await apiClient.get(`/blog/posts/slug/${slug}`);
    return response.data;
  },

  // Create post
  createPost: async (data: CreateBlogPostRequest): Promise<BlogPostResponse> => {
    const response = await apiClient.post('/blog/posts', data);
    return response.data;
  },

  // Update post
  updatePost: async (id: string, data: Partial<UpdateBlogPostRequest>): Promise<BlogPostResponse> => {
    const response = await apiClient.put(`/blog/posts/${id}`, data);
    return response.data;
  },

  // Delete post
  deletePost: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete(`/blog/posts/${id}`);
    return response.data;
  },

  // Track post view
  trackPostView: async (postId: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post(`/blog/posts/${postId}/view`);
    return response.data;
  },

  // ==================== STATISTICS ====================

  // Get blog statistics
  getStatistics: async (): Promise<BlogStatisticsResponse> => {
    const response = await apiClient.get('/blog/statistics');
    return response.data;
  },
};
