export type CartItem = {
  productId: string;
  quantity: number;
  addedAt: string;
  updatedAt: string;
};

export type Cart = {
  userId: string;
  items: CartItem[];
  updatedAt: string;
};

export type CartViewItem = CartItem & {
  product: {
    id: string;
    name: string;
    slug: string;
    priceCents: number;
    currency: string;
    stock: number;
    imageUrl: string | null;
  };
  subtotalCents: number;
};

export type CartView = {
  userId: string;
  items: CartViewItem[];
  totalCents: number;
  currency: string;
  ttlSeconds: number;
};
