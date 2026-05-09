export type OrderStatus = 'pending' | 'paid' | 'payment_failed' | 'cancelled' | 'refunded';

export type OrderItem = {
  id: string;
  orderId: string;
  productId: string;
  sellerId: string;
  productNameSnapshot: string;
  productSlugSnapshot: string;
  productTypeSnapshot: 'physical' | 'digital';
  productImageSnapshot?: string | null;
  unitPriceCents: number;
  quantity: number;
  subtotalCents: number;
  createdAt: string;
};

export type OrderStatusHistory = {
  id: string;
  orderId: string;
  status: OrderStatus;
  comment?: string | null;
  createdAt: string;
};

export type Order = {
  id: string;
  customerId: string;
  status: OrderStatus;
  totalCents: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
  statusHistory?: OrderStatusHistory[];
};
