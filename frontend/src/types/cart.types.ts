import type { Product } from './product.types';

export type CartItem = {
  productId: string;
  quantity: number;
  addedAt: string;
  updatedAt: string;
  product: Pick<Product, 'id' | 'name' | 'slug' | 'priceCents' | 'currency' | 'stock' | 'imageUrl'>;
  subtotalCents: number;
};

export type Cart = {
  userId: string;
  items: CartItem[];
  totalCents: number;
  currency: string;
  ttlSeconds: number;
};
