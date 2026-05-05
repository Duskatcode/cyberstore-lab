# Vulnerable Lab Profile — CyberStore Lab

## Objetivo

Crear una zona vulnerable separada de la lógica segura principal para prácticas controladas con OWASP ZAP, Burp Suite y análisis manual.

## Ruta base

```txt
/api/v1/lab/vulnerable/*
Activación
ENABLE_VULNERABLE_LAB=true

Por defecto debe estar apagado:

ENABLE_VULNERABLE_LAB=false
Reglas
- No exponer este perfil en Internet.
- No mezclar vulnerabilidades con auth, products, cart ni checkout seguros.
- No usar estas rutas en frontend normal.
- No usar este perfil con datos reales.
- Toda vulnerabilidad debe estar documentada.
Endpoints iniciales
GET  /api/v1/lab/vulnerable/info
POST /api/v1/lab/vulnerable/verbose-login
GET  /api/v1/lab/vulnerable/orders/:id
GET  /api/v1/lab/vulnerable/sql-products-search?term=...
GET  /api/v1/lab/vulnerable/reflected?message=...
Vulnerabilidades representadas
- User enumeration por mensajes de login demasiado específicos.
- Broken access control por lectura de órdenes sin ownership check.
- SQL injection risk por uso de query raw insegura.
- Reflected input no confiable.
Validación

Con perfil apagado:

curl -i http://localhost:8080/api/v1/lab/vulnerable/info

Resultado esperado:

404

Con perfil activo:

curl -i http://localhost:8080/api/v1/lab/vulnerable/info

Resultado esperado:

200
Nota

Este perfil existe solo para laboratorio local. La app segura debe seguir funcionando aunque el perfil vulnerable esté apagado.
