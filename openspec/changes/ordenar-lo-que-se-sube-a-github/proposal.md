## Why

El repositorio de GitHub sube archivos que no son del sistema.

Algunos ya están en el `.gitignore`, pero Git los sigue rastreando porque se agregaron antes de ignorarlos:
- `CLAUDE.md`;
- `.claude/`;
- `.agents/`;
- `skills-lock.json`.

Otros todavía no se subieron, pero tampoco están ignorados y entrarían en el próximo `git add .`:
- un volcado de la terminal;
- un archivo de bloqueo de Word;
- los borradores de la tesis.

No hay secretos versionados: no hay `.env` ni claves en los archivos rastreados, y los `.env.example` están vacíos.

## What Changes

**Dejan de subirse.** Quedan en el equipo y desaparecen del repositorio en el próximo push:

| Ruta | Qué es |
|---|---|
| `CLAUDE.md` | guía para Claude Code |
| `.claude/` (12 archivos) | comandos y skills de OpenSpec para Claude Code |
| `.agents/` (14 archivos) | skills de diseño de terceros |
| `skills-lock.json` | lock de esas skills |
| `.impeccable/` (4 archivos) | críticas y configuración de la herramienta de diseño |

**Se ignoran sin haberse subido nunca:**

| Ruta | Qué es |
|---|---|
| `sh.exe.stackdump` (y `*.stackdump`) | volcado de un fallo de la terminal |
| `docs/~$pitulo-2-marco-teorico.docx` (y `~$*`) | bloqueo de Word mientras el archivo está abierto |
| `docs/capitulo-2-marco-teorico.docx`, `docs/marco-teorico-borrador.md`, `docs/marco-teorico-fuentes.md` | borradores del marco teórico |
| `docs/guia-de-transcripcion-capitulos-1-a-3.md` y `.docx` | guía de transcripción |
| `docs/diagramas/` | diagramas Mermaid |
| `docs/herramientas/` | scripts que generan los `.docx` |

**Siguen subiéndose:**
- `openspec/`;
- `docs/Copia de Copia de PerfilJorgeV3.docx.md` y `docs/arquitectura.md`;
- `README.md`, `DESIGN.md` y `PRODUCT.md`;
- los fixtures sintéticos de `backend/tests/fixtures/`;
- los `.env.example`.

## Capabilities

### New Capabilities
- `repositorio`: qué se versiona y qué no.

### Modified Capabilities
<!-- Ninguna. -->

## Impact

- **`.gitignore` raíz:** se agregan `.impeccable/`, `*.stackdump`, `~$*` y el bloque de `docs/`. Se quita la línea redundante `.claude/settings.local.json`.
- **Índice de Git:** `git rm -r --cached` sobre las cinco rutas de la primera tabla. No se borra nada del disco.
- Los archivos que dejan de subirse siguen en el historial de commits anteriores. No hace falta purgarlo, porque no contienen secretos.
- No cambia el código del backend ni del frontend.
