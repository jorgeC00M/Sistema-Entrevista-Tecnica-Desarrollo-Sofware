## Why

En «Resumen y Formato», el espejo («Esto es lo que el ATS ve de tu CV») y «Tecnologías por las que te encontrarían» van uno debajo del otro, a todo el ancho. Tecnologías es una lista corta de chips con un botón, y a ancho completo deja mucho espacio vacío y alarga la pestaña. Jorge propuso ponerlo a la derecha del espejo, en 1/3 del ancho, con el espejo en los 2/3 restantes, alineados arriba y abajo y separados. Aprobó que en el análisis dirigido, que no tiene Tecnologías, el espejo siga a todo el ancho.

## What Changes

- **Una fila `2fr 1fr` en «Resumen y Formato», desde 1024 px:** el espejo a la izquierda (2/3) y Tecnologías a la derecha (1/3).
  - Las dos tarjetas tienen la misma altura, alineadas arriba y abajo, con 24 px entre ellas.
  - Por debajo de 1024 px se apilan, con el espejo primero.
- **En el «Resumen» del dirigido no cambia nada:** el espejo sigue a todo el ancho.
- **Tecnologías se ajusta a su columna:** en el tercio derecho, su pie («Compara con una convocatoria» y su botón) se apila y queda al fondo de la tarjeta, así el contenido llena la altura.

## Capabilities

### New Capabilities
- `revision-de-cv`: la fila espejo / tecnologías del Resumen general. Aún no tiene spec principal, así que la delta es ADDED, como en los cambios anteriores.

### Modified Capabilities

## Impact

- **Frontend:** en `features/curriculum/components/`, `ResumenDelAnalisis.tsx` (la fila) y `TecnologiasLegibles.tsx` (el pie en columna estrecha y la tarjeta a la altura de la fila).
- **Specs sin archivar que describen el Resumen en una columna con este orden:** `estado-del-cv-por-datos-clave` se ajusta para no contradecir este cambio.
- **Documentación:** `CLAUDE.md`.
- **Sin cambios** en el backend, el API, el banner, el espejo por dentro ni el dirigido.
