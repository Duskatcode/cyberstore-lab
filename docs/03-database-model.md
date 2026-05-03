003 — PostgreSQL como base principal

Modelo de Base de Datos — CyberStore Lab
Base de datos elegida
PostgreSQL
Tablas iniciales del MVP
users
roles
products
categories
product_images
product_moderation_events
orders
order_items
order_status_history
order_cancellations
stock_movements
price_history
audit_logs
refresh_tokens
Roles válidos
admin
seller
customer
Estados de usuario
active
blocked
suspended
pending_verification
Estados de producto
draft
pending_review
active
inactive
rejected
out_of_stock
deleted
Tipos de producto
physical
digital
Modelo conceptual
Regla de snapshots en pedidos

order_items debe guardar copia del producto al momento de compra.

Campos mínimos:

product_id
seller_id
product_name_snapshot
product_slug_snapshot
product_type_snapshot
product_image_snapshot
unit_price_snapshot
quantity
subtotal
created_at
Razón

Si el producto cambia después, el pedido debe conservar la información original.

Ejemplo:

Compra original:
Mini PC CoreLab
800.000 COP

Producto modificado después:
Mini PC CoreLab Pro
1.200.000 COP

El pedido no debe cambiar históricamente.

Pendiente para Paso 6

Crear el schema inicial en:

backend/prisma/schema.prisma

Primera migración esperada:

podman compose exec backend npx prisma migrate dev --name init

Decisión

Usar PostgreSQL como base de datos persistente.

Razón

El sistema necesita persistir usuarios, roles, productos, pedidos, auditoría, tokens y estados de negocio.

Por qué Redis no lo reemplaza

Redis es excelente para datos temporales, cache, rate limiting y sesiones, pero no debe ser la fuente principal de verdad para datos críticos.

Estado

Aceptada.
---

# Migración inicial aplicada

## Paso

Paso 6 — Configurar Prisma.

## Modelos iniciales creados

```txt
Role
User
Category
Product
Order
OrderItem
RefreshToken
AuditLog

---

# Migración inicial aplicada

## Paso

Paso 6 — Configurar Prisma.

## Modelos iniciales creados

```txt
Role
User
Category
Product
Order
OrderItem
RefreshToken
AuditLog
Decisiones aplicadas
blocked_user no es rol; blocked es estado.
Los productos usan soft delete mediante deleted_at.
Los pedidos guardan snapshots en order_items.
PostgreSQL es la fuente principal de persistencia.
Redis se mantiene para carrito, tokens, rate limiting y datos temporales.
Comando usado
podman compose exec backend npx prisma migrate dev --name init
Validación
podman compose exec backend npx prisma validate
podman compose exec postgres psql -U cyberstore -d cyberstore_db -c "\dt"


---

# Seeds iniciales

## Paso

Paso 7 — Crear seeds iniciales.

## Datos creados

```txt
roles:
- admin
- seller
- customer

usuarios:
- admin@cyberstore.lab
- seller@cyberstore.lab
- customer@cyberstore.lab

categorías:
- hardware
- networking
- accessories
- digital

productos iniciales:
- mini-pc-corelab
- ssd-safestore-480gb
- wifi-adapter-netprobe
- ethernet-cat6-pro
- owasp-checklist
Contraseña local de desarrollo
CyberStore123!
Advertencia

Esta contraseña es solo para laboratorio local. No debe usarse en producción ni en entornos públicos.

Comando usado
podman compose exec backend npx prisma db seed
Validación
podman compose exec postgres psql -U cyberstore -d cyberstore_db -c "SELECT name FROM roles ORDER BY name;"
podman compose exec postgres psql -U cyberstore -d cyberstore_db -c "SELECT email, status FROM users ORDER BY email;"
podman compose exec postgres psql -U cyberstore -d cyberstore_db -c "SELECT name, slug FROM categories ORDER BY slug;"
podman compose exec postgres psql -U cyberstore -d cyberstore_db -c "SELECT name, slug, status, price_cents, stock FROM products ORDER BY slug;"

