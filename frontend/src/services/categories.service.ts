import { api } from './api.service';
import type { Category } from '../types/product.types';

export async function getCategories(): Promise<Category[]> {
  const response = await api.get<Category[]>('/categories');
  return response.data;
}
