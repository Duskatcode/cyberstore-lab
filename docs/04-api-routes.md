
---

# Products

## Público

```txt
GET /api/v1/products
GET /api/v1/products/:slug

---

# Cart

## Base

Requiere Bearer token.

```txt
GET    /api/v1/cart
POST   /api/v1/cart/items
PATCH  /api/v1/cart/items/:productId
DELETE /api/v1/cart/items/:productId
DELETE /api/v1/cart

---

# Cart

## Base

Requiere Bearer token.

```txt
GET    /api/v1/cart
POST   /api/v1/cart/items
PATCH  /api/v1/cart/items/:productId
DELETE /api/v1/cart/items/:productId
DELETE /api/v1/cart
Decisiones
- El carrito vive en Redis, no en PostgreSQL.
- La clave del carrito usa el formato cart:user:{userId}.
- El TTL inicial es 24 horas.
- Agregar al carrito no reserva stock.
- El stock se valida al agregar o actualizar cantidad.
- El descuento real de stock ocurre después en checkout, no aquí.
Validación Redis
podman compose exec redis redis-cli TTL "cart:user:{userId}"


---

# Checkout / Orders

## Customer

Requiere Bearer token con rol `customer`.

```txt
POST /api/v1/checkout
GET  /api/v1/orders
GET  /api/v1/orders/:id
eof

---

# Checkout / Orders

## Customer

Requiere Bearer token con rol `customer`.

```txt
POST /api/v1/checkout
GET  /api/v1/orders
GET  /api/v1/orders/:id
Decisiones
- El checkout lee el carrito desde Redis.
- El pedido inicia como pending.
- Si paymentSuccess=false, el pedido pasa a payment_failed y no descuenta stock.
- Si paymentSuccess=true, el pedido pasa a paid.
- El stock se descuenta dentro de una transacción.
- Los order_items guardan snapshot del producto comprado.
- El historial se guarda en order_status_history.
- Los movimientos de stock se guardan en stock_movements.
- El carrito se elimina de Redis solo si el pedido queda paid.
Validaciones
podman compose exec redis redis-cli EXISTS "cart:user:{userId}"
podman compose exec postgres psql -U cyberstore -d cyberstore_db -c "SELECT status FROM orders ORDER BY created_at DESC LIMIT 5;"
podman compose exec postgres psql -U cyberstore -d cyberstore_db -c "SELECT product_name_snapshot, quantity FROM order_items ORDER BY created_at DESC LIMIT 5;"
podman compose exec postgres psql -U cyberstore -d cyberstore_db -c "SELECT type, quantity, reason FROM stock_movements ORDER BY created_at DESC LIMIT 5;"

