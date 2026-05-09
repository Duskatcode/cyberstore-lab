import { api } from './api.service';
import type { UserRole, UserStatus } from '../types/auth.types';

export type AdminUser = {
  id: string;
  email: string;
  name: string;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
  role: {
    id: string;
    name: UserRole;
  };
};

export type CreateAdminUserPayload = {
  email: string;
  name: string;
  password: string;
  role: UserRole;
  status?: UserStatus;
};

export async function getAdminUsers(): Promise<AdminUser[]> {
  const response = await api.get<AdminUser[]>('/admin/users');
  return response.data;
}

export async function getActiveAdminUsers(): Promise<AdminUser[]> {
  const response = await api.get<AdminUser[]>('/admin/users/active');
  return response.data;
}

export async function createAdminUser(payload: CreateAdminUserPayload): Promise<AdminUser> {
  const response = await api.post<AdminUser>('/admin/users', payload);
  return response.data;
}

export async function updateAdminUserRole(userId: string, role: UserRole): Promise<AdminUser> {
  const response = await api.patch<AdminUser>(`/admin/users/${userId}/role`, { role });
  return response.data;
}

export async function updateAdminUserStatus(
  userId: string,
  status: UserStatus,
): Promise<AdminUser> {
  const response = await api.patch<AdminUser>(`/admin/users/${userId}/status`, { status });
  return response.data;
}
