## 1. Backend: estadísticas

- [x] 1.1 En `apps/evaluaciones/selectors.py::calcular_estadisticas`, añade `nivel` y `nivel_display` a cada punto de `evolucion` (design D6). Añade un test en `apps/evaluaciones/tests/test_evaluaciones.py` que compruebe que un punto de Backend · Junior trae `nivel: "junior"` y su nombre. Verifica que `python manage.py test apps.evaluaciones` pasa.
- [x] 1.2 Elimina `por_area` y la clave `promedio_por_area` de `calcular_estadisticas`, y `Count` del import si queda sin uso. Borra `test_promedio_por_area_desglosa_los_temas_de_la_entrevista` y los asserts de `promedio_por_area` de las líneas 69, 120 y 125: si protegen otra cosa del mismo test, reescríbelos sobre esa cosa. Añade un assert de que la respuesta no tiene la clave.

  Verifica:
  - que `grep -rn promedio_por_area backend --include=*.py --exclude-dir=.venv` no devuelve nada;
  - que `python manage.py test apps.evaluaciones` pasa;
  - que los tests de Retroalimentación (`calcular_retroalimentacion` y su `por_area`) no se tocaron.

## 2. Frontend: lógica pura

- [x] 2.1 Crea `lib/texto.ts` con `normalizarParaBuscar(texto)`: minúsculas, NFD sin diacríticos y `trim`.
- [x] 2.2 Crea `features/historial/historial.ts` con `filtrarEntrevistas`, `estadoDesdeURL` y `seriesPorPuestoYNivel` (design D1 y D6), y su test `historial.test.ts`. Casos:
  - «django» encuentra por tecnología;
  - «SENIOR» y «senior» dan lo mismo;
  - «movil» encuentra «Móvil»;
  - texto y estado se combinan;
  - un texto vacío no filtra;
  - un estado desconocido equivale a `'todos'`;
  - las series descartan combinaciones con menos de 2 puntos;
  - las series se ordenan por cantidad y luego por la fecha más reciente;
  - la etiqueta es «Puesto · Nivel».

  Verifica que `pnpm test` pasa.

## 3. Frontend: componentes

- [x] 3.1 Mueve `CampoSelect.tsx` de `features/seleccion/components/` a `components/ui/` y actualiza sus imports. Haz condicional al `marcador` la opción deshabilitada «Selecciona…», si no lo es ya. Verifica:
  - que `grep -rn "seleccion/components/CampoSelect" frontend/src` no devuelve nada;
  - que `tsc` pasa;
  - que, a mano, los selects de Nueva entrevista siguen mostrando «Selecciona…».
- [x] 3.2 Restaura el trazo `buscar` (Tabler `search`: `M3 10a7 7 0 1 0 14 0a7 7 0 1 0 -14 0M21 21l-6 -6`) en `trazosDeIconos.ts`.
- [x] 3.3 Crea `components/ui/CampoBusqueda.tsx` según design D5. Verifica que `tsc` pasa y que `estilos.test.ts` está en verde.
- [x] 3.4 Añade a `Paginacion` las props `sustantivo` y `rangoSiempre` (design D3), sin cambiar el comportamiento cuando no se pasan. Verifica que `tsc` y `pnpm test` pasan.

## 4. Frontend: historial

- [x] 4.1 Haz que `TablaDeEntrevistas` lea `?q=` y `?estado=` (design D2), filtre con `filtrarEntrevistas`, pinte `CampoBusqueda` y el `CampoSelect` de Estado, y vuelva a la página 1 al cambiar un filtro. Con un filtro activo, debe pasar `sustantivo="resultados"` y `rangoSiempre` a `Paginacion`, y pintar el estado vacío con «Limpiar búsqueda» (design D4). Verifica que `tsc` pasa.
- [x] 4.2 Reescribe `GraficoProgreso`: una sola serie con el selector «Puesto y nivel», la frase de lectura y el mensaje sin series (design D6). Elimina `COLORES_PUESTO`, `COLOR_POR_DEFECTO`, la leyenda y la excepción de `GraficoProgreso.tsx` en `estilos.test.ts`. Añade `nivel` y `nivel_display` a `PuntoDeEvolucion`. Verifica:
  - que `grep -rn "COLORES_PUESTO\|COLOR_POR_DEFECTO" frontend/src` no devuelve nada;
  - que `pnpm test` pasa, incluida la prueba de excepciones sobrantes de `estilos.test.ts`.
