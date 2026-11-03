## 1. Cabecera de la pantalla

- [x] 1.1 En `CurriculumPage.tsx`:
  - el `<h1>` pasa a `sr-only` con el texto «Revisar mi CV»;
  - se borran el párrafo de introducción y `enResultado`;
  - se actualizan los comentarios.

  Verificar con `pnpm exec tsc --noEmit` y con un `grep` que confirme que «Un ATS (el sistema» y `enResultado` ya no aparecen en `features/curriculum`.
- [x] 1.2 Ajustar el margen superior del contenido (hoy `mt-6`, porque había un título encima) para que las tarjetas y la barra del resultado empiecen justo bajo el encabezado, con el mismo margen que las demás pantallas. Verificar a ojo en `/mi-cv` y en `/mi-cv/:id`.

## 2. «¿Qué es un ATS?»

- [x] 2.1 En `EleccionDeTipo.tsx`, agregar bajo el `legend` un `<details>` cerrado: `summary` «¿Qué es un ATS?» con `foco-anillo` y `rounded-control`, y un párrafo con las tres ideas de la spec. Verificar con tsc, con `pnpm test` (incluido `estilos.test.ts`) y abriéndolo con el teclado (Tab + Enter).

## 3. Specs, documentación y verificación

- [x] 3.1 Reescribir la delta de `intro-solo-en-la-entrada-del-cv` (el título y el párrafo visibles) para que no contradiga este cambio. Verificar con `openspec validate intro-solo-en-la-entrada-del-cv`.
- [x] 3.2 Actualizar `CLAUDE.md`, sección del CV:
  - el `h1` solo para lectores de pantalla;
  - la explicación en «¿Qué es un ATS?»;
  - por qué el encabezado se queda;
  - que las demás pantallas son candidatas para extender este formato;
  - este cambio en la lista de reaperturas.

  Verificar con un `grep` que no queda «paragraph explaining what an ATS is shows only on the input».
- [x] 3.3 Verificación completa:
  - `pnpm exec tsc --noEmit`;
  - `pnpm test`;
  - `pnpm run lint`, que debe quedar en 5 advertencias;
  - `pnpm run build`;
  - `openspec validate cv-sin-titulo-repetido`.

  Todo en verde.

## 4. Cierre (lo hace el usuario)

- [ ] 4.1 Pruebas manuales:
  - en `/mi-cv`, las tarjetas quedan justo bajo el encabezado;
  - «¿Qué es un ATS?» se abre y se cierra con el ratón y con el teclado;
  - en `/mi-cv/:id`, la barra del resultado queda arriba y las pestañas fijas siguen sin tapar contenido;
  - con un lector de pantalla hay un único título principal, «Revisar mi CV».
- [ ] 4.2 No hacer commit. El usuario lo hará tras revisar.
