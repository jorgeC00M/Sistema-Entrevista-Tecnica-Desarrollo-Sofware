## Why

En "Historial y progreso", lo que el usuario viene a hacer es encontrar una entrevista. Sin embargo, la parte de arriba la ocupan dos gráficos que no ayudan a eso:

- **«Promedio por área»** repite el desglose por área que ya muestra Retroalimentación (`RepartoPorBandas`).
- **«Evolución en el tiempo»** une en una sola línea puestos y niveles distintos. Un 80 en Frontend Junior seguido de un 55 en Backend Senior parece un retroceso y no lo es. Además repite colores entre Móvil, Escritorio, QA y Videojuegos.

El usuario aprobó (21-10-2026) la recomendación:
- quitar «Promedio por área»;
- poner un buscador encima de la tabla;
- conservar la evolución debajo, pero de un puesto y nivel a la vez.

Con eso, el Alcance de la tesis («analizar su progreso a lo largo del tiempo») sigue demostrado sin tocar el documento. También pidió quitar el código muerto que deje el cambio.

## What Changes

- **Buscador encima de la tabla de "Tus entrevistas":**
  - un campo de texto que busca en puesto, tecnología y nivel, sin distinguir mayúsculas ni tildes;
  - un selector de Estado: Todos, Finalizada, En curso o Abandonada;
  - un selector de Nivel: Todos los niveles y los del catálogo. Con un nivel elegido, la evolución muestra solo esa tarjeta.

  Filtra al escribir, y la paginación cuenta solo los resultados. Muestra solo sus botones, sin el texto «Mostrando X–Y de N»; el número de página se anuncia solo al lector de pantalla. Los filtros viven en la URL (`?q=`, `?estado=`, `?nivel=`) junto a `?pagina=`, y cambiar un filtro vuelve a la página 1. Si nada coincide, se muestra un mensaje y «Limpiar búsqueda».
- **«Evolución en el tiempo» pasa debajo de la tabla, en tres tarjetas, una por nivel** (Junior, Semi-Senior y Senior). Esto reemplaza la primera versión aplicada, de una sola serie con selector, que se revisó el 21-10-2026:
  - van en una fila desde 1280 px de ventana y apiladas por debajo; siempre las tres, y la vacía con su mensaje;
  - **una línea por puesto, con un color fijo por puesto** (paleta Okabe-Ito, apta para daltonismo, como tokens), una sola leyenda y la misma escala 0–100 en las tres;
  - **el eje es el número de entrevista**, no el calendario: diez entrevistas en una semana no se aplastan, y un salto de más de 90 días se marca con una línea punteada;
  - **todos los puntos se ven igual**, sin distinguir el origen; al pasar el puntero o enfocarlo con Tab aparece un cuadro con Fecha, Puesto, Tecnología y Puntaje;
  - **los gráficos siguen a la tabla:** se arman con las entrevistas que muestra después de filtrar;
  - no hay frase de lectura en pantalla, solo un resumen para lectores de pantalla.
- En la tabla aparece una etiqueta «Convocatoria» junto al puesto. **No hay filtro de origen:** se probó y se retiró a pedido del usuario el 21-10-2026.
- **Se quita «Promedio por área»** de esta página. El desglose por área sigue en Retroalimentación.
- **API:**
  - **BREAKING (interno):** se elimina `GET /api/estadisticas/`. Primero perdió `promedio_por_area` y `evolucion`, y al quitar las cifras del encabezado quedó sin consumidor. `GET /api/estadisticas/retroalimentacion/` no cambia.
- **Código muerto que se elimina:**
  - `ComparativaAreas.tsx`;
  - el tipo `PromedioPorArea` y `Estadisticas.promedio_por_area`;
  - el cálculo `promedio_por_area` en `calcular_estadisticas` y sus 3 tests;
  - `COLORES_PUESTO`, `COLOR_POR_DEFECTO` y la leyenda por puesto de `GraficoProgreso`;
  - la excepción de `GraficoProgreso.tsx` en `estilos.test.ts`, que deja de hacer falta (el test exige quitar las excepciones sobrantes);
  - los imports y agregados que queden sin uso.
- **Se reorganiza:**
  - `CampoSelect` pasa de `features/seleccion/components/` a `components/ui/`, porque ahora lo usan dos pantallas;
  - vuelve el trazo `buscar` (Tabler `search`), que la limpieza anterior había quitado por no tener uso.
- **Encabezado:** bajo «Historial y progreso» va solo la descripción «Revisa tus entrevistas anteriores y sigue cómo evoluciona tu puntaje en cada puesto y nivel.», sin «N entrevistas registradas» ni «N completadas · promedio general X» (aprobada por el usuario el 21-10-2026).
- **Sin cambios:** el texto de la columna Acción y el nombre de la pestaña.

## Capabilities

### New Capabilities
<!-- Ninguna. -->

### Modified Capabilities
<!-- Ninguna en `openspec/specs/`. Los requisitos se añaden a la capability `historial-de-entrevistas`, que introduce el cambio activo `tabla-de-historial` y que aún no está archivada. Por eso su delta va como ADDED en la misma ruta. -->

- `historial-de-entrevistas`: añade la búsqueda, el filtro de estado, la evolución por puesto y nivel y la ausencia de «Promedio por área». Va como requisitos ADDED, ver la nota anterior.

## Impact

- **Backend:**
  - `apps/evaluaciones/selectors.py::calcular_estadisticas`;
  - `apps/evaluaciones/tests/test_evaluaciones.py`.
- **Frontend:**
  - `features/historial/`: `HistorialPage`, `TablaDeEntrevistas`, `GraficoProgreso`, el nuevo `historial.ts` con su test, y se borra `ComparativaAreas`;
  - `components/ui/`: el nuevo `CampoBusqueda`, `CampoSelect` movido aquí y `trazosDeIconos.ts`;
  - `lib/texto.ts`, nuevo;
  - `types/evaluacion.ts`;
  - `estilos.test.ts`;
  - los imports de `CampoSelect` en `features/seleccion/`.
- **Documentación:** CLAUDE.md, en "Statistics group by `intercambio__area`", "`evolucion` is per interview" y la lista de componentes base.
- **Orden:** conviene archivar `tabla-de-historial` tras su prueba manual antes de aplicar este cambio, aunque no es obligatorio.