- [x] 4.3 Reordena `HistorialPage` según design D7 y quita `ComparativaAreas`. Borra `ComparativaAreas.tsx`, `PromedioPorArea` y `Estadisticas.promedio_por_area`. Verifica:
  - que `grep -rn "ComparativaAreas\|PromedioPorArea\|promedio_por_area" frontend/src` no devuelve nada;
  - que `tsc`, `pnpm test`, `lint` (sin avisos nuevos sobre la base de 5) y `build` pasan.

## 5. Documentación y verificación

- [x] 5.1 *(El total de tests se actualiza en la 6.9, porque el grupo 6 lo cambia.)* Actualiza CLAUDE.md:
  - en "Statistics group by `intercambio__area`", que el desglose por área vive solo en Retroalimentación;
  - en "`evolucion` is per interview…", que ahora es una serie por puesto y nivel, con la misma regla que `anterior_comparable`;
  - en la lista de componentes base, `CampoBusqueda` y `CampoSelect` en `components/ui/`;
  - en el párrafo de "Nueva entrevista", la ruta de `CampoSelect`;
  - el número de tests.

  Verifica con `grep -n "CampoBusqueda\|promedio_por_area" CLAUDE.md`, donde `promedio_por_area` no debe aparecer.
- [x] 5.2 *(Hecha: 534 tests del backend en verde, `makemigrations --check` sin cambios y frontend en verde.)* Ejecuta la suite completa: `python manage.py test` en verde, `makemigrations --check` sin cambios, y `tsc`, `pnpm test`, `lint` y `build` en verde.
- [ ] 5.3 *(Se hace junto con la 6.11, ya con los gráficos nuevos.)* Haz una prueba manual con `IA_PROVEEDOR=fake`:
  1. Busca «django», «senior», «SENIOR» y «movil».
  2. Filtra por Abandonada, y combina un texto con un estado.
  3. Busca algo sin resultados y pulsa «Limpiar búsqueda».
  4. Con un filtro activo en la página 2, abre unos resultados y vuelve: se conservan `q`, `estado` y `pagina`.
  5. Usa el selector de evolución y comprueba que solo ofrece combinaciones con 2 o más finalizadas y que la frase cuadra.
  6. Revisa la vista a 375 px.
  7. Comprueba que Retroalimentación sigue mostrando las áreas.
- [ ] 5.4 No hagas commit. El usuario lo hará tras revisar.

## 6. Revisión: evolución en tres tarjetas por nivel (design D9)

- [x] 6.1 **Backend.**
  - Añade `convocatoria` (id o `null`) a `EntrevistaSerializer` y a sus `Meta.fields`, con un test en `apps/entrevistas/tests/test_historial_tabla.py`: una entrevista iniciada con una convocatoria llega con su id, y una personalizada con `null`.
  - Elimina `evolucion` de `calcular_estadisticas` y actualiza su docstring.
  - Borra `test_dos_entrevistas_del_mismo_puesto_muestran_variacion`, `test_la_evolucion_identifica_cada_entrevista_por_su_puesto`, `test_la_evolucion_trae_el_nivel` y `test_evolucion_esta_ordenada_cronologicamente`.
  - Añade un assert de que la respuesta no tiene `evolucion`.

  Verifica:
  - que `grep -rn '"evolucion"' backend/apps --include=*.py` solo encuentra ese assert;
  - que `python manage.py test apps.evaluaciones apps.entrevistas` pasa.
- [x] 6.2 **Lógica pura** en `historial.ts`:
  - `origenDesdeURL` y el parámetro `origen` de `filtrarEntrevistas`;
  - `evolucionPorNivel`, `marcasDelEje` y `DIAS_DE_SALTO`, según design D9;
  - elimina `seriesPorPuestoYNivel`, `lecturaDeSerie` y `SerieDeEvolucion`, con sus tests.

  Añade `convocatoria: number | null` al tipo `Entrevista`. Casos de test:
  - el filtro de origen, solo y combinado;
  - la agrupación por nivel en el orden del catálogo y, dentro, por puesto en el orden del catálogo;
  - solo finalizadas con nota;
  - la numeración 1..n por serie, en orden de `fecha_fin`;
  - `saltoAntes` con 91 días sí y con 90 no;
  - `intentoDeConvocatoria` 1 y 2 para la misma convocatoria, y 1 para otra distinta;
  - la variación entre dos entrevistas del mismo puesto y nivel (reemplaza el test de backend borrado);
  - `marcasDelEje(5)` da `[1..5]` y `marcasDelEje(12)` da `[1, 5, 10, 12]`.

  Verifica que `pnpm test` pasa.
- [x] 6.3 **Colores.** Añade los 7 tokens `--color-puesto-<codigo>` de design D9 a `styles/tokens.css`, y `lib/puestos.ts::colorDePuesto` con su test (un puesto conocido y uno desconocido). Verifica que `pnpm test` pasa, incluido `estilos.test.ts`.
- [x] 6.4 **Filtrado en la página.** Sube la lectura de `?q=`, `?estado=` y `?origen=` y el cálculo de la lista filtrada a `HistorialPage`, o a un hook `useFiltrosDeHistorial`. `TablaDeEntrevistas` pasa a recibir la lista filtrada, los valores y los cambiadores. Añade el `CampoSelect` de Origen (con las mismas reglas de URL que Estado) y la etiqueta «Convocatoria» junto al puesto, en la tabla y en la tarjeta móvil. Verifica que `tsc` pasa.
- [x] 6.5 **`GraficoDeNivel.tsx`** según design D9:
  - escala fija;
  - una línea por puesto;
  - puntos rellenos o huecos;
  - `<title>` con fecha, nota e intento de convocatoria;
  - salto punteado;
  - marcas ralas;
  - resumen `sr-only`;
  - el mensaje sin datos.

  Verifica que `tsc` y `estilos.test.ts` pasan, sin colores hex fuera de `tokens.css`.
- [x] 6.6 **`EvolucionPorNivel.tsx`:** la leyenda única y la grilla de 3 tarjetas (`xl:grid-cols-3`). Úsala en `HistorialPage` en lugar de `GraficoProgreso`, con los niveles del catálogo (`obtenerPuestos`, caché `catalogo-puestos`). Verifica que `tsc` pasa.
- [x] 6.7 **Eliminaciones**, cada una tras un grep sin otros usos:
  - `GraficoProgreso.tsx`;
  - `PuntoDeEvolucion` y `Estadisticas.evolucion`;
  - la regla `broken-image` silenciada para `GraficoProgreso.tsx` en `frontend/.impeccable/config.json`. Si queda sin entradas, borra el archivo.

  Verifica que `grep -rn "GraficoProgreso\|PuntoDeEvolucion\|seriesPorPuestoYNivel\|lecturaDeSerie" frontend/src` no encuentra nada.
- [x] 6.8 **Verificación del frontend:** `tsc --noEmit`, `pnpm test`, `pnpm run lint` sin avisos nuevos (la base son 5) y `pnpm run build`.
- [x] 6.9 **CLAUDE.md.**
  - Reescribe la viñeta de `evolucion` (de "is per interview…" a: tres tarjetas por nivel, una línea por puesto con color fijo, eje por número de entrevista, saltos, origen y que sigue a la tabla).
  - Anota que `/api/estadisticas/` queda con dos claves.
  - Añade los tokens `--color-puesto-*` a la descripción de `tokens.css`.
  - Actualiza el número de tests.

  Verifica con `grep -n "color-puesto\|EvolucionPorNivel" CLAUDE.md`.
- [x] 6.10 **Suite completa:** `python manage.py test` en verde y `makemigrations --check` sin cambios.
- [ ] 6.11 *(Se hace junto con la 7.8.)* **Prueba manual** con `IA_PROVEEDOR=fake`:
  1. Repite la 5.3.
  2. Comprueba que a 1280 px se ven 3 tarjetas en fila, y apiladas a 1024 px y a 375 px.
  3. Comprueba que la escala es la misma en las tres.
  4. Busca «backend» y comprueba que queda solo la línea de Backend en cada tarjeta.
  5. Elige «Con convocatoria» y comprueba que quedan solo los puntos huecos.
  6. Pasa el puntero por una convocatoria repetida: debe decir «2.º intento».
  7. Comprueba que un nivel sin datos muestra su mensaje.
  8. Con más de 8 entrevistas, comprueba que el eje rotula solo algunas.
