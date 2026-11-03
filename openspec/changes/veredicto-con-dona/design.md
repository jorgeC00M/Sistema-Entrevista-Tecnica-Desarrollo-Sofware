## Context

`VeredictoDeLegibilidad` pinta una franja con `VEREDICTOS[nivel]` (etiqueta, título, icono, clases, tono) y una línea «Lo principal: <causa>» calculada por `veredictoDeLegibilidad` (`nivel` + `causa`). `LoQueDebesHacer` toma las 3 primeras de `debilidadesPorGravedad` (constante local `PRIMERAS = 3`). Cada campo del espejo es `detectado: boolean`; `AnalisisATS` trae `campos_detectados` y `campos_intentados`. Los colores de estado son tokens (`--color-exito-texto`, `--color-error-texto`), y `estilos.test.ts` prohíbe colores arbitrarios en las clases.

## Goals / Non-Goals

**Goals:**
- Una dona de dos estados medidos con el total en el centro.
- La regla del estado escrita en pantalla.
- Los errores como diagnóstico, compartiendo la selección con «Lo que debes hacer».

**Non-Goals:**
- Un estado «incompleto». Necesitaría una regla nueva en el backend; queda fuera por decisión del usuario.
- Cambiar la regla del veredicto, el historial o el backend.

## Decisions

**D1. La dona con `conic-gradient` en `style`, sobre variables de token.**
- `background: conic-gradient(var(--color-exito-texto) 0 <p>%, var(--color-error-texto) <p>% 100%)`, con `p = detectados / intentados · 100`.
- Un círculo interior del color de la superficie (`bg-white`) hace el agujero; dentro va «8» grande (`text-metric-counter`, mono) y «datos revisados» en `text-meta`.
- Es CSS puro, sin SVG ni librería.
- El color sale de los tokens (nada de hex sueltos), así que el guardián de estilos no lo marca: no revisa `style`, y los colores son de la paleta.
- La dona y la leyenda son `aria-hidden`; el lector de pantalla oye una frase `sr-only` con el total y las dos cantidades. (Un `role="img"` sobre un `div` lo marca el lint `prefer-tag-over-role`.)

**D2. Una leyenda en texto debajo.**
- Dos filas, «■ 6 extraídos» y «■ 2 no extraídos». El cuadro es `aria-hidden`; el texto lleva la información.
- Con 0 en un estado, la fila se mantiene («0 no extraídos»), así el lector ve los dos estados siempre.

**D3. La regla de cada nivel vive en `VEREDICTOS`.**
- Se agrega `regla` a cada nivel, junto a la etiqueta y el título, en el único mapa de nombres.
- El texto describe exactamente las condiciones de `veredictoDeLegibilidad`. Un test verifica que los tres niveles la tengan.

**D4. `correccionesPrioritarias(debilidades)` en `hallazgos.ts`.**
- Devuelve las 3 primeras por gravedad.
- La usan `LoQueDebesHacer`, que muestra la acción con `accionDe`, y el bloque «Formato», que muestra el `titulo` (el diagnóstico) con el icono de su severidad (`SEVERIDADES[...].icono`).
- Así los dos bloques no pueden discrepar sobre cuáles son.
- La constante local `PRIMERAS` se borra.

**D5. `causa` queda sin uso y se quita.**
- `veredictoDeLegibilidad` devuelve solo `{ nivel }`. La línea «Lo principal» era su único consumidor.
- Los tests que comprobaban `causa` se reescriben, y el que nombraba la causa se convierte en uno de `correccionesPrioritarias`.

**D6. La disposición del banner.**
- Es una sola `Tarjeta` con una grilla `sm:grid-cols-[auto_1fr]` y `gap-5`: la dona con su leyenda a la izquierda y el texto a la derecha. En el celular se apilan.
- El color de estado tiñe solo la etiqueta (`VEREDICTOS[nivel].clases` en un chip) y la dona. El banner deja de ser un bloque de color entero, así el pico del Resumen no es la alarma.

## Risks / Trade-offs

- **[Riesgo]** En el dirigido, la columna izquierda mide unos 600 px: la dona y el texto lado a lado pueden quedar apretados. → **Mitigación:** la dona mide 120 px, y el texto se parte en líneas.
- **[Trade-off]** El bloque «Formato» y «Lo que debes hacer» nombran los mismos errores. Uno dice qué pasa y el otro qué hacer. Es la distinción que el usuario aprobó.
