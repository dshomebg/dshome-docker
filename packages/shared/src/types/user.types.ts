// User related types

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  STAFF = 'staff'
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended'
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}
