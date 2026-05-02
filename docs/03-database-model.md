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