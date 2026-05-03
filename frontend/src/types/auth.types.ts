export type UserRole = 'admin' | 'seller' | 'customer';

export type UserStatus = 'active' | 'blocked' | 'suspended' | 'pending_verification';

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
};

export type LoginResponse = {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
};
