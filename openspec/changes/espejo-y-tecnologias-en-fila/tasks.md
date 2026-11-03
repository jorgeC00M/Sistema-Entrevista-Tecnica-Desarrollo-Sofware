## 1. Fila

- [x] 1.1 En `ResumenDelAnalisis.tsx`:
  - sin convocatoria, envolver `EspejoDelATS` y `TecnologiasLegibles` en un `div` con `grid gap-6 lg:grid-cols-[2fr_1fr]`, sin `items-start`;
  - con convocatoria, el espejo va solo, como hoy;
  - actualizar el docstring.

  Verificar con tsc.
- [x] 1.2 En `TecnologiasLegibles.tsx`:
  - la `section` interior con `h-full`;
  - el pie con `mt-auto` y `sm:flex-row lg:flex-col lg:items-start`, para que en el tercio derecho se apile y quede al fondo.

  Verificar con tsc, lint y `estilos.test.ts`.

## 2. Specs, documentación y verificación

- [x] 2.1 En la delta de `estado-del-cv-por-datos-clave`, el requisito «El Resumen es una sola columna» pasa a decir que en el general el espejo y Tecnologías comparten fila (ver este cambio). Verificar con `openspec validate`.
- [x] 2.2 En `CLAUDE.md`, describir la fila espejo / tecnologías en 2fr / 1fr y agregar este cambio a la lista de reaperturas.
- [x] 2.3 Verificación completa:
  - `pnpm exec tsc --noEmit`;
  - `pnpm test`;
  - `pnpm run lint`, que debe quedar en 5 advertencias;
  - `pnpm run build`;
  - `openspec validate espejo-y-tecnologias-en-fila`.

## 3. Cierre (lo hace el usuario)

- [ ] 3.1 Pruebas manuales:
  - a 1280 px, en «Resumen y Formato», el espejo ocupa unos 2/3 y Tecnologías 1/3, con la misma altura y 24 px entre ambos, y el pie de Tecnologías queda abajo;
  - en el dirigido, el espejo va a todo el ancho;
  - en el celular, se apilan.
- [ ] 3.2 No hacer commit. El usuario lo hará tras revisar.
