006 — Soft delete para productos

Podman Setup — CyberStore Lab
Objetivo

Levantar el entorno local usando Podman Compose.

Servicios esperados:

frontend
backend
postgres
redis
nginx
Comando objetivo
podman compose up -d --build
Comandos útiles

Ver servicios:

podman compose ps

Ver logs generales:

podman compose logs -f

Ver logs backend:

podman compose logs -f backend

Entrar al backend:

podman compose exec backend sh

Entrar a PostgreSQL:

podman compose exec postgres psql -U cyberstore -d cyberstore_db

Entrar a Redis:

podman compose exec redis redis-cli

Apagar servicios:

podman compose down

Apagar y borrar volúmenes:

podman compose down -v
Servicios mínimos esperados en compose.yml
services:
  postgres:
    image: postgres:16-alpine

  redis:
    image: redis:7.2-alpine

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.dev
    depends_on:
      - postgres
      - redis

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev

  nginx:
    image: nginx:1.27-alpine
    depends_on:
      - backend
      - frontend
Variables base
NODE_ENV=development

POSTGRES_USER=cyberstore
POSTGRES_PASSWORD=cyberstore_password
POSTGRES_DB=cyberstore_db
DATABASE_URL=postgresql://cyberstore:cyberstore_password@postgres:5432/cyberstore_db?schema=public

REDIS_HOST=redis
REDIS_PORT=6379
REDIS_URL=redis://redis:6379

JWT_ACCESS_SECRET=change_me
JWT_REFRESH_SECRET=change_me
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

FRONTEND_ORIGIN=http://localhost
API_PREFIX=/api/v1
Pendiente para Paso 4

Crear:

compose.yml
backend/Dockerfile.dev
frontend/Dockerfile.dev
infra/nginx/default.conf
Criterio de éxito futuro
frontend carga desde Nginx
backend responde en /api/v1
Swagger responde en /api/v1/docs
PostgreSQL persiste datos
Redis responde correctamente

Decisión

Los productos no se eliminarán físicamente en el MVP.

Razón

Los pedidos necesitan conservar historial, snapshots, reportes y trazabilidad.

Estado esperado
deleted
Estado

Aceptada.