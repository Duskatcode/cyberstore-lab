import { useEffect, useState } from 'react';
import { addCartItem } from '../../services/cart.service';
import { getProducts } from '../../services/products.service';
import { useAuthStore } from '../../stores/auth.store';
import type { Product } from '../../types/product.types';

function formatMoney(value: number, currency: string) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value / 100);
}

export function ProductsPage() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const [products, setProducts] = useState<Product[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch(() => setMessage('No se pudieron cargar productos.'));
  }, []);

  async function handleAddToCart(productId: string) {
    if (!accessToken) {
      setMessage('Debes iniciar sesión para agregar al carrito.');
      return;
    }

    try {
      await addCartItem(productId, 1);
      setMessage('Producto agregado al carrito.');
    } catch {
      setMessage('No se pudo agregar el producto.');
    }
  }

  return (
    <main className="min-h-screen p-8">
      <section className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold">Productos</h1>
        <p className="mt-2 text-slate-600">Catálogo público cargado desde el backend.</p>

        {message && (
          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
            {message}
          </div>
        )}

        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <article key={product.id} className="rounded-2xl border border-slate-200 p-5 shadow-sm">
              <p className="text-xs uppercase tracking-widest text-slate-500">
                {product.category?.name ?? product.type}
              </p>

              <h2 className="mt-2 text-xl font-semibold">{product.name}</h2>

              <p className="mt-2 min-h-12 text-sm text-slate-600">
                {product.description}
              </p>

              <div className="mt-4 flex items-center justify-between">
                <span className="font-bold">
                  {formatMoney(product.priceCents, product.currency)}
                </span>

                <span className="text-sm text-slate-500">Stock: {product.stock}</span>
              </div>

              <button
                className="mt-4 w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                onClick={() => handleAddToCart(product.id)}
              >
                Agregar al carrito
              </button>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
