## 1. Banner en tercios

- [x] 1.1 En `frontend/src/features/curriculum/components/VeredictoDeLegibilidad.tsx`, cambiar `md:grid-cols-[auto_1fr]` por `md:grid-cols-[1fr_2fr]` y actualizar el docstring: «a la izquierda, en un tercio desde 768 px; arriba en el celular». Si queda algún comentario que hable del ancho propio de la dona, quitarlo.

## 2. Documentación y verificación

- [x] 2.1 En `openspec/changes/paneles-del-resumen-y-plan-de-mejora/`, en `design.md` y `tasks.md`, la grilla `md:grid-cols-[auto_1fr]` remite a `dona-en-un-tercio`.
- [x] 2.2 En `CLAUDE.md`:
  - en la descripción del banner, cambiar `md:grid-cols-[auto_1fr]` por `md:grid-cols-[1fr_2fr]` e indicar que la dona ocupa un tercio;
  - agregar `dona-en-un-tercio` a la lista de reaperturas.
- [x] 2.3 Ejecutar `openspec validate dona-en-un-tercio` y `openspec validate paneles-del-resumen-y-plan-de-mejora`.
- [x] 2.4 Ejecutar `pnpm exec tsc --noEmit`, `pnpm test` (con `estilos.test.ts`), `pnpm run lint` (deben quedar 5 advertencias) y `pnpm run build`.

## 3. Cierre (lo hace el usuario)

- [ ] 3.1 Pruebas manuales a 1280, 800 y 375 px del Resumen general y del dirigido.
- [ ] 3.2 No hacer commit; lo hace el usuario.
