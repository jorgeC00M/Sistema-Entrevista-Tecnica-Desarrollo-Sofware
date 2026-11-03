## 1. Estilo compartido

- [x] 1.1 Mover `CLASES_DE_OPCION` de `EleccionDeVia.tsx` a `components/ui/estilosDeOpcion.ts::clasesDeOpcion`, con un docstring que nombre a sus dos consumidores, y hacer que `EleccionDeVia` la importe. Verificar:
  - con tsc;
  - con un `grep` que no quede `CLASES_DE_OPCION`;
  - que «Con convocatoria» se ve igual que antes.

## 2. Tarjetas del tipo

- [x] 2.1 Reescribir `EleccionDeTipo.tsx`:
  - `fieldset` + `legend` «Tipo de análisis», centrada;
  - un `div` `mx-auto grid max-w-xl grid-cols-2 gap-3`;
  - cada opción: un `label` con `clasesDeOpcion` + `group`, un radio `sr-only` (nombre de `useId`), el icono (`documento` / `buscar`), el nombre de `tipoDeRevision`, la pregunta en `text-meta` y el indicador redondo `aria-hidden` que se rellena con `group-has-[:checked]`;
  - quitar `CampoSelect` y el cast;
  - actualizar el docstring.

  Verificar con tsc, lint y `estilos.test.ts`.
- [x] 2.2 En `EntradaDelAnalisis.tsx`, cambiar la `Tarjeta` del tipo por `<div className="lg:col-span-2">` y ajustar el docstring («combo» → «dos tarjetas centradas»). Verificar con tsc y con un `grep` de «combo» en `features/curriculum`.

## 3. Specs, documentación y verificación

- [x] 3.1 En la delta de `tipo-de-analisis-en-combo`, cambiar el requisito «se elige en un combo de fila completa» para que remita a este cambio. Se conservan «general al entrar» y la fila CV + convocatoria. Verificar con `openspec validate tipo-de-analisis-en-combo`.
- [x] 3.2 Actualizar `CLAUDE.md`:
  - la descripción de `EleccionDeTipo`, que pasa de combo a tarjetas compactas;
  - la frase de `EleccionDeVia`, que vuelve a compartir `clasesDeOpcion`;
  - la lista de reaperturas.

  Verificar con un `grep` de `CLASES_DE_OPCION` y de «native `<select>` through `CampoSelect`».
- [x] 3.3 Verificación completa:
  - `pnpm exec tsc --noEmit`;
  - `pnpm test`;
  - `pnpm run lint`, que debe quedar en 5 advertencias;
  - `pnpm run build`;
  - `openspec validate tipo-de-analisis-en-tarjetas-compactas`.

## 4. Cierre (lo hace el usuario)

- [ ] 4.1 Pruebas manuales:
  - **computadora:** las dos tarjetas centradas, «general» marcado al entrar y, al elegir «dirigido», la convocatoria a la derecha;
  - **celular de 390 px:** lado a lado, sin texto cortado ni desplazamiento horizontal;
  - **teclado:** las flechas cambian la opción y el grupo es un solo Tab;
  - «Con convocatoria» de «Nueva entrevista» se ve igual que antes.
- [ ] 4.2 No hacer commit. El usuario lo hará tras revisar.
