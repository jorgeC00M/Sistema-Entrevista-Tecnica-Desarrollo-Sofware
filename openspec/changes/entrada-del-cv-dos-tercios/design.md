## Context

`EntradaDelAnalisis` pinta, dentro del panel de pestañas, una grilla `grid gap-5 lg:grid-cols-2`: «Tu CV» y, al lado, «Qué revisamos» (general) o «Convocatoria» (dirigido). «Qué revisamos» es una `<ul>` de 3 puntos en `text-sm`. Los tokens de texto disponibles son `headline-md` (20 px, serif), `text-sm` (14 px) y `text-meta` (13 px); los colores son `vidrio-ink` (títulos) y `vidrio-muted` (secundario, que cumple 4,5:1).

## Goals / Non-Goals

**Goals:**
- Una fila 2fr / 1fr, igual en las dos pestañas, con la misma altura y 24 px de separación.
- Una jerarquía de tres niveles en «¿Qué revisamos?» sin tokens nuevos.

**Non-Goals:**
- Cambiar el contenido medido, la lógica, las pestañas o la tarjeta «Convocatoria».

## Decisions

**D1. `lg:grid-cols-[2fr_1fr]` con `gap-6`.**
- Es la proporción literal que pidió el usuario, y `gap-6` son 24 px.
- Al no llevar `items-start`, las tarjetas se estiran a la misma altura (`stretch`).
- `estilos.test.ts` solo prohíbe sombras, radios, tamaños de texto y colores arbitrarios, no las columnas.
- *Alternativa equivalente:* `lg:grid-cols-3` con `lg:col-span-2` en «Tu CV». Queda como plan B si el guardián lo rechazara.

**D2. La misma rejilla en el dirigido.**
- Lo decidió el usuario, y mantiene la regla anterior: el CV no se mueve al cambiar de pestaña.
- La convocatoria en 1/3 mide unos 320 px a 1280 px. Su `textarea` se redimensiona en vertical y el control segmentado cabe.

**D3. `<dl>` para «¿Qué revisamos?».**
- Cada bloque es un término y su descripción: `dt` lleva el subtítulo en `text-sm font-semibold text-vidrio-ink` y `dd` el detalle en `text-meta text-vidrio-muted`.
- Un `div` por par mantiene el `dl` válido, como en `EspejoDelATS`.
- El título es el `h2` en `font-serif text-headline-md`, igual que «Tu CV».
- Son tres niveles hechos con tokens existentes.

## Risks / Trade-offs

- **[Riesgo]** En el dirigido, una convocatoria larga pegada en 1/3 obliga a hacer más scroll dentro del cuadro. → **Mitigación:** el cuadro es redimensionable y el usuario aceptó el trade-off al elegir la misma rejilla.
