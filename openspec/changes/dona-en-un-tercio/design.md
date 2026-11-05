## Context

`VeredictoDeLegibilidad` (de `paneles-del-resumen-y-plan-de-mejora`) devuelve la grilla `grid gap-4 md:grid-cols-[auto_1fr] lg:gap-6`. La primera celda es la `Tarjeta` de la dona, con `flex flex-col items-center`. La segunda es la columna del estado y, en el dirigido, la fila «Formato» | «Requisitos» (`lg:grid-cols-2`). Con `auto`, la dona mide unos 170 px y el resto se lleva todo el ancho que sobra.

El usuario aprobó el boceto: 1/3 desde 768 px, en el general y en el dirigido.

## Goals / Non-Goals

**Goals:** que el banner siga la misma proporción de tercios que el resto de la pantalla, en los dos tipos de análisis.

**Non-Goals:**
- Cambiar el contenido de los paneles, la separación, el orden o lo que se mide.
- Cambiar «Plan de Mejora».

## Decisions

- **`md:grid-cols-[1fr_2fr]` en lugar de `md:grid-cols-[auto_1fr]`.** Es el mismo 2fr / 1fr de la entrada y del espejo, al revés: aquí la columna estrecha va a la izquierda. Las columnas en `fr` se reparten el espacio después de descontar el gap, así que los 16 px y los 24 px se mantienen sin cálculos.
- **Desde 768 px.** A 768 px, con el riel de 72 px y el padding del `main`, el banner tiene unos 650 px, así que el tercio mide unos 200 px. Ahí caben la dona de 128 px y los 20 px de padding por lado. Un solo punto de corte mantiene el comportamiento de hoy (la dona al lado desde `md`).
- **La dona sigue centrada** con el `items-center` que ya tiene su `Tarjeta`. El panel se estira a la altura de la fila, como los demás.
- **No se anida ninguna tarjeta y el DOM no cambia.** Solo cambia una clase.

**Alternativa descartada:** 1/3 solo desde 1024 px, con `auto` en tablet. Agrega un punto de corte y en tablet la proporción sería distinta sin necesidad. El usuario eligió desde 768 px.

## Risks / Trade-offs

- [En el dirigido, entre 768 y 1023 px, los dos tercios apilan estado, «Formato» y «Requisitos», así que la columna derecha queda alta y el panel de la dona, estirado, muestra espacio vacío debajo de la leyenda] → Se acepta. Así los paneles de la fila tienen la misma altura, como en el resto de la pantalla.
- [A 1024 px, «Formato» y «Requisitos» se reparten los 2/3, unos 300 px cada uno] → Alcanzan para un chip y su tipo, y para los enlaces de «Formato», que pueden ocupar dos líneas.

## Migration Plan

Solo cambia una clase. Para revertir, basta con volver a `auto_1fr`.
