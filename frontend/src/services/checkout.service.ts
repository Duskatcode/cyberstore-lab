import { api } from './api.service';
import type { Order } from '../types/order.types';

export async function checkout(paymentSuccess = true): Promise<Order> {
  const response = await api.post<Order>('/checkout', {
    paymentSuccess,
    paymentReference: paymentSuccess ? 'frontend-simulated-success' : 'frontend-simulated-failure',
  });

  return response.data;
}

export async function getOrders(): Promise<Order[]> {
  const response = await api.get<Order[]>('/orders');
  return response.data;
}
