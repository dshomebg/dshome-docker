// Warehouse related types

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  status: WarehouseStatus;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum WarehouseStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive'
}

export interface WarehouseInventorySummary {
  warehouseId: string;
  warehouseName: string;
  totalProducts: number;
  totalQuantity: number;
  totalValue: number;
}
