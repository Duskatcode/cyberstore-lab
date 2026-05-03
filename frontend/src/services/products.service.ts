import { api } from './api.service';
import type { Product } from '../types/product.types';

export async function getProducts(): Promise<Product[]> {
  const response = await api.get<Product[]>('/products');
  return response.data;
}

export async function getProductBySlug(slug: string): Promise<Product> {
  const response = await api.get<Product>(`/products/${slug}`);
  return response.data;
}
