# CyberStore Lab

Mini e-commerce/marketplace controlado para practicar desarrollo full-stack, despliegue con contenedores y pruebas de seguridad en un entorno local.

## Stack

- Backend: NestJS + TypeScript + Prisma
- Frontend: React + Vite + TypeScript + TailwindCSS + Zustand
- Base de datos: PostgreSQL 16
- Cache / soporte operativo: Redis 7
- Reverse proxy: Nginx
- Contenedores: Docker Compose o Podman Compose

## Requisitos

Para iniciar todo el proyecto con contenedores necesitas:

- Docker Desktop, Docker Engine o Podman.
- `docker compose` o `podman compose`.
- Git.
- Puertos libres en tu maquina:
  - `8080` para Nginx.
  - `3000` para el backend.
  - `5173` para el frontend.
  - `5432` para PostgreSQL.
  - `6379` para Redis.

Para ejecutar backend y frontend sin contenedores tambien necesitas:

- Node.js 22 o compatible.
- npm.
- Una instancia local de PostgreSQL.
- Una instancia local de Redis.

## Inicio rapido con contenedores

Estos pasos levantan todo el laboratorio: frontend, backend, base de datos, Redis y Nginx.

### 1. Clonar o entrar al proyecto

```bash
cd cyberstore-lab
```

### 2. Crear el archivo de variables de entorno

```bash
cp .env.example .env
```

Revisa `.env` antes de levantar el proyecto. Para desarrollo local puedes dejar los valores por defecto, pero conviene cambiar los secretos JWT si vas a compartir el entorno.

Variables principales:

```env
POSTGRES_USER=cyberstore
POSTGRES_PASSWORD=cyberstore_password
POSTGRES_DB=cyberstore_db
DATABASE_URL=postgresql://cyberstore:cyberstore_password@postgres:5432/cyberstore_db?schema=public

REDIS_URL=redis://redis:6379

JWT_ACCESS_SECRET=change_me_access_secret
JWT_REFRESH_SECRET=change_me_refresh_secret

FRONTEND_ORIGIN=http://localhost:8080
API_PREFIX=/api/v1
VITE_API_URL=/api/v1
```

Opcionalmente, para habilitar Swagger:

```env
ENABLE_SWAGGER=true
```

### 3. Construir y levantar los servicios

Con Docker:

```bash
docker compose up -d --build
```

Con Podman:

```bash
podman compose up -d --build
```

### 4. Verificar que los servicios esten arriba

Con Docker:

```bash
docker compose ps
```

Con Podman:

```bash
podman compose ps
```

Servicios esperados:

- `cyberstore-postgres`
- `cyberstore-redis`
- `cyberstore-backend`
- `cyberstore-frontend`
- `cyberstore-nginx`

### 5. Ejecutar migraciones de base de datos

Con Docker:

```bash
docker compose exec backend npx prisma migrate dev
```

Con Podman:

```bash
podman compose exec backend npx prisma migrate dev
```

### 6. Cargar datos iniciales

Con Docker:

```bash
docker compose exec backend npx prisma db seed
```

Con Podman:

```bash
podman compose exec backend npx prisma db seed
```

El seed crea usuarios, roles, categorias y productos iniciales.

Usuarios de prueba:

| Rol | Email | Password |
| --- | --- | --- |
| Admin | `admin@cyberstore.lab` | `CyberStore123!` |
| Seller | `seller@cyberstore.lab` | `CyberStore123!` |
| Customer | `customer@cyberstore.lab` | `CyberStore123!` |

### 7. Abrir la aplicacion

- Aplicacion por Nginx: http://localhost:8080
- Frontend directo: http://localhost:5173
- Backend directo: http://localhost:3000/api/v1
- Swagger, si `ENABLE_SWAGGER=true`: http://localhost:3000/api/v1/docs

## VirtualBox lab network

Red recomendada:

- Ubuntu Server VM:
  - Adaptador 1: NAT
  - Adaptador 2: Host-only
  - IP Host-only: `192.168.56.10`
- Kali VM:
  - Adaptador 1: NAT
  - Adaptador 2: Host-only
  - IP por DHCP o fija dentro de `192.168.56.0/24`
- Windows/dispositivo principal:
  - Host-only adapter: `192.168.56.1`

Target principal:

- Web: http://192.168.56.10:8080
- Swagger/API: http://192.168.56.10:8080/api/v1/docs
- OWASP ZAP target: http://192.168.56.10:8080

Variables `.env` para Ubuntu Server:

```env
FRONTEND_ORIGIN=http://192.168.56.10:8080
VITE_API_URL=/api/v1
VITE_PUBLIC_HOST=192.168.56.10
VITE_HMR_CLIENT_PORT=8080
VITE_HMR_PROTOCOL=ws
```

## Comandos utiles

Ver logs del backend:

```bash
docker compose logs -f backend
```

Ver logs del frontend:

```bash
docker compose logs -f frontend
```

Detener los servicios:

```bash
docker compose down
```

Detener y borrar volumenes de base de datos/cache:

```bash
docker compose down -v
```

Abrir Prisma Studio:

```bash
docker compose exec backend npx prisma studio
```

Si usas Podman, cambia `docker compose` por `podman compose`.

## Modo local sin contenedores

Usa este modo si quieres correr backend y frontend directamente con npm. Debes tener PostgreSQL y Redis levantados por tu cuenta.

### 1. Configurar variables

Crea un archivo `backend/.env` para NestJS y Prisma:

```env
NODE_ENV=development
DATABASE_URL=postgresql://cyberstore:cyberstore_password@localhost:5432/cyberstore_db?schema=public
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_URL=redis://localhost:6379
FRONTEND_ORIGIN=http://localhost:5173

JWT_ACCESS_SECRET=change_me_access_secret
JWT_REFRESH_SECRET=change_me_refresh_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

ENABLE_SWAGGER=true
ENABLE_VULNERABLE_LAB=false
```

Crea un archivo `frontend/.env` para Vite:

```env
VITE_API_URL=http://localhost:3000/api/v1
```

### 2. Instalar dependencias del backend

```bash
cd backend
npm install
```

### 3. Preparar base de datos

```bash
npx prisma migrate dev
npx prisma db seed
```

### 4. Iniciar backend

```bash
npm run start:dev
```

El backend queda disponible en:

```text
http://localhost:3000/api/v1
```

### 5. Instalar dependencias del frontend

En otra terminal:

```bash
cd frontend
npm install
```

### 6. Iniciar frontend

```bash
npm run dev
```

El frontend queda disponible en:

```text
http://localhost:5173
```

## Pruebas y validacion

Backend:

```bash
cd backend
npm run test
npm run test:e2e
npm run lint
```

Frontend:

```bash
cd frontend
npm run lint
npm run build
```

## Estructura principal

```text
cyberstore-lab/
├── backend/        # API NestJS, Prisma, modulos de dominio
├── frontend/       # Aplicacion React/Vite
├── infra/nginx/    # Configuracion del reverse proxy
├── docs/           # Documentacion tecnica del proyecto
├── reports/        # Reportes de seguridad
├── compose.yml     # Servicios del entorno local
└── .env.example    # Variables de entorno base
```

## Notas de seguridad

Este repositorio esta pensado como laboratorio controlado. No uses los secretos ni credenciales de ejemplo en produccion. Si activas perfiles vulnerables o pruebas con herramientas como OWASP ZAP, Burp Suite o Kali, hazlo solo contra tu entorno local o un entorno autorizado.