- [ ] 6.12 No hagas commit. El usuario lo hará tras revisar.


## Notas de la aplicación (21-10-2026)

- **Detector de diseño:** ya no hace falta silenciarlo. El comentario de `GraficoDeNivel` que mencionaba la etiqueta de imagen se reescribió, y se borró `frontend/.impeccable/config.json` junto con la supresión que se había puesto para `GraficoProgreso.tsx`. `hook.cache.json`, en la misma carpeta, lo genera el plugin y no se tocó.
- **Vigencia del catálogo:** `VIGENCIA_DEL_CATALOGO_MS` pasó de `SeleccionPuestoPage` a `api/catalogos.ts`, para que Nueva entrevista y el historial compartan la caché `catalogo-puestos` con la misma vigencia.
- **`EtiquetaConvocatoria`:** se extrajo a `components/ui/` porque aparece en tres sitios (resumen de selección, modal de inicio y tabla del historial).
- **El test de backend borrado tiene reemplazo.** La variación entre dos entrevistas del mismo puesto ahora la prueba `historial.test.ts` (`evolucionPorNivel`).
- **Totales:** 531 tests en el backend (534 − 4 de `evolucion` + 1 de `convocatoria`), 76 en el frontend, y el lint con los mismos 5 avisos de la base.

## 7. Revisión: cuadro de detalle, puntos iguales y sin filtro de origen (design D10)

- [x] 7.1 **Backend.** Quita `convocatoria` de `EntrevistaSerializer.Meta.fields` y el test `test_el_historial_identifica_la_convocatoria` en `test_historial_tabla.py`, junto con el import de `Convocatoria` si queda sin uso. Verifica que `python manage.py test apps.entrevistas` pasa.
- [x] 7.2 **Lógica pura** en `historial.ts`:
  - quita `FiltroDeOrigen`, `ORIGENES`, `origenDesdeURL` y el parámetro `origen` de `filtrarEntrevistas`;
  - en `evolucionPorNivel`, quita `desdeConvocatoria`, `intentoDeConvocatoria` y el `Map` de intentos, y añade `tecnologia` (de `tecnologia_display`) al punto.

  Actualiza `historial.test.ts`:
  - quita los tests de origen y de intentos;
  - añade que el punto trae su tecnología, o `null` sin tecnología.

  Quita `convocatoria` del tipo `Entrevista`. Verifica que `pnpm test` pasa.
- [x] 7.3 **Filtros.** En `useFiltrosDeHistorial.ts` quita la clave `origen` (de `ClaveDeFiltro`, `SIN_FILTRO`, el retorno y `hayFiltro`). En `TablaDeEntrevistas.tsx` quita el `CampoSelect` de Origen y `OPCIONES_DE_ORIGEN`; la etiqueta «Convocatoria» de la fila se queda. Verifica que `tsc` pasa.
- [x] 7.4 **`DetalleDePunto.tsx`** según design D10:
  - posición en porcentaje y ajuste en los bordes;
  - una `dl` de 4 filas;
  - `role="tooltip"`;
  - solo tokens.

  Verifica que `estilos.test.ts` pasa.
- [x] 7.5 **`GraficoDeNivel.tsx`:**
  - todos los puntos rellenos;
  - quita la función `detalle` y el `<title>` del punto (el `<title>` del salto se conserva);
  - añade el estado del punto activo y los manejadores de puntero, foco y Esc;
  - cada punto con `tabIndex={0}`, `aria-label` con Fecha, Puesto, Tecnología y Puntaje, y `foco-anillo`;
  - el SVG va en un contenedor `relative` con `DetalleDePunto`.

  Verifica que `tsc` pasa.
