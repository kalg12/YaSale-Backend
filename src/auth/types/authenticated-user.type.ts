import { UserRole } from '../../entities/user.entity';

export type AuthenticatedUser = {
  sub: string; // userId
  tenantId: string;
  role: UserRole;
  storeIds: string[];
  activeStoreId?: string;
  iat?: number;
  exp?: number;
};

export class UserProfileResponse {
  id: string;
  tenantId: string;
  name: string;
  pin: string; // Note: In production, never expose PINs
  role: UserRole;
  isActive: boolean;
  activeStoreId?: string;
  stores: Array<{
    storeId: string;
  }>;
}
