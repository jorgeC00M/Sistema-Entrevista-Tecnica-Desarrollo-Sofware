## 1. Entrada

- [x] 1.1 En `EntradaDelAnalisis.tsx`, cambiar la grilla a `grid gap-6 lg:grid-cols-[2fr_1fr]`, sin `items-start`. Ajustar el docstring («2/3 y 1/3» en lugar de «mitad»). Verificar con tsc y con `pnpm test`, que incluye `estilos.test.ts`. Si el guardián rechaza la clase, usar `lg:grid-cols-3` con `lg:col-span-2` en «Tu CV».
- [x] 1.2 Reescribir «Qué revisamos»:
  - el título pasa a «¿Qué revisamos?»;
  - un `<dl>` con tres `div`, cada uno con su `dt` (`text-sm font-semibold text-vidrio-ink`: «Tus datos», «El formato», «Tus viñetas») y su `dd` (`text-meta text-vidrio-muted`: los 8 campos de `CAMPOS_QUE_BUSCA_EL_ATS`, «columnas, tablas, imágenes, encabezados y pies», «si muestran logros o solo tareas»).

  Verificar con tsc y lint.

## 2. Specs, documentación y verificación

- [x] 2.1 Hacer que remitan a este cambio:
  - `tipo-de-analisis-en-combo` («CV y convocatoria comparten fila»);
  - `tipo-de-analisis-en-pestanas` («El panel de cada pestaña»);
  - `entrada-del-cv-que-revisamos` (el nombre y la forma del panel).

  Verificar con `openspec validate` de cada uno.
- [x] 2.2 En `CLAUDE.md`:
  - el párrafo de la entrada del CV: 2fr / 1fr, `gap-6`, «¿Qué revisamos?» como `dl` con tres niveles;
  - la lista de reaperturas.

  Verificar con un `grep`.
- [x] 2.3 Verificación completa:
  - `pnpm exec tsc --noEmit`;
  - `pnpm test`;
  - `pnpm run lint`, que debe quedar en 5 advertencias;
  - `pnpm run build`;
  - `openspec validate entrada-del-cv-dos-tercios`.

## 3. Cierre (lo hace el usuario)

- [ ] 3.1 Pruebas manuales:
  - a 1280 px, «Tu CV» ocupa unos 2/3 y el panel lateral 1/3, con la misma altura y 24 px entre ambos, en las dos pestañas;
  - en el celular se apilan;
  - la jerarquía de «¿Qué revisamos?» se lee clara.
- [ ] 3.2 No hacer commit. El usuario lo hará tras revisar.
