// Category related types

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parentId: string | null;
  imageUrl: string | null;
  position: number;
  status: CategoryStatus;
  createdAt: Date;
  updatedAt: Date;
}

export enum CategoryStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive'
}

export interface CategoryWithChildren extends Category {
  children: Category[];
  productCount: number;
}