- [x] 7.6 **`EvolucionPorNivel.tsx`:** quita los ítems de leyenda «personalizada» y «desde convocatoria». Verifica que `tsc` pasa.
- [x] 7.7 **Eliminaciones y documentación.**
  - Verifica que no hay resultados en `grep -rn "origenDesdeURL\|FiltroDeOrigen\|intentoDeConvocatoria\|desdeConvocatoria\|OPCIONES_DE_ORIGEN" frontend/src/features/historial frontend/src/types`. `desdeConvocatoria` puede seguir existiendo en `features/seleccion` y `features/entrevista`, donde es otra cosa.
  - En CLAUDE.md:
    - en la viñeta de evolución, el cuadro de detalle, los puntos iguales y que ya no hay origen;
    - en `CampoBusqueda`, solo el filtro de Estado;
    - el número de tests.
  - Luego ejecuta todo: `tsc`, `pnpm test`, `lint` sin avisos nuevos (la base son 5), `build`, `python manage.py test` y `makemigrations --check`.
- [ ] 7.8 *(Se hace junto con la 8.8.)* **Prueba manual** con `IA_PROVEEDOR=fake`:
  1. Haz la 6.11, sin los pasos de Origen ni de «2.º intento».
  2. Pasa el puntero por un punto: aparece el cuadro con Fecha, Puesto, Tecnología y Puntaje.
  3. Recorre los puntos con Tab: aparece el mismo cuadro, y Esc lo cierra.
  4. Junto al borde, el cuadro no se sale de la tarjeta.
  5. Todos los puntos se ven iguales, y la leyenda solo nombra los puestos.
  6. La búsqueda ya no tiene el filtro de Origen.
- [ ] 7.9 No hagas commit. El usuario lo hará tras revisar.


## Notas de la aplicación del grupo 7 (21-10-2026)

- **Roles ARIA del gráfico.** El `<svg>` pasó de `role="img"` a `role="group"`, porque `img` vuelve invisibles para el lector de pantalla los puntos, que ahora son enfocables. Cada `<circle>` lleva `role="img"` y un `aria-label` con Fecha, Puesto, Tecnología y Puntaje. La regla `jsx-a11y/prefer-tag-over-role` se desactiva en esas dos líneas, con su motivo: dentro de un SVG no existe una etiqueta HTML equivalente.
- **`fechaDelPunto`** vive en `historial.ts` y no en `DetalleDePunto.tsx`, para que ese archivo exporte solo un componente (recargado rápido).
- **`limpiar()`** borra `q` y `estado`. Un `?origen=` heredado queda en la URL, pero se ignora.
- **Totales:** 530 tests en el backend (531 − 1 de `convocatoria`), 70 en el frontend (76 − 7 de origen e intentos + 1 de tecnología del punto), y el lint con los mismos 5 avisos de la base.

## 8. Revisión: filtro de nivel, encabezado con descripción y paginación sin rango (design D11)

- [x] 8.1 **Backend.**
  - Elimina `EstadisticasView`, la ruta `""` de `apps/evaluaciones/urls.py` y `selectors.calcular_estadisticas`.
  - Ajusta el docstring de `selectors.py`.
  - En `test_evaluaciones.py`, borra los tests que solo prueban `/api/estadisticas/`: `test_sin_entrevistas_completadas`, su `test_endpoint_requiere_autenticacion`, `test_promedio_general_es_el_promedio_real_de_las_evaluaciones`, `test_entrevistas_en_progreso_no_cuentan` y `test_solo_cuenta_entrevistas_del_usuario_autenticado`.
  - Conserva los dos de desglose por área y `TrazabilidadDeLaNotaTest`, y borra las clases que queden vacías.
  - Añade un test de que `GET /api/estadisticas/` da 404 y `retroalimentacion/` da 200.
  - Reescribe la parte de `test_retroalimentacion.py:123` que compara con `/api/estadisticas/`.

  Verifica:
  - que `grep -rn "calcular_estadisticas\|EstadisticasView" backend --include=*.py --exclude-dir=.venv` no da resultados;
  - que `python manage.py test apps.evaluaciones` pasa.
- [x] 8.2 **Lógica pura.**
  - `historial.ts`: el parámetro `nivel` de `filtrarEntrevistas` y `nivelDesdeURL`.
  - Tests:
    - filtra por un nivel;
    - combina texto, estado y nivel;
    - un código desconocido o `null` equivale a `'todos'`.

  Verifica que `pnpm test` pasa.
