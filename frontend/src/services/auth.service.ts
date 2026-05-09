import { api } from './api.service';
import type { LoginResponse } from '../types/auth.types';

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  email: string;
  name: string;
  password: string;
};

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>('/auth/login', payload);
  return response.data;
}

export async function register(payload: RegisterPayload): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>('/auth/register', payload);
  return response.data;
}

export async function logout(refreshToken: string) {
  const response = await api.post('/auth/logout', { refreshToken });
  return response.data;
}

export async function getMe() {
  const response = await api.get('/auth/me');
  return response.data;
}
