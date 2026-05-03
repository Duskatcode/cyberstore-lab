export type OrderStatus = 'pending' | 'paid' | 'payment_failed' | 'cancelled' | 'refunded';

export type Order = {
  id: string;
  customerId: string;
  status: OrderStatus;
  totalCents: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
};