- [x] 8.3 **Filtros.**
  - `useFiltrosDeHistorial(entrevistas, codigosDeNivel)` gana la clave `nivel`.
  - `TablaDeEntrevistas` pinta el selector de Nivel con los niveles del catálogo, y no lo pinta sin catálogo.
  - `HistorialPage` pasa los códigos y, con un nivel elegido, solo ese nivel a `evolucionPorNivel`.
  - `EvolucionPorNivel` usa `xl:grid-cols-3` solo con tres tarjetas.

  Verifica que `tsc` pasa.
- [x] 8.4 **Paginación.** Quita el rango y las props `sustantivo` y `rangoSiempre` de `Paginacion` y de su uso en `TablaDeEntrevistas`, y añade el anuncio `sr-only` «Página p de total». Verifica que `grep -rn "rangoSiempre\|sustantivo" frontend/src` no da resultados y que `tsc` pasa.
- [x] 8.5 **Encabezado.**
  - En `HistorialPage`, quita la `EtiquetaMono` de registradas y el párrafo de completadas y promedio, y pon la descripción aprobada.
  - Elimina `obtenerEstadisticas` (`api/evaluaciones.ts`), el tipo `Estadisticas` (y su mención en el comentario de `RetroalimentacionAcumulada`) y la petición `estadisticas` de `useHistorial`.
  - La evolución se muestra si hay alguna entrevista finalizada.

  Verifica que `grep -rn "obtenerEstadisticas" frontend/src` no da resultados y que `tsc` pasa.
- [x] 8.6 **Verificación del frontend:** `tsc`, `pnpm test`, `lint` sin avisos nuevos (la base son 5) y `build`.
- [x] 8.7 **CLAUDE.md.**
  - Reescribe la mención de `/api/estadisticas/` (ya no existe; queda `retroalimentacion/`).
  - Añade el filtro de Nivel y la paginación sin rango.
  - Revisa "Statistics are computed in the database": su `calcular_estadisticas` ya no existe, así que la sección pasa a hablar solo de la retroalimentación.
  - Actualiza el número de tests.
  - Ejecuta `python manage.py test` y `makemigrations --check`.
- [ ] 8.8 **Prueba manual** con `IA_PROVEEDOR=fake`:
  1. Haz la 7.8, sin los pasos del texto de rango.
  2. El encabezado muestra solo el título y la descripción.
  3. El filtro de Nivel filtra la tabla, deja una sola tarjeta a todo el ancho y se conserva en `?nivel=` al volver de unos resultados.
  4. La paginación muestra solo ‹ 1 2 3 ›.
  5. Retroalimentación sigue funcionando.
- [ ] 8.9 No hagas commit. El usuario lo hará tras revisar.


## Notas de la aplicación del grupo 8 (21-10-2026)

- **`Paginacion` adelgazó más de lo previsto.** Sin el rango, también sobraban `totalElementos` y `porPagina`, y se quitaron. Ahora recibe solo `pagina`, `totalPaginas` y `onCambiar`.
- **`hayFiltro` se quitó de `useFiltrosDeHistorial`.** Solo servía para el texto «resultados» del rango, que ya no existe.
- **Encabezado:** «Tu progreso aparecerá aquí…» también se fue. "Evolución en el tiempo" aparece solo si hay alguna entrevista finalizada, calculado desde el historial.
- **Tests del backend:** las dos clases de `test_evaluaciones.py` pasaron a ser `EndpointDeEstadisticasRetiradoTest` (404 en `/api/estadisticas/`, 200 en `retroalimentacion/`) y `DesglosePorAreaTest`. `test_incluye_entrevistas_no_finalizadas` ya no compara con el endpoint retirado.
- **CLAUDE.md:** la sección "Statistics are computed in the database" pasó a "Aggregates are computed in the database" y habla de `calcular_retroalimentacion`. Además se corrigió la ruta que decía `services.py`: esa función vive en `selectors.py`.
- **Totales:** 526 tests en el backend (530 − 5 de estadísticas + 1 de endpoint retirado), 75 en el frontend (70 + 5 de nivel), y el lint con los mismos 5 avisos de la base.

