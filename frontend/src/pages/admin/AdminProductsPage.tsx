import { useEffect, useState } from 'react';
import {
  approveAdminProduct,
  disableAdminProduct,
  getAdminProducts,
  rejectAdminProduct,
} from '../../services/admin-products.service';
import type { Product } from '../../types/product.types';

function formatMoney(value: number, currency: string) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value / 100);
}

export function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [showPendingOnly, setShowPendingOnly] = useState(false);

  async function loadProducts() {
    try {
      const data = await getAdminProducts();
      setProducts(data);
    } catch {
      setMessage('No se pudieron cargar productos admin.');
    }
  }

  useEffect(() => {
    void loadProducts();
  }, []);

  async function handleAction(
    action: 'approve' | 'reject' | 'disable',
    productId: string,
  ) {
    try {
      if (action === 'approve') {
        await approveAdminProduct(productId, 'Approved from admin UI');
      }

      if (action === 'reject') {
        await rejectAdminProduct(productId, 'Rejected from admin UI');
      }

      if (action === 'disable') {
        await disableAdminProduct(productId, 'Disabled from admin UI');
      }

      setMessage('Acción aplicada.');
      await loadProducts();
    } catch {
      setMessage('No se pudo aplicar la acción.');
    }
  }

  const visibleProducts = showPendingOnly
    ? products.filter((product) => product.status === 'pending_review')
    : products;

  return (
    <main className="min-h-screen p-8">
      <section className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold">Moderación de productos</h1>
        <p className="mt-2 text-slate-600">
          Aprueba, rechaza o desactiva productos creados por sellers.
        </p>

        {message && (
          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
            {message}
          </div>
        )}

        <div className="mt-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Productos</h2>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showPendingOnly}
              onChange={(event) => setShowPendingOnly(event.target.checked)}
            />
            Solo pending_review
          </label>
        </div>

        <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="p-4">Producto</th>
                <th className="p-4">Estado</th>
                <th className="p-4">Precio</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {visibleProducts.map((product) => (
                <tr key={product.id} className="border-t border-slate-200">
                  <td className="p-4">
                    <div className="font-semibold">{product.name}</div>
                    <div className="text-xs text-slate-500">{product.slug}</div>
                  </td>

                  <td className="p-4">{product.status}</td>
                  <td className="p-4">{formatMoney(product.priceCents, product.currency)}</td>
                  <td className="p-4">{product.stock}</td>

                  <td className="p-4">
                    <div className="flex flex-wrap gap-2">
                      <button
                        className="rounded bg-green-700 px-3 py-1 text-white"
                        onClick={() => void handleAction('approve', product.id)}
                      >
                        Aprobar
                      </button>

                      <button
                        className="rounded bg-yellow-700 px-3 py-1 text-white"
                        onClick={() => void handleAction('reject', product.id)}
                      >
                        Rechazar
                      </button>

                      <button
                        className="rounded bg-red-700 px-3 py-1 text-white"
                        onClick={() => void handleAction('disable', product.id)}
                      >
                        Desactivar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
