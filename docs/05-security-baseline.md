005 — blocked_user no será rol

Security Baseline — CyberStore Lab
Principio principal

El MVP debe nacer seguro.

Las vulnerabilidades intencionales se crearán después en una rama separada:

lab/vulnerable
Controles mínimos desde el inicio
Helmet
CORS estricto
ValidationPipe
DTOs estrictos
hash de password
access token corto
refresh token rotativo
logout real
errores internos ocultos en producción
logs estructurados básicos
rate limiting suave
registro de intentos fallidos
guards por rol
guards por ownership
Autenticación

Debe incluir:

registro
login
access token
refresh token
refresh token rotativo
logout
blacklist/token tracking en Redis
hash de password

No incluir todavía:

MFA
OAuth externo
verificación de correo real
recuperación real de contraseña
Autorización

Capas necesarias:

Role Guard
Ownership Guard
Status Guard

Ejemplo:

seller puede editar producto propio
seller no puede editar producto de otro seller
admin puede moderar cualquier producto
customer solo puede ver sus pedidos
Validación de entrada

Toda entrada HTTP debe pasar por DTOs.

Reglas esperadas:

whitelist: true
forbidNonWhitelisted: true
transform: true
Manejo de errores

En desarrollo se permite mayor detalle técnico.

En producción no se deben exponer:

stack traces
queries SQL
errores internos de Prisma
paths internos del servidor
tokens
variables de entorno

Respuesta correcta en producción:

{
  "statusCode": 500,
  "message": "Internal server error",
  "requestId": "req_abc123"
}
CORS

Origen inicial permitido:

http://localhost

Cuando haya frontend separado en desarrollo:

http://localhost:5173
Rate limiting inicial

Objetivos:

login
refresh token
registro
checkout
OWASP Top 10 relacionado

Puntos especialmente relevantes:

Broken Access Control
Cryptographic Failures
Injection
Security Misconfiguration
Identification and Authentication Failures
Software and Data Integrity Failures
Security Logging and Monitoring Failures
Regla para Kali / ZAP / Burp
No se prueba contra producción real.
No se prueba contra terceros.
Solo se prueba contra el laboratorio propio.
Los hallazgos se documentan en docs/security-reports.

Decisión

blocked_user no será un rol.

Razón

Bloqueado es un estado operativo, no una identidad funcional.

Correcto
role: seller
status: blocked
Incorrecto
role: blocked_user
Estado

Aceptada.
