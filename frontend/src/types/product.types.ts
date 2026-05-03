export type ProductType = 'physical' | 'digital';
export type ProductStatus =
  | 'draft'
  | 'pending_review'
  | 'active'
  | 'inactive'
  | 'rejected'
  | 'out_of_stock'
  | 'deleted';

export type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
};

export type Product = {
  id: string;
  sellerId: string;
  categoryId: string;
  name: string;
  slug: string;
  description?: string | null;
  type: ProductType;
  status: ProductStatus;
  priceCents: number;
  currency: string;
  stock: number;
  imageUrl?: string | null;
  category?: Category;
};
