
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

