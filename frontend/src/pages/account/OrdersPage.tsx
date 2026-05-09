import { useEffect, useState } from 'react';
import { getOrders } from '../../services/checkout.service';
import type { Order } from '../../types/order.types';

function formatMoney(value: number, currency: string) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value / 100);
}

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    getOrders()
      .then(setOrders)
      .catch(() => setMessage('No se pudieron cargar tus pedidos.'));
  }, []);

  return (
    <main className="min-h-screen p-4 md:p-8">
      <section className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold">Mis pedidos</h1>
        <p className="mt-2 text-slate-600">Historial de compras del usuario customer.</p>

        {message && (
          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
            {message}
          </div>
        )}

        {orders.length === 0 ? (
          <p className="mt-8 text-slate-600">Todavía no tienes pedidos.</p>
        ) : (
          <div className="mt-8 space-y-4">
            {orders.map((order) => (
              <article key={order.id} className="rounded-2xl border border-slate-200 p-5">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="font-semibold">Pedido {order.id}</h2>
                    <p className="text-sm text-slate-500">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-bold">
                      {formatMoney(order.totalCents, order.currency)}
                    </p>
                    <p className="text-sm text-slate-600">{order.status}</p>
                  </div>
                </div>

                {order.items && order.items.length > 0 ? (
                  <div className="mt-4 border-t border-slate-200 pt-4">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between py-1 text-sm">
                        <span>
                          {item.productNameSnapshot} x {item.quantity}
                        </span>
                        <span>{formatMoney(item.subtotalCents, order.currency)}</span>
                      </div>
                    ))}
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
