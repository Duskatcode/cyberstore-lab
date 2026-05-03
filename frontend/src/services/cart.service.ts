import { api } from './api.service';
import type { Cart } from '../types/cart.types';

export async function getCart(): Promise<Cart> {
  const response = await api.get<Cart>('/cart');
  return response.data;
}

export async function addCartItem(productId: string, quantity: number): Promise<Cart> {
  const response = await api.post<Cart>('/cart/items', { productId, quantity });
  return response.data;
}

export async function updateCartItem(productId: string, quantity: number): Promise<Cart> {
  const response = await api.patch<Cart>(`/cart/items/${productId}`, { quantity });
  return response.data;
}

export async function removeCartItem(productId: string): Promise<Cart> {
  const response = await api.delete<Cart>(`/cart/items/${productId}`);
  return response.data;
}

export async function clearCart() {
  const response = await api.delete('/cart');
  return response.data;
}