## 9. Revisión: sin filtro de Estado y acción con icono reutilizable (design D12)

- [x] 9.1 **Lógica pura.**
  - En `historial.ts`, quita `FiltroDeEstado`, `ESTADOS`, `estadoDesdeURL` y el parámetro `estado` de `filtrarEntrevistas`, que queda `(entrevistas, texto, nivel = 'todos')`. Quita también el import de `EstadoEntrevista` si queda sin uso y ajusta el comentario.
  - En `historial.test.ts`:
    - borra `describe('estadoDesdeURL')` y el caso «combina texto y estado»;
    - ajusta las llamadas a la nueva firma;
    - añade «combina texto y nivel».

  Verifica que `pnpm test` pasa.
- [x] 9.2 **Filtros.**
  - En `useFiltrosDeHistorial`, `ClaveDeFiltro = 'q' | 'nivel'`, `SIN_FILTRO = { q: '', nivel: 'todos' }`. Quita el campo `estado` y su lectura de la URL, y actualiza el docstring.
  - En `TablaDeEntrevistas`, quita el `CampoSelect` `filtro-estado`, `OPCIONES_DE_ESTADO` y el import `FiltroDeEstado`, y actualiza el docstring.

  Verifica:
  - que `grep -rn "estadoDesdeURL\|FiltroDeEstado\|OPCIONES_DE_ESTADO\|filtro-estado" frontend/src` no da resultados;
  - que `tsc` pasa.
- [x] 9.3 **`components/ui/EnlaceDeAccion.tsx`.** Crea un `Link` con estas props: `to`, `icono: NombreDeIcono`, `children` y `'aria-label'` (obligatorio).
  - Lleva un `Icono` en `h-4 w-4` y las clases actuales de `Accion`.
  - Un docstring explica por qué el nombre accesible es obligatorio y que es genérico.
- [x] 9.4 **Uso.**
  - En `TablaDeEntrevistas::Accion`:
    - para una entrevista finalizada o abandonada, `ojo` + «Ver», con `aria-label` «Ver resultados: <puesto> del <fecha>»;
    - para una entrevista en curso, `play` + «Continuar»;
    - quita la `→`.
  - En `ListaObservaciones`, `ojo` + «Ver», con `aria-label` «Ver la entrevista completa: pregunta <n> de <área>». Quita las clases escritas a mano.
- [x] 9.5 **Verificación del frontend:** `tsc`, `pnpm test` (con `estilos.test.ts` en verde), `lint` con los 5 avisos de la base, y `build`.
- [x] 9.6 **CLAUDE.md:**
  - la línea del buscador queda «beside a `CampoSelect` of Nivel … `?q=` / `?nivel=`»;
  - menciona `EnlaceDeAccion` entre los componentes base;
  - actualiza el número de tests del frontend.
- [ ] 9.7 **Prueba manual** con `IA_PROVEEDOR=fake`, junto con la 8.8:
  1. Junto al buscador solo está el selector de Nivel.
  2. Con `?estado=abandonada` en la URL se ven todas las entrevistas.
  3. La columna Acción muestra ojo + «Ver» y play + «Continuar», en la tabla y en la tarjeta del móvil.
  4. En Retroalimentación, ojo + «Ver» abre los resultados.
  5. El lector de pantalla anuncia «Ver resultados: <puesto> del <fecha>».
- [ ] 9.8 No hagas commit. El usuario lo hará tras revisar.

## Notas de la aplicación del grupo 9 (21-10-2026)

- **Tests del frontend:** 72, antes 75. Se fueron los 4 casos de `estadoDesdeURL` y «combina texto y estado». Entraron «combina texto y nivel» y «no filtra por estado», y el caso de nivel se partió en dos. El lint sigue con los 5 avisos de la base, y `estilos.test.ts` pasa sin excepción nueva.
- **`ListaObservaciones`:** el enlace va dentro de un `<div className="mt-3">`, porque `EnlaceDeAccion` no recibe `className`. El margen pertenece a quien lo coloca, no al componente.
- **CLAUDE.md:** el número de tests del frontend no figura en él, así que no hubo nada que actualizar.
