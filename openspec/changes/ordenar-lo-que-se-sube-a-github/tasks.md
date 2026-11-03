## 1. `.gitignore`

- [x] 1.1 En el `.gitignore` raíz:
  - en el bloque de Claude Code, agregar `.impeccable/` y quitar `.claude/settings.local.json`, que ya cubre `.claude/`;
  - en el bloque de temporales, agregar `*.stackdump` y `~$*`;
  - agregar un bloque nuevo de documentos de la tesis con `docs/*`, `!docs/arquitectura.md` y `!docs/Copia de Copia de PerfilJorgeV3.docx.md`.

  Verificar con `git check-ignore -v` sobre `docs/marco-teorico-borrador.md`, `sh.exe.stackdump` y `docs/~$pitulo-2-marco-teorico.docx` (los tres deben estar ignorados), y sobre `docs/arquitectura.md` (no debe estarlo).

## 2. Dejar de rastrear

- [x] 2.1 Ejecutar `git rm -r --cached CLAUDE.md .claude .agents skills-lock.json .impeccable`. Verificar:
  - `git ls-files -ci --exclude-standard` debe salir vacío;
  - `ls CLAUDE.md .claude .agents .impeccable` debe mostrar que siguen en el disco.

## 3. Verificación

- [x] 3.1 Comprobar:
  - `git ls-files docs` da solo los 2 archivos;
  - `git status --porcelain | grep '^??'` no muestra nada de `docs/`, `.stackdump` ni `~$`;
  - `git ls-files openspec backend/.env.example frontend/.env.example` sigue listándolos;
  - `openspec validate ordenar-lo-que-se-sube-a-github`.

## 4. Cierre (lo hace el usuario)

- [ ] 4.1 Revisar `git status`, que mostrará las rutas de la tarea 2.1 como «deleted» en el índice, y hacer el commit y el push. No hacer commit de mi parte.
