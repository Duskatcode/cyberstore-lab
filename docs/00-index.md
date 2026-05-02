Objetivo

Construir un mini e-commerce/marketplace controlado para practicar:

desarrollo full-stack
despliegue en Ubuntu Server
contenedores con Podman
reverse proxy con Nginx
base de datos PostgreSQL
Redis como soporte operativo
hardening básico
pruebas de seguridad con Kali, OWASP ZAP y Burp Suite
Stack elegido
Backend: NestJS + TypeScript + Prisma
Frontend: React + Vite + TypeScript + TailwindCSS + Zustand
Base de datos: PostgreSQL
Cache / sesiones / carrito temporal: Redis
Contenedores: Podman
Reverse proxy: Nginx
Documentación: Obsidian Markdown
Servicios esperados
frontend
backend
postgres
redis
nginx
Rutas esperadas
/              -> frontend
/api/v1        -> backend
/api/v1/docs   -> Swagger
Notas principales
[[01-decision-log]]
[[02-architecture]]
[[03-database-model]]
[[04-redis-decision]]
[[05-security-baseline]]
[[06-podman-setup]]



Comandos principales futuros
podman compose up -d --build
podman compose ps
podman compose logs -f backend
podman compose exec backend npx prisma migrate dev
podman compose exec backend npx prisma studio
Regla principal del proyecto

La versión inicial debe ser segura.

main / develop
└── versión segura

lab/vulnerable
└── versión vulnerable futura para pruebas controladas


Arquitectura — CyberStore Lab
Visión general

CyberStore Lab será un marketplace controlado con tres roles principales:

Customer
Seller
Admin
Diagrama general
Separación de responsabilidades
frontend
└── interfaz de usuario

backend
└── lógica de negocio, seguridad, API, permisos

postgres
└── persistencia principal

redis
└── datos temporales, tokens, carrito, rate limiting

nginx
└── entrada única y reverse proxy

kali
└── pruebas externas contra el entorno levantado
Backend

Stack:

NestJS
TypeScript
Prisma
Swagger/OpenAPI

Arquitectura por módulo:

module/
├── controllers/
├── application/
│   └── use-cases/
├── domain/
│   ├── entities/
│   ├── policies/
│   └── services/
├── infrastructure/
│   └── repositories/
├── dto/
├── mappers/
└── module.ts
Frontend

Stack:

React
Vite
TypeScript
TailwindCSS
Zustand

Estructura esperada:

frontend/src/
├── pages/
├── components/
├── services/
├── stores/
├── hooks/
├── types/
└── utils/
Infraestructura

Servicios mínimos:

frontend
backend
postgres
redis
nginx

Flujo HTTP esperado:

Cliente
│
▼
Nginx
├── /       -> frontend
└── /api/v1 -> backend
Rama vulnerable futura
main/develop
└── versión segura

lab/vulnerable
└── versión vulnerable intencional

Regla:

Kali prueba contra el entorno levantado.
Kali no modifica main.
Las vulnerabilidades se documentan aparte.

Verifica que se crearon:


Debe salir algo parecido:

docs/00-index.md
docs/01-decision-log.md
docs/02-architecture.md
docs/03-database-model.md
docs/05-security-baseline.md
docs/06-podman-setup.md