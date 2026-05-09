import { api } from './api.service';
import type { Product, ProductStatus, ProductType } from '../types/product.types';

export type SellerProductPayload = {
  name: string;
  slug: string;
  description?: string;
  type: ProductType;
  categoryId: string;
  priceCents: number;
  currency?: string;
  stock: number;
  imageUrl?: string;
};

export type SellerProductUpdatePayload = Partial<SellerProductPayload> & {
  status?: ProductStatus;
};

export async function getSellerProducts(): Promise<Product[]> {
  const response = await api.get<Product[]>('/seller/products');
  return response.data;
}

export async function createSellerProduct(payload: SellerProductPayload): Promise<Product> {
  const response = await api.post<Product>('/seller/products', payload);
  return response.data;
}

export async function updateSellerProduct(
  productId: string,
  payload: SellerProductUpdatePayload,
): Promise<Product> {
  const response = await api.patch<Product>(`/seller/products/${productId}`, payload);
  return response.data;
}

export async function requestSellerProductReview(productId: string): Promise<Product> {
  const response = await api.post<Product>(`/seller/products/${productId}/request-review`);
  return response.data;
}
