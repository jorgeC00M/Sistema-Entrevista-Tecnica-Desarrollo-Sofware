## Context

El `.gitignore` raíz ya lista `CLAUDE.md`, `.claude/`, `.agents/` y `skills-lock.json`. Pero ignorar no afecta a lo que ya está rastreado, así que esos 28 archivos se siguen subiendo; `git ls-files -ci --exclude-standard` lo confirma. `backend/.gitignore` y `frontend/.gitignore` repiten buena parte del raíz.

Decisiones de Jorge:
- dejan de subirse las herramientas de IA;
- se mantiene `openspec/`;
- no se sube ningún archivo nuevo de `docs/`;
- se mantiene el perfil de tesis.

## Goals / Non-Goals

**Goals:**
- Que lo ignorado no esté rastreado.
- Que los borradores futuros de `docs/` queden fuera sin tocar el `.gitignore`.

**Non-Goals:**
- Reescribir el historial: no hay secretos, así que no hace falta `git filter-repo`.
- Unificar los tres `.gitignore`: funcionan, y tocarlos no aporta nada al objetivo.
- Hacer commit o push; los hace Jorge.

## Decisions

- **`git rm -r --cached` en vez de borrar.** Quita los archivos del índice y los deja en el disco, para que Claude Code y las skills sigan funcionando en el equipo.
- **`docs/*` con excepciones, en vez de listar cada borrador.** Se escribe `docs/*`, luego `!docs/arquitectura.md` y luego `!docs/Copia de Copia de PerfilJorgeV3.docx.md`. Se usa `docs/*` y no `docs/` porque Git no reincluye un archivo si su carpeta entera está ignorada.
- **Supuestos:**
  - `.impeccable/` cuenta como herramienta de IA y deja de subirse;
  - `DESIGN.md`, `PRODUCT.md` y `README.md` se quedan, porque describen el producto.
- **Limpieza:** se quita `.claude/settings.local.json`, que ya está cubierto por `.claude/`.

## Risks / Trade-offs

- [Los archivos siguen en commits anteriores de GitHub] → Se acepta: no contienen claves ni datos personales sensibles.
- [Quien clone el repo no tendrá `CLAUDE.md`] → Es lo que se decidió: es una guía para el asistente, no para quien ejecuta el sistema. La documentación técnica sigue en `README.md` y en `docs/arquitectura.md`.

## Migration Plan

Primero se edita el `.gitignore` y después se ejecuta `git rm --cached`. Jorge revisa `git status` y hace el commit. Para revertir, basta con `git add -f` de cada ruta y quitar las líneas del `.gitignore`.
