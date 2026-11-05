## Why

En el Resumen, el panel de la dona ocupa solo su propio ancho (`md:grid-cols-[auto_1fr]`), así que queda angosto junto a un panel derecho muy ancho. Además, esa fila no sigue la proporción de tercios que usa el resto de la pantalla: la entrada y el espejo con las tecnologías van en 2fr / 1fr.

## What Changes

- **Resumen, análisis general y dirigido:** desde 768 px, el panel de la dona ocupa 1/3 del ancho y los demás paneles los 2/3 restantes.
- **Dentro de los 2/3 no cambia nada.** En el general va el estado con «Formato». En el dirigido, el estado va arriba y, debajo, «Formato» | «Requisitos de la oferta», lado a lado desde 1024 px y apilados por debajo.
- **La separación entre paneles sigue igual:** 16 px por debajo de 1024 px y 24 px desde 1024 px.
- **En el celular, todo sigue apilado:** dona, estado, «Formato» y «Requisitos».
- **La dona y su leyenda siguen centradas en su panel.** No cambia lo que se mide.

## Capabilities

### New Capabilities
- `revision-de-cv`: no tiene spec principal; la delta agrega la proporción 1/3 – 2/3 del banner del Resumen.

### Modified Capabilities
<!-- Ninguna con spec principal. Se ajustan el design y las tasks sin archivar de `paneles-del-resumen-y-plan-de-mejora`, que hablan de `auto_1fr`. -->

## Impact

- **Frontend:** `features/curriculum/components/VeredictoDeLegibilidad.tsx` (una clase de la grilla y el docstring).
- **Planificación:** `openspec/changes/paneles-del-resumen-y-plan-de-mejora/` (design y tasks).
- **`CLAUDE.md`.**
- Sin cambios en el backend ni en los tests.
