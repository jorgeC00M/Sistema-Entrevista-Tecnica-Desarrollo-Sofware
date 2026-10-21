## Why

En "Historial y progreso", la sección "Tus entrevistas" es una lista de filas de texto ("Backend · Junior · Django" más la fecha) sin columnas ni límite. Con muchas entrevistas, cuesta comparar fechas, notas y estados, y la página crece sin fin. El usuario pidió una tabla con columnas fijas, 10 filas por página y paginación debajo a la derecha. El 21-10-2026 aprobó las columnas, la paginación, la vista móvil y el estilo.

## What Changes

- **"Tus entrevistas" pasa de lista a tabla** dentro de la tarjeta de vidrio, con estas columnas:
  - **Fecha:** de inicio, como `21/10/2026`.
  - **Puesto.**
  - **Tecnología:** «React + Node.js» en Full Stack, y «—» si la entrevista no tiene.
  - **Nivel.**
  - **Puntuación:**
    - finalizada: la nota redondeada;
    - abandonada con respuestas calificadas: la nota parcial («48 · parcial»);
    - en curso, o abandonada sin respuestas calificadas: «—».
  - **Estado:** el `Badge` de siempre.
  - **Acción:** «Ver resultados» o «Continuar», según el estado.
- **La columna «Área técnica» que se pidió no se incluye.** Una entrevista recorre varias áreas, porque el puesto las fija pregunta por pregunta, así que no tiene un valor único. El usuario aprobó «Puesto» y «Tecnología» en su lugar.
- **10 filas por página**, con paginación debajo de la tabla:
  - a la izquierda, «Mostrando 11–20 de 47»;
  - a la derecha, ‹ y › y como máximo 3 números de página consecutivos, con la actual al centro.
  - Con 10 entrevistas o menos, no se muestra paginación. La página actual vive en la URL (`?pagina=2`), así que se conserva al volver desde unos resultados.
- **Móvil (menos de 640 px):** cada fila se apila como una tarjeta con sus datos uno debajo del otro, sin scroll horizontal.
- **Dos componentes reutilizables nuevos** en `components/ui/`:
  - `Tabla`: columnas declaradas, con versión de tarjeta para móvil;
  - `Paginacion`: la lógica de qué páginas mostrar vive en una función pura, probada con Vitest.

  La sección del historial solo declara las columnas. Además, los botones de página tienen que vivir en `components/ui/`, porque `estilos.test.ts` prohíbe un `<button` fuera de esa carpeta.
- **API:** `GET /api/entrevistas/` agrega `puntuacion_parcial`.
  - Es la media de las respuestas calificadas de una entrevista `ABANDONADA`, calculada en la misma consulta que ya cuenta `preguntas_calificadas`.
  - Es `null` en cualquier otro estado. En particular, **nunca** trae valor para una `EN_PROGRESO`: la nota no se publica antes de terminar.

## Capabilities

### New Capabilities

- `historial-de-entrevistas`: cómo se lista al usuario su historial de entrevistas: columnas, nota parcial, paginación y vista móvil.

### Modified Capabilities
<!-- Ninguna. -->

## Impact

- **Backend:**
  - `apps/entrevistas/selectors.py::_con_conteo`, que gana una anotación `Avg`;
  - `apps/entrevistas/serializers.py::EntrevistaSerializer`, que gana el campo `puntuacion_parcial`;
  - tests en `apps/entrevistas/tests/`.

  El campo es aditivo: los clientes existentes no cambian.
- **Frontend:**
  - componentes nuevos: `components/ui/Tabla.tsx`, `components/ui/Paginacion.tsx` y `lib/paginacion.ts`, con su test;
  - `features/historial/components/ListaEntrevistas.tsx`, que pasa a ser `TablaDeEntrevistas.tsx`;
  - `features/historial/pages/HistorialPage.tsx`;
  - `types/entrevista.ts`.
- **Sin cambios:**
  - la caché `historial` que comparte el sidebar ("Continuar");
  - los gráficos;
  - el resto de pantallas.
