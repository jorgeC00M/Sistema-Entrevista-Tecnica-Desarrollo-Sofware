## Context

`VeredictoDeLegibilidad` es una sola `Tarjeta` con dos columnas: la dona y su leyenda, y el estado con «Formato». Desde `vista-dirigida-resumen-match-y-plan` recibe el slot `requisitos`, que en el dirigido pone «Requisitos de la oferta» al lado de «Formato», dentro de la misma tarjeta, separados por un `border-t`. `RequisitosNoDetectados` escribe «No se detectó» en cada fila. `ArreglosDeFormato` usa `sm:grid-cols-[1fr_minmax(0,16rem)]` con `gap-x-4`.

Lo que eligió el usuario:
- en el dirigido, la dona a la izquierda y, a la derecha, el estado arriba y «Formato» | «Requisitos» debajo;
- «No se detectó:» como encabezado;
- la regla 2/3 – 1/3 solo para «Arreglar el formato».

## Goals / Non-Goals

**Goals:** que cada pregunta tenga su panel, sin repetir texto, y con la separación de 24 px en escritorio.

**Non-Goals:**
- Cambiar la dona, el estado, las reglas o lo que se mide.
- Cambiar «Palabras clave no detectadas» o el general fuera del banner.

## Decisions

- **Paneles hermanos, nunca anidados.** `VeredictoDeLegibilidad` devuelve una grilla `grid gap-4 md:grid-cols-[auto_1fr] lg:gap-6` (hoy `md:grid-cols-[1fr_2fr]`: la dona ocupa un tercio, ver `dona-en-un-tercio`). La primera celda es la `Tarjeta` de la dona. La segunda es una columna `flex flex-col gap-4 lg:gap-6` con:
  - la `Tarjeta` del estado. En el general incluye «Formato» con su `border-t`, como hoy; en el dirigido, no;
  - solo con `requisitos`, una grilla `grid gap-4 lg:grid-cols-2 lg:gap-6` con la `Tarjeta` de «Formato» y el panel de requisitos.

  Una tarjeta dentro de otra duplicaría el borde y la sombra.
- **«Formato» se extrae a una función local** (`BloqueDeFormato`), que se usa dentro del panel del estado o como su propio panel. Así no se escribe dos veces.
- **`RequisitosNoDetectados` trae su `Tarjeta`.** El slot sigue siendo `ReactNode`; el componente del banner no sabe qué es una convocatoria.
- **Puntos de corte:**
  - la dona va al lado desde `md` (768 px), porque es angosta (~160 px);
  - «Formato» | «Requisitos» van lado a lado desde `lg` (1024 px), porque a 768 px con el riel quedarían de unos 250 px cada uno;
  - la separación es de 16 px (`gap-4`) por debajo de `lg` y de 24 px (`gap-6`) desde `lg`.
- **Arreglos:** la fila pasa a `grid gap-y-3 lg:grid-cols-[2fr_1fr] lg:gap-x-6`. Por debajo de `lg` es una sola columna y las cajas quedan debajo del texto. Es el mismo 2fr / 1fr que la entrada y el espejo. Se conservan `id`, `tabIndex` y `scroll-mt-32`.
- **El orden del DOM es el orden visual:** dona, estado, Formato, Requisitos. La grilla no recoloca nada.

## Risks / Trade-offs

- [Entre 768 y 1023 px, «Formato» y «Requisitos» apilados alargan la columna derecha] → La dona queda arriba a la izquierda y no se estira. Se acepta: es más legible que dos columnas de 250 px.
- [Hoy las cajas se ponen al lado desde 640 px; ahora desde 1024 px] → En tablet bajan debajo del texto, que es lo que pidió el usuario («adapta para tablet y móvil»).

## Migration Plan

Solo cambian clases y la estructura. Para revertir, basta con volver a los tres archivos.
