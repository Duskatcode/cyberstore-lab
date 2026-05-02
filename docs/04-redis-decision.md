004 — Redis como soporte operativo
Decisión

Usar Redis para carrito temporal, blacklist de tokens, tracking de refresh tokens, intentos fallidos de login y rate limiting suave.

Clave inicial recomendada
cart:user:{userId}
TTL inicial
24 horas
Estado

Aceptada.
