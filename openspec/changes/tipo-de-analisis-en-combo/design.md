## Context

`tipo-de-analisis-e-historial-en-tabla` puso el tipo como dos tarjetas-radio (`EleccionDeTipo`, con `clasesDeOpcion` compartida con `EleccionDeVia`) en la columna derecha de una grilla `lg:grid-cols-2`. El CV y la convocatoria se apilaban a la izquierda, y la grilla movía el tipo con `lg:col-start-2 lg:row-start-1 lg:row-span-2`. Jorge aprobó un boceto con el tipo arriba, en un combo, y el CV y la convocatoria lado a lado.

## Goals / Non-Goals

**Goals:**
- Un combo de fila completa arriba, con el CV y la convocatoria en la fila de abajo.
- Que el CV no se mueva al cambiar de tipo.
- Un solo orden (DOM = visual) en todos los anchos.
- Borrar lo que quede sin uso.

**Non-Goals:**
- Tocar el historial, el resultado, el backend o el API.
- Cambiar `ZonaDeArchivo` o `CampoConvocatoria`.

## Decisions

**D1. `<select>` nativo a través de `CampoSelect`, no un combo propio.**
- `CampoSelect` ya da la etiqueta visible, el `appearance-none` con el chevron, la ayuda con `aria-describedby` y el selector del sistema en el celular. Es el mismo control que «Nueva entrevista».
- Usa `marcador={null}`, porque siempre hay un valor.
- La etiqueta de cada opción es `tipoDeRevision(...)` + « · » + la pregunta. Así el nombre sigue siendo el mismo que en la barra del resultado y en el historial.
- La `ayuda` es el `detalle` de la opción elegida.
- *Alternativa descartada:* un listbox propio. Habría que reimplementar el teclado y el lector de pantalla que el `<select>` ya trae.

**D2. «Análisis general» por defecto.**
- Lo decidió el usuario.
- El combo es lo primero de la pantalla y muestra la opción elegida, así que quien quiere el dirigido lo ve antes de subir nada.
- `tipo` deja de admitir `null` en `CurriculumPage`, `EntradaDelAnalisis`, `EleccionDeTipo` y `faltaParaAnalizar`, y desaparece la rama «Elige un tipo de análisis.».

**D3. Media fila fija para el CV.**
- La grilla queda `lg:grid-cols-2`, con el combo en `lg:col-span-2`, el CV en la columna 1 y la convocatoria en la columna 2 (solo en dirigido).
- Sin `items-start`, las dos tarjetas de la fila se estiran a la misma altura (`stretch` por defecto), que es el «mismo tamaño» pedido.
- El orden del DOM ya es el visual, así que se quitan todas las colocaciones `lg:col-start-*`, `lg:row-start-*` y `lg:row-span-*`.

**D4. Se devuelve `clasesDeOpcion` a `EleccionDeVia`.**
- Se extrajo para compartirla entre dos componentes; con uno solo es una indirección sin beneficio.
- El `className` vuelve a ser una constante local de `EleccionDeVia.tsx` y `components/ui/estilosDeOpcion.ts` se borra.
- `estilos.test.ts` no tenía excepción para ese archivo, así que no hay nada que quitar allí.

## Risks / Trade-offs

- **[Riesgo]** Con «general» preelegido, alguien que quería comparar con un aviso puede analizar sin él. → **Mitigación:** el combo está arriba y lo dice. Además, el Resumen del general ofrece «Compara con una convocatoria», que cambia a dirigido y lleva el foco a la convocatoria, que ahora está a la derecha.
- **[Trade-off]** En «general» queda media fila vacía a la derecha del CV. Se acepta para que el CV no salte al cambiar de tipo.
