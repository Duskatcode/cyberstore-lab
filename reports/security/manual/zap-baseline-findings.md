# ZAP Baseline Findings — CyberStore Lab

## Fecha

2026-05-08

## Target

```txt
http://host.containers.internal:8080
Resultado general
FAIL-NEW: 0
WARN-NEW: 8
PASS: 59
Interpretación

El baseline pasivo no detectó fallos críticos nuevos. Los hallazgos son advertencias de hardening HTTP, principalmente sobre el frontend servido por Vite detrás de Nginx.

Hallazgos
1. Missing Anti-clickjacking Header

Ruta afectada:

/

Riesgo:

La página puede ser embebida en iframes si no se controla X-Frame-Options o frame-ancestors en CSP.

Decisión:

Corregir en Nginx para el frontend.
2. X-Content-Type-Options Header Missing

Rutas afectadas:

/
/favicon.svg
/robots.txt
/sitemap.xml
/src/main.tsx

Riesgo:

El navegador podría intentar interpretar contenido con un MIME distinto al declarado.

Decisión:

Corregir con X-Content-Type-Options: nosniff.
3. Server Leaks Version Information

Rutas afectadas:

/
/favicon.svg
/robots.txt
/sitemap.xml
/src/main.tsx

Riesgo:

El header Server revela nginx/1.27.5.

Decisión:

Mitigar parcialmente con server_tokens off. El nombre nginx puede seguir apareciendo en la edición OSS.
4. CSP Header Not Set

Rutas afectadas:

/
/robots.txt
/sitemap.xml

Riesgo:

Falta una Content Security Policy para el frontend.

Decisión:

En entorno Vite dev no aplicar una CSP demasiado estricta porque puede romper HMR. Aplicar una CSP mínima de laboratorio o dejarlo como pendiente para build productivo.
5. Storable but Non-Cacheable Content

Rutas afectadas:

/
/@vite/client
/favicon.svg
/sitemap.xml
/src/main.tsx

Riesgo:

Contenido almacenable sin políticas de cache claras.

Decisión:

Aceptable en Vite dev. Corregir en perfil productivo.
6. Permissions Policy Header Not Set

Rutas afectadas:

/
/@vite/client
/robots.txt
/sitemap.xml
/src/main.tsx

Riesgo:

No se restringen capacidades del navegador como camera, microphone, geolocation.

Decisión:

Corregir en Nginx.
7. Modern Web Application

Rutas afectadas:

/
/robots.txt
/sitemap.xml

Riesgo:

Informativo. ZAP detecta comportamiento de app moderna/SPAs.

Decisión:

Aceptar como informativo.
8. Cross-Origin-Embedder-Policy Header Missing or Invalid

Rutas afectadas:

/
/sitemap.xml

Riesgo:

No se define COEP. Puede ser relevante si la app usa aislamiento cross-origin avanzado.

Decisión:

Pendiente. No aplicar agresivamente en Vite dev porque puede romper recursos externos/HMR.
Conclusión

El baseline es aceptable para continuar. No hay FAIL nuevos. Las advertencias principales corresponden a headers del frontend y pueden corregirse en Nginx o diferirse para un perfil productivo.
