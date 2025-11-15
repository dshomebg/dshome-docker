// Blog related types

// Enums
export type BlogCategoryStatus = 'active' | 'inactive';
export type BlogAuthorStatus = 'active' | 'inactive';
export type BlogPostStatus = 'draft' | 'published' | 'archived';

// Blog Category types
export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  parentId: string | null;
  position: number;
  status: BlogCategoryStatus;
  metaTitle: string | null;
  metaDescription: string | null;
  canonicalUrl: string | null;
  robotsIndex: boolean;
  robotsFollow: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BlogCategoryWithChildren extends BlogCategory {
  children?: BlogCategory[];
  postsCount?: number;
}

export interface CreateBlogCategoryRequest {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  position?: number;
  status?: BlogCategoryStatus;
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  robotsIndex?: boolean;
  robotsFollow?: boolean;
}

export interface UpdateBlogCategoryRequest extends Partial<CreateBlogCategoryRequest> {
  id: string;
}

// Blog Author types
export interface BlogAuthor {
  id: string;
  name: string;
  slug: string;
  bio: string | null;
  image: string | null;
  facebookLink: string | null;
  instagramLink: string | null;
  youtubeLink: string | null;
  linkedinLink: string | null;
  websiteLink: string | null;
  status: BlogAuthorStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface BlogAuthorWithStats extends BlogAuthor {
  postsCount?: number;
  totalViews?: number;
}

export interface CreateBlogAuthorRequest {
  name: string;
  slug: string;
  bio?: string;
  image?: string;
  facebookLink?: string;
  instagramLink?: string;
  youtubeLink?: string;
  linkedinLink?: string;
  websiteLink?: string;
  status?: BlogAuthorStatus;
}

export interface UpdateBlogAuthorRequest extends Partial<CreateBlogAuthorRequest> {
  id: string;
}

// Blog Post types
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featuredImage: string | null;
  categoryId: string | null;
  authorId: string | null;
  status: BlogPostStatus;
  publishedAt: Date | null;
  viewsCount: number;
  metaTitle: string | null;
  metaDescription: string | null;
  canonicalUrl: string | null;
  robotsIndex: boolean;
  robotsFollow: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BlogPostWithRelations extends BlogPost {
  category?: BlogCategory | null;
  author?: BlogAuthor | null;
}

export interface CreateBlogPostRequest {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featuredImage?: string;
  categoryId?: string;
  authorId?: string;
  status?: BlogPostStatus;
  publishedAt?: Date | string;
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  robotsIndex?: boolean;
  robotsFollow?: boolean;
}

export interface UpdateBlogPostRequest extends Partial<CreateBlogPostRequest> {
  id: string;
}

// Blog Post View types
export interface BlogPostView {
  id: string;
  postId: string;
  ipAddress: string | null;
  userAgent: string | null;
  viewedAt: Date;
}

export interface CreateBlogPostViewRequest {
  postId: string;
  ipAddress?: string;
  userAgent?: string;
}

// Filter types
export interface BlogCategoryFilters {
  status?: BlogCategoryStatus;
  parentId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface BlogAuthorFilters {
  status?: BlogAuthorStatus;
  search?: string;
  page?: number;
  limit?: number;
}

export interface BlogPostFilters {
  status?: BlogPostStatus;
  categoryId?: string;
  authorId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// Statistics types
export interface BlogStatistics {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  totalCategories: number;
  totalAuthors: number;
  totalViews: number;
  popularPosts: Array<{
    post: BlogPostWithRelations;
    viewsCount: number;
  }>;
  recentPosts: BlogPostWithRelations[];
}

export interface BlogCategoryStatistics {
  category: BlogCategory;
  postsCount: number;
  totalViews: number;
}

export interface BlogAuthorStatistics {
  author: BlogAuthor;
  postsCount: number;
  totalViews: number;
}
