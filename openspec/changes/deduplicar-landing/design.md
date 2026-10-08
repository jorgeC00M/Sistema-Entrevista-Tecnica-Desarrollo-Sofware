## Context

Ver `proposal.md`. Hallazgos de la revisión (búsqueda del marcado repetido):

- `mb-4 flex h-11 w-11 items-center justify-center rounded-control` + `h3` +
  `p` aparece en `QueRecibes.tsx` (fortalezas, debilidades, y el `map` de
  sugerencias/progreso) y en `RevisaTuCV.tsx`. `ComoFunciona.tsx` usa una
  variante con número de paso: no se fuerza en el mismo componente.
- `<p ...><Icono nombre="info" .../>…</p>` idéntico en `QueRecibes.tsx` y
  `RevisaTuCV.tsx`. (`AvisoDeRevision.tsx` del módulo de CV tiene otro estilo y
  propósito: queda fuera.)
- `new Map(areas.map(a => [a.codigo, a.nombre]))` en `PuestosDisponibles.tsx` y
  `SeleccionPuestoPage.tsx`.
- Los dos `Link` + `Boton` de registro/login en `Hero.tsx` y `CierreCTA.tsx`.

## Goals / Non-Goals

**Goals:** una sola definición de cada patrón repetido; añadir una tarjeta o
sección nueva sin copiar marcado.

**Non-Goals:** cambiar textos, colores o espaciados; tocar `ComoFunciona` (su
tarjeta es distinta); refactorizar fuera de la landing salvo el helper de áreas.

## Decisions

- **D1. `components/TarjetaDeFuncion.tsx`** en `features/landing/components/`:
  props `icono`, `colorIcono` (clases), `titulo`, `texto`, `className?`. Usa
  `CLASES_TARJETA_ELEVADA`. `QueRecibes` y `RevisaTuCV` pasan a recorrer
  arreglos de datos.
- **D2. `components/NotaAclaratoria.tsx`**: `children`; el mismo `p` con icono
  de info.
- **D3. `lib/catalogos.ts::nombresDeAreas(areas): Map<string, string>`**: vive en
  `lib/` y no en `features/landing/` porque la usan dos features.
- **D4. `components/AccionesDeRegistro.tsx`**: los dos botones con sus clases
  actuales; el contenedor (márgenes, centrado) queda en cada sección porque es
  lo único que difiere.
- **D5.** Verificación por igualdad visual: los componentes reproducen
  exactamente las clases actuales; no se introducen estilos nuevos.

## Risks / Trade-offs

- [Un componente con demasiadas props por querer cubrir variantes] → solo se
  extrae lo idéntico; `ComoFunciona` y la tarjeta grande de `QueRecibes` (con
  el medidor) quedan como están.
