002 — Podman en lugar de Docker
Decisión

Usar Podman como runtime de contenedores.

Razones
Es daemonless.
Permite flujos rootless.
Tiene una CLI parecida a Docker.
Encaja mejor con un laboratorio de seguridad en Ubuntu Server.
Trade-off

Podman puede tener más fricción que Docker Desktop en algunos flujos, especialmente en compatibilidad con herramientas que esperan Docker directamente.

Estado

Aceptada.