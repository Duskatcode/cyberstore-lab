import { useEffect, useState } from 'react';
import { checkout } from '../../services/checkout.service';
import { clearCart, getCart, removeCartItem, updateCartItem } from '../../services/cart.service';
import type { Cart } from '../../types/cart.types';

function formatMoney(value: number, currency: string) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value / 100);
}

export function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function loadCart() {
    try {
      const data = await getCart();
      setCart(data);
    } catch {
      setMessage('Debes iniciar sesión para ver el carrito.');
    }
  }

  useEffect(() => {
    loadCart();
  }, []);

  async function handleQuantity(productId: string, quantity: number) {
    if (quantity < 1) return;

    const updated = await updateCartItem(productId, quantity);
    setCart(updated);
  }

  async function handleRemove(productId: string) {
    const updated = await removeCartItem(productId);
    setCart(updated);
  }

  async function handleClear() {
    await clearCart();
    await loadCart();
  }

  async function handleCheckout() {
    try {
      const order = await checkout(true);
      setMessage(`Pedido creado: ${order.id}`);
      await loadCart();
    } catch {
      setMessage('No se pudo completar el checkout.');
    }
  }

  return (
    <main className="min-h-screen p-8">
      <section className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold">Carrito</h1>

        {message && (
          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
            {message}
          </div>
        )}

        {!cart || cart.items.length === 0 ? (
          <p className="mt-8 text-slate-600">El carrito está vacío.</p>
        ) : (
          <div className="mt-8 space-y-4">
            {cart.items.map((item) => (
              <article
                key={item.productId}
                className="flex flex-col gap-4 rounded-2xl border border-slate-200 p-5 shadow-sm md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <h2 className="font-semibold">{item.product.name}</h2>
                  <p className="text-sm text-slate-600">
                    {formatMoney(item.product.priceCents, item.product.currency)}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    className="rounded border px-3 py-1"
                    onClick={() => handleQuantity(item.productId, item.quantity - 1)}
                  >
                    -
                  </button>

                  <span>{item.quantity}</span>

                  <button
                    className="rounded border px-3 py-1"
                    onClick={() => handleQuantity(item.productId, item.quantity + 1)}
                  >
                    +
                  </button>

                  <button
                    className="rounded border border-red-300 px-3 py-1 text-red-600"
                    onClick={() => handleRemove(item.productId)}
                  >
                    Quitar
                  </button>
                </div>
              </article>
            ))}

            <div className="rounded-2xl border border-slate-200 p-5">
              <p className="text-xl font-bold">
                Total: {formatMoney(cart.totalCents, cart.currency)}
              </p>

              <div className="mt-4 flex gap-3">
                <button
                  className="rounded-lg bg-slate-900 px-4 py-2 font-semibold text-white"
                  onClick={handleCheckout}
                >
                  Checkout simulado
                </button>

                <button
                  className="rounded-lg border border-slate-300 px-4 py-2"
                  onClick={handleClear}
                >
                  Vaciar carrito
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
