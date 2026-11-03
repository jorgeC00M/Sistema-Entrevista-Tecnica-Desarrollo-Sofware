## Context

`ResumenDelAnalisis` es una sola columna (`estado-del-cv-por-datos-clave`): línea de match (solo en el dirigido), `VeredictoDeLegibilidad`, `EspejoDelATS`, `TecnologiasLegibles` (solo en el general) y `PreguntasProbables`. Las dos tarjetas son `<Tarjeta className="p-5">`. El pie de `TecnologiasLegibles` es `flex-col sm:flex-row sm:justify-between`, pensado para ir a todo el ancho. La entrada ya usa una fila `lg:grid-cols-[2fr_1fr]` con `gap-6` (`entrada-del-cv-dos-tercios`).

## Goals / Non-Goals

**Goals:**
- Una fila 2/3 – 1/3 con la misma altura y 24 px de separación, solo en el general.

**Non-Goals:**
- Cambiar el contenido del espejo o de Tecnologías, el banner o el dirigido.

## Decisions

**D1. La misma rejilla que la entrada.**
- Con convocatoria no hay Tecnologías y el espejo va solo.
- Sin convocatoria, un `div` envuelve las dos tarjetas con `grid gap-6 lg:grid-cols-[2fr_1fr]`, la misma clase que la entrada, así las dos filas asimétricas de la pantalla se ven iguales.
- Sin `items-start`, cada `Tarjeta` es hija directa de la grilla y se estira a la altura de la fila (`stretch`): queda alineada arriba y abajo.
- El orden del DOM (espejo, tecnologías) es el del celular.

**D2. El pie de Tecnologías al fondo y en columna estrecha.**
- La `section` interior pasa a `h-full` y el pie lleva `mt-auto`, así baja al borde inferior cuando el espejo es más alto.
- En `lg`, el pie vuelve a apilarse (`sm:flex-row lg:flex-col lg:items-start`): en unos 330 px el texto y el botón lado a lado se aprietan. Entre 640 y 1023 px la tarjeta va a todo el ancho y conserva la fila.

## Risks / Trade-offs

- **[Trade-off]** Si el CV tiene muchas tecnologías, Tecnologías puede ser más alta que el espejo y entonces el espejo se estira con espacio abajo. Es poco probable: la ficha tiene 8 filas y las tecnologías son chips en varias líneas.
