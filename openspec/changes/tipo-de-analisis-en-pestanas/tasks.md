## 1. Pestañas

- [x] 1.1 En `hallazgos.ts`, agregar `preguntaDelTipo(tipo: TipoDeAnalisis)`, que devuelve «¿El ATS lee mi CV?» / «¿Encajo en el aviso?», junto a `tipoDeRevision`, y probarla en `hallazgos.test.ts`. Verificar con `pnpm test`.
- [x] 1.2 En `EntradaDelAnalisis.tsx`, reemplazar el bloque `EleccionDeTipo` por:
  - `Pestanas`: `etiqueta="Tipo de análisis"`, `valor` = `TipoDeAnalisis`, `etiqueta` = `tipoDeRevision`, `idBase` e `idPanel` de `useId()`, `repartir`, y `seleccionada={tipo}` con `onSeleccionar` = `onTipo`;
  - un `<div role="tabpanel">` como en `SeleccionPuestoPage`, con la pregunta, la grilla CV / convocatoria, el error, la línea `aria-live` y el botón.

  Actualizar el docstring y verificar con tsc y lint.

## 2. Código muerto

- [x] 2.1 Borrar `EleccionDeTipo.tsx`. Devolver `clasesDeOpcion` a `EleccionDeVia.tsx` como constante local, ajustar su docstring y borrar `components/ui/estilosDeOpcion.ts`. Verificar con un `grep` que no quedan `EleccionDeTipo`, `clasesDeOpcion` ni `estilosDeOpcion` en `frontend/src`, y que «Con convocatoria» se ve igual que antes.

## 3. Specs, documentación y verificación

- [x] 3.1 En la delta de `tipo-de-analisis-en-tarjetas-compactas`, remitir a este cambio en el control del tipo. Verificar con `openspec validate tipo-de-analisis-en-tarjetas-compactas`.
- [x] 3.2 Actualizar `CLAUDE.md`:
  - el párrafo de la entrada del CV: pestañas, pregunta, CV a la izquierda, convocatoria a la derecha e historial fuera;
  - la frase de `EleccionDeVia` sobre `clasesDeOpcion`;
  - la lista de reaperturas.

  Verificar con un `grep` de `EleccionDeTipo` y `estilosDeOpcion`.
- [x] 3.3 Verificación completa:
  - `pnpm exec tsc --noEmit`;
  - `pnpm test`;
  - `pnpm run lint`, que debe quedar en 5 advertencias;
  - `pnpm run build`;
  - `openspec validate tipo-de-analisis-en-pestanas`.

## 4. Cierre (lo hace el usuario)

- [ ] 4.1 Pruebas manuales:
  - las pestañas se cambian con clic y con las flechas;
  - en «dirigido», la convocatoria queda a la derecha y el CV no se mueve;
  - en el celular, las dos pestañas reparten el ancho;
  - el historial es igual en las dos;
  - «Compara con una convocatoria» abre «dirigido» con el foco en la convocatoria.
- [ ] 4.2 No hacer commit. El usuario lo hará tras revisar.
