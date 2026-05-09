import { api } from './api.service';
import type { Product } from '../types/product.types';

export async function getAdminProducts(): Promise<Product[]> {
  const response = await api.get<Product[]>('/admin/products');
  return response.data;
}

export async function approveAdminProduct(productId: string, comment?: string): Promise<Product> {
  const response = await api.post<Product>(`/admin/products/${productId}/approve`, {
    comment,
  });
  return response.data;
}

export async function rejectAdminProduct(productId: string, comment?: string): Promise<Product> {
  const response = await api.post<Product>(`/admin/products/${productId}/reject`, {
    comment,
  });
  return response.data;
}

export async function disableAdminProduct(productId: string, comment?: string): Promise<Product> {
  const response = await api.post<Product>(`/admin/products/${productId}/disable`, {
    comment,
  });
  return response.data;
}
