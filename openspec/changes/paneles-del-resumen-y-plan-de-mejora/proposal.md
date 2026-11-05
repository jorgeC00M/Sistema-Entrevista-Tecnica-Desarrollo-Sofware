## Why

En el banner del Resumen, la dona, su leyenda, el estado y «Formato» comparten una sola tarjeta. En el dirigido, además, «Requisitos de la oferta» está dentro de esa misma tarjeta. Cada parte responde una pregunta distinta y, puestas en una tarjeta, se leen como un solo bloque.

«Requisitos de la oferta» repite «No se detectó» en cada fila.

En «Plan de Mejora», las cajas AHORA / DESPUÉS ocupan una columna fija de 16rem que, en escritorio, queda angosta frente al texto del arreglo.

## What Changes

- **Resumen, en los dos tipos de análisis:** la dona con su leyenda («extraídos, incompletos, no extraídos») pasa a su propio panel, a la izquierda.
- **Resumen general:** a la derecha va otro panel con el estado (etiqueta, título y regla) y «Formato».
- **Resumen dirigido:** a la derecha, el estado va arriba, en su panel; debajo, «Formato» y «Requisitos de la oferta» van en dos paneles separados, lado a lado, como hoy.
- **«Requisitos de la oferta»:** «No se detectó:» aparece una sola vez, como encabezado. Debajo va una fila por requisito, con su chip y su tipo, y al final la nota.
- **«Plan de Mejora» → «Arreglar el formato»:** en cada fila, el texto del arreglo ocupa 2/3 y AHORA / DESPUÉS 1/3, desde 1024 px. En tablet y celular, las cajas bajan debajo del texto.
- **Separación entre paneles:** 24 px desde 1024 px y 16 px por debajo; todo se apila en pantallas angostas.
- **«Palabras clave no detectadas» no cambia.** Tampoco cambian la dona, el estado ni lo que se mide.

## Capabilities

### New Capabilities
- `revision-de-cv`: no tiene spec principal; la delta agrega la disposición en paneles del banner y la proporción de los arreglos.

### Modified Capabilities
<!-- Ninguna con spec principal. Se ajusta la delta sin archivar de `vista-dirigida-resumen-match-y-plan` (bloques del panel derecho y «No se detectó» por fila). -->

## Impact

- **Frontend:**
  - `features/curriculum/components/VeredictoDeLegibilidad.tsx`, que se divide en paneles y hace que el slot `requisitos` sea un panel propio;
  - `RequisitosNoDetectados.tsx`, con su propia `Tarjeta` y el encabezado único;
  - `ArreglosDeFormato.tsx`, con la grilla `lg:grid-cols-[2fr_1fr]`.
- **Spec:** `vista-dirigida-resumen-match-y-plan`.
- **`CLAUDE.md`.**
- Sin cambios en el backend.
