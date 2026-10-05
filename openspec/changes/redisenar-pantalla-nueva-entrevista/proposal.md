## Why

La pantalla de nueva entrevista creció por acumulación: cuando el egresado elegía
un área suelta era corta, y al pasar al modelo de puesto se le fueron añadiendo
tarjetas con la lista de temas, un selector de nivel con su propia explicación, un
control de tecnología y una tarjeta de resumen. Hoy son cinco bloques apilados en
una sola columna, con el mismo dato repetido en tres sitios, los tres puestos
partidos en dos filas —así que no se pueden comparar de un vistazo— y la acción
principal al final del scroll.

Además la pantalla miente: el resumen promete "evaluación y retroalimentación
inmediata de la IA tras cada respuesta", algo que dejó de ser cierto cuando la
calificación pasó a publicarse solo al terminar la entrevista.

## What Changes

- La lista de **temas que cubre** cada puesto deja de repetirse en las tres
  tarjetas y se muestra una sola vez, en el panel lateral, para el puesto
  elegido. Esto es lo que permite adelgazar las tarjetas.
- Las tarjetas de puesto pasan de una rejilla de dos columnas a **una sola fila**,
  para que los tres puestos se comparen simultáneamente.
- **Nivel y tecnología** se reparten una fila en lugar de apilarse.
- Aparece un **panel de sesión pegajoso** que resume lo elegido y contiene la
  acción de comenzar, de modo que el botón siempre esté alcanzable sin hacer
  scroll. En pantallas estrechas se presenta como barra inferior fija.
- Mientras falten elecciones, el panel **dice qué falta** en vez de limitarse a
  mostrar un botón deshabilitado sin explicación.
- Se corrige el texto que anunciaba retroalimentación inmediata: ahora anuncia que
  la calificación aparece al terminar, igual que ya hace la pantalla de la
  entrevista.
- Desaparece la tarjeta "Resumen de la sesión", cuyo contenido absorbe el panel.

No hay cambios de contrato: las tres decisiones (puesto, nivel, tecnología) y la
llamada que crea la entrevista son las mismas. Nada es **BREAKING**.

Se evaluó y **se descartó convertir la pantalla en una ventana emergente**: el
contenido obligaría a hacer scroll dentro del modal, la ruta ya es un destino real
del sidebar y de la landing —un modal perdería la URL y lo elegido al recargar—,
en móvil un modal se vuelve pantalla completa de todos modos, y empezar una
entrevista con cronómetro no es una acción incidental.

## Capabilities

### New Capabilities

- `seleccion-area`: requisitos sobre **cómo se presentan** las elecciones que
  configuran una entrevista — comparabilidad de las opciones de puesto,
  visibilidad permanente de la acción principal, no duplicación de la
  información de cada opción, y veracidad de lo que la pantalla promete sobre
  cuándo llega la calificación.

  Dos aclaraciones sobre esa ruta. **El nombre es histórico**: hoy se elige un
  puesto, no un área suelta, pero se conserva la ruta para no crear un
  casi-duplicado. Y figura como *New* y no como *Modified* porque
  `openspec list --specs` no devuelve nada: aún no hay ninguna capacidad
  publicada en `openspec/specs/`, la ruta existe solo dentro del change en vuelo
  `completar-migracion-arquitectura`. Por eso este delta usa `ADDED` — añade
  concerns de presentación sin alterar ningún requisito publicado. Al archivar,
  ambos deltas confluyen en la misma capacidad.

### Modified Capabilities

Ninguna.

## Impact

Solo frontend, y solo la carpeta `frontend/src/features/seleccion/`:

- `pages/SeleccionPuestoPage.tsx` — rejilla de dos columnas, reparto de bloques.
- `components/TarjetaPuesto.tsx` — pierde las props `areas` y `totalPreguntas`.
- `components/SelectorNivel.tsx` — se compacta para caber en media fila.
- `components/PanelDeSesion.tsx` — nuevo.

Sin cambios en el backend, en `api/entrevistas.ts` ni en el catálogo que consume
`hooks/useCatalogos.ts`. No se añade ninguna dependencia: el panel se construye
con las primitivas que ya existen en `components/ui/` (`Tarjeta`, `Boton`,
`EtiquetaMono`, `Icono`).
