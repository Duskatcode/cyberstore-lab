import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import {
  getSellerProducts,
  requestSellerProductReview,
} from '../../services/seller-products.service';
import { useAuthStore } from '../../stores/auth.store';
import type { Product } from '../../types/product.types';

function formatMoney(value: number, currency: string) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value / 100);
}

export function SellerProductsPage() {
  const user = useAuthStore((state) => state.user);
  const [products, setProducts] = useState<Product[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadProducts() {
    setLoading(true);
    setMessage(null);

    try {
      const data = await getSellerProducts();
      setProducts(data);
    } catch {
      setMessage('No se pudieron cargar tus productos. Verifica que estés logueado como seller.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadProducts();
  }, []);

  async function handleRequestReview(productId: string) {
    try {
      await requestSellerProductReview(productId);
      setMessage('Producto enviado a revisión.');
      await loadProducts();
    } catch {
      setMessage('No se pudo enviar el producto a revisión.');
    }
  }

  if (!user) {
    return (
      <main className="min-h-screen p-4 md:p-8">
        <section className="mx-auto max-w-5xl">
          <h1 className="text-3xl font-bold">Seller Products</h1>
          <p className="mt-4 text-slate-600">Debes iniciar sesión como seller.</p>
          <Link className="mt-4 inline-block rounded-lg bg-slate-900 px-4 py-2 text-white" to="/login">
            Ir a login
          </Link>
        </section>
      </main>
    );
  }

  if (user.role !== 'seller') {
    return (
      <main className="min-h-screen p-4 md:p-8">
        <section className="mx-auto max-w-5xl">
          <h1 className="text-3xl font-bold">Acceso denegado</h1>
          <p className="mt-4 text-slate-600">Esta sección requiere rol seller.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-4 md:p-8">
      <section className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Mis productos</h1>
            <p className="mt-2 text-slate-600">
              Crea productos, edítalos y envíalos a revisión para que admin los apruebe.
            </p>
          </div>

          <Link
            to="/seller/products/new"
            className="rounded-lg bg-slate-900 px-4 py-2 text-center font-semibold text-white"
          >
            Crear producto
          </Link>
        </div>

        {message && (
          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
            {message}
          </div>
        )}

        {loading ? (
          <p className="mt-8 text-slate-600">Cargando productos...</p>
        ) : products.length === 0 ? (
          <p className="mt-8 text-slate-600">Todavía no tienes productos.</p>
        ) : (
          <div className="mt-8 overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full min-w-[720px] border-collapse text-left text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="p-4">Producto</th>
                  <th className="p-4">Estado</th>
                  <th className="p-4">Tipo</th>
                  <th className="p-4">Precio</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-t border-slate-200">
                    <td className="p-4">
                      <div className="font-semibold">{product.name}</div>
                      <div className="text-xs text-slate-500">{product.slug}</div>
                    </td>

                    <td className="p-4">{product.status}</td>
                    <td className="p-4">{product.type}</td>
                    <td className="p-4">{formatMoney(product.priceCents, product.currency)}</td>
                    <td className="p-4">{product.stock}</td>

                    <td className="p-4">
                      <div className="flex flex-wrap gap-2">
                        <Link
                          to={`/seller/products/${product.id}/edit`}
                          className="rounded border border-slate-300 px-3 py-1"
                        >
                          Editar
                        </Link>

                        {product.status === 'draft' || product.status === 'rejected' ? (
                          <button
                            className="rounded bg-slate-900 px-3 py-1 text-white"
                            onClick={() => void handleRequestReview(product.id)}
                          >
                            Enviar a revisión
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
