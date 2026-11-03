## 1. Frase de búsqueda reutilizable

- [x] 1.1 Extraer de `FrenteAlAviso.tsx` el `<p>` de la búsqueda (`busquedaDelReclutador`, icono y par de color) a `components/BusquedaDelReclutador.tsx` y usarlo en `FrenteAlAviso`. Verificar con tsc y lint.

## 2. Pestañas del resultado

- [x] 2.1 En `ResultadoDelAnalisis.tsx`:
  - `type Pestana = 'resumen' | 'match' | 'mejorar'`;
  - la lista de pestañas según `curriculum.con_convocatoria` («Resumen y Formato» / «Plan de Mejora», o «Resumen» / «Match con la Oferta» / «Plan de Mejora»);
  - el panel `match` con `aviso` y `brecha ? FrenteAlAviso : SinRequisitosReconocidos`, con `sugerencias` calculadas aquí;
  - `verMatch`, que pone `match` y enfoca su pestaña;
  - el docstring y los comentarios («Mejorar» → «Plan de Mejora»).

  Verificar con tsc.
- [x] 2.2 En `ResumenDelAnalisis.tsx`:
  - quitar el bloque del aviso y `sugerencias`;
  - con convocatoria y `brecha`, una `Tarjeta` a todo el ancho arriba de la grilla, con `BusquedaDelReclutador` y «Ver el match» (`Boton variante="texto"`, nueva prop `onVerMatch`);
  - quitar los imports que queden sin uso;
  - actualizar el docstring.

  Verificar con tsc y lint.
- [x] 2.3 En `LoQueDebesHacer.tsx`, «Ver todo en Mejorar» pasa a «Ver todo en Plan de Mejora», con sus comentarios. Verificar con un `grep` de «Mejorar» en `features/curriculum`: solo deben quedar «Plan de Mejora».
- [x] 2.4 Revisar `components/ui/Pestanas.tsx`. Si con `repartir` el texto no puede partirse, permitirlo solo en ese caso (`text-center leading-tight`). Verificar con `estilos.test.ts`.

## 3. Specs, documentación y verificación

- [x] 3.1 Hacer que remitan a este cambio:
  - `correcciones-accionables-y-menos-pestanas` (dos pestañas «Resumen» / «Mejorar»);
  - `resumen-en-dos-columnas-y-ejemplos` (el aviso en la columna izquierda del Resumen);
  - `diferenciar-revision-y-comparacion-de-cv` («Frente a este aviso» en el Resumen).

  Verificar con `openspec validate` de cada uno.
- [x] 3.2 En `CLAUDE.md`:
  - el párrafo del resultado: las pestañas por tipo, la línea de match con «Ver el match», «Match con la Oferta» con el detalle del aviso y «Plan de Mejora»;
  - la lista de reaperturas.

  Verificar con un `grep` de «Mejorar».
- [x] 3.3 Verificación completa:
  - `pnpm exec tsc --noEmit`;
  - `pnpm test`;
  - `pnpm run lint`, que debe quedar en 5 advertencias;
  - `pnpm run build`;
  - `openspec validate pestanas-del-resultado-por-tipo`.

## 4. Cierre (lo hace el usuario)

- [ ] 4.1 Pruebas manuales:
  - **análisis general:** muestra «Resumen y Formato | Plan de Mejora»;
  - **análisis dirigido:** muestra «Resumen | Match con la Oferta | Plan de Mejora»;
    - la línea de match y «Ver el match» abren la pestaña;
    - «Match con la Oferta» tiene los chips, la experiencia, los filtros y «Cómo cubrir»;
  - «Lo que debes hacer» abre «Plan de Mejora» en la corrección;
  - en el celular, las tres pestañas caben;
  - un aviso sin requisitos reconocidos muestra su aviso en Match.
- [ ] 4.2 No hacer commit. El usuario lo hará tras revisar.
