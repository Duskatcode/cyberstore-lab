# Security Baseline — CyberStore Lab

## Objetivo

Definir una línea base segura para el MVP antes de introducir vulnerabilidades controladas o ejecutar pruebas con OWASP ZAP, Burp Suite y Nmap.

## Estado actual

```txt
- NestJS API bajo /api/v1.
- Nginx como entrada única en localhost:8080.
- Frontend React servido por Vite detrás de Nginx.
- PostgreSQL como base principal.
- Redis para carrito temporal.
- JWT access token + refresh token.
- Roles: admin, seller, customer.
- Productos públicos.
- Carrito autenticado.
- Checkout simulado transaccional.
Controles aplicados
- Helmet activo.
- ValidationPipe global con whitelist.
- forbidNonWhitelisted activo.
- transform activo.
- CORS limitado por FRONTEND_ORIGIN.
- Swagger controlado por ENABLE_SWAGGER.
- Rate limiting global con @nestjs/throttler.
- JWT access token de corta duración.
- Refresh token hasheado en base de datos.
- Logout revoca refresh token.
- RolesGuard para rutas admin/seller.
- Ownership checks para productos seller y pedidos customer.
- Nginx usa resolver dinámico para backend/frontend en red Podman.
Rate limit validado

Configuración actual:

100 requests por minuto por cliente.

Validación ejecutada:

for i in {1..120}; do
  curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8080/api/v1/products
done

Resultado esperado:

200 iniciales
429 después de superar el límite
Decisiones
- Swagger se permite en laboratorio local con ENABLE_SWAGGER=true.
- En despliegue expuesto debe apagarse o protegerse.
- El carrito vive en Redis con TTL.
- El checkout descuenta stock solo dentro de una transacción.
- Los errores de login no deben revelar si el usuario existe.
- Los tokens no deben persistirse en localStorage en esta versión.
- El perfil vulnerable debe ir separado de la lógica segura principal.
Riesgos pendientes
- Falta rate limit específico para /auth/login.
- Falta bloqueo temporal por intentos fallidos.
- Falta sanitización/logging defensivo avanzado.
- Falta CSRF si se migra a cookies.
- Falta refresh automático en frontend.
- Falta HTTPS real para despliegue fuera de localhost.
- Falta pipeline SAST/dependency audit.

