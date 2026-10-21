## Context

Así está hoy, después del cambio `tabla-de-historial`:

- **`HistorialPage`** pinta el encabezado, los gráficos `GraficoProgreso` y `ComparativaAreas` en dos columnas (solo si hay alguna finalizada) y `TablaDeEntrevistas`.
- **`TablaDeEntrevistas`** pagina en el cliente con `?pagina=` (`useSearchParams`, `lib/paginacion.ts::recortar`) sobre la lista completa de `GET /api/entrevistas/`.
- **`GraficoProgreso`** pinta un SVG propio con una serie de puntos coloreados por puesto (`COLORES_PUESTO`), que es la excepción `color-hex` de `estilos.test.ts`, más una leyenda.
- **`calcular_estadisticas`** devuelve `entrevistas_completadas`, `promedio_general`, `promedio_por_area` y `evolucion` (con `puesto` y `puesto_display`, sin nivel).
- **La regla "comparar solo lo comparable"** ya existe en el backend: `selectors.anterior_comparable` exige el mismo puesto y el mismo nivel.

## Goals / Non-Goals

**Goals:**
- Que la búsqueda y el filtro sean lógica pura probada en Vitest, como `seleccion.ts` y `paginacion.ts`.
- Que la evolución compare con la misma regla que el reporte final.
- No dejar código muerto: cada eliminación va respaldada por un grep sin usos.

**Non-Goals:**
- Buscar por fecha o por nota.
- Ordenar columnas.
- Filtrar en el servidor.
- Rediseñar el SVG del gráfico más allá de pasar a una sola serie.

## Decisions

**D1. El filtrado ocurre en el cliente, sobre la lista ya cargada.**

Es el mismo motivo por el que la paginación es del cliente: el endpoint ya entrega el historial completo porque el sidebar lo necesita, y son decenas de filas.

Se implementa así en `features/historial/historial.ts`:
- `filtrarEntrevistas(lista, texto, estado)` arma un "texto buscable" con `puesto_display`, `tecnologia_display` y `nivel_display`;
- cada coincidencia se compara con `normalizarParaBuscar`, en el nuevo `lib/texto.ts`: minúsculas, NFD sin marcas diacríticas y `trim`;
- `estado` vale `'todos'` o un `EstadoEntrevista`, y `estadoDesdeURL(valor)` devuelve `'todos'` ante un valor desconocido.

Alternativa descartada: un parámetro `?q=` en la API. Habría que filtrar en el servidor una lista que el cliente ya tiene entera.

**D2. La URL es el estado del filtro.**

`?q=`, `?estado=` y `?pagina=` se leen de `useSearchParams`.

- **Al escribir:** se actualiza `q` con `replace: true`, para no llenar el historial del navegador con una entrada por letra, y se borra `pagina`.
- **Al cambiar el estado:** misma lógica.
- **Al cambiar de página:** sigue con `replace: false`, como ahora.

El campo de texto es **controlado** directamente por `q`, sin estado local. Así "atrás" y "Limpiar" quedan siempre sincronizados.

**D3. La paginación cuenta los resultados.** *(Reemplazada por D11: ya no hay texto de rango.)*

`Paginacion` gana dos props:
- `sustantivo?: string`: con «resultados», el rango dice «Mostrando 1–3 de 3 resultados»;
- `rangoSiempre?: boolean`: muestra el rango aunque haya una sola página, sin botones.

Las dos solo se usan con un filtro activo. Sin filtro, el comportamiento es el de hoy: con una página no se pinta nada.

**D4. Estado vacío de la búsqueda.**

Si `filtrarEntrevistas` devuelve `[]` y hay un filtro activo, se pinta `EstadoVacio`, que ya existe en `components/ui`, con el mensaje y un `Boton variante="secundario"` «Limpiar búsqueda». Ese botón borra `q`, `estado` y `pagina`, y lleva el foco al campo de búsqueda.

Un usuario sin entrevistas sigue viendo el estado vacío de siempre en `HistorialPage`, el de «Empieza la primera»: el filtro no llega a montarse.

**D5. Componentes.**

- **`components/ui/CampoBusqueda.tsx`:**
  - un `<label>` sr-only («Buscar en tus entrevistas»);
  - un `input type="search"` dentro de un contenedor con la clase `campo`;
  - la lupa (`Icono nombre="buscar"`) a la izquierda;
  - un `BotonIcono` `cerrar` con `aria-label` «Borrar búsqueda», solo cuando hay texto;
  - props `valor`, `onCambiar`, `placeholder` y `ref`.

  Vive en `ui/` porque lleva un botón. Se oculta el botón de borrado nativo del `type="search"` (`[&::-webkit-search-cancel-button]:hidden`), para no tener dos.
- **`CampoSelect`** se mueve de `features/seleccion/components/` a `components/ui/` sin cambiar su API, y se actualizan sus imports. Para el filtro de Estado se usa sin `marcador`: «Todos» es una opción real, no un "Selecciona…". Si hoy el componente fuerza la opción deshabilitada, se hace condicional a `marcador`.
- **El trazo `buscar`** vuelve a `trazosDeIconos.ts`: `search` de Tabler, el mismo valor que tenía antes de la limpieza.

**D6. Una sola serie en la evolución.** *(Aplicada y luego reemplazada por D9. Se conserva como registro de la primera versión.)*

**Backend:** `calcular_estadisticas` añade `nivel__codigo` y `nivel__nombre` a los `.values()` de `evolucion` y los expone como `nivel` y `nivel_display`. Se elimina `por_area` y su clave, y `Count` sale del import si queda sin uso.

**Frontend:** `seriesPorPuestoYNivel(evolucion)` agrupa por `${puesto}|${nivel}`:
- descarta las series con menos de 2 puntos;
- ordena por número de puntos (descendente) y, a igualdad, por la fecha más reciente;
- devuelve `{ clave, etiqueta: "Desarrollador Backend · Junior", puntos }`.

En `GraficoProgreso`:
- **Recibe** la lista de series. Guarda la clave elegida en estado local (por defecto la primera) y pinta un `CampoSelect` «Puesto y nivel», solo si hay más de una serie. Con una sola, muestra su etiqueta como texto.
- **Dibuja** los puntos con el acento del sistema (`var(--color-vidrio-acento)` vía clase o token, sin hex).
- **Pierde** `COLORES_PUESTO`, `COLOR_POR_DEFECTO`, la leyenda y la excepción de `estilos.test.ts`.
- **Debajo**, pinta la frase «De X a Y en n entrevistas (±d)»: `d` es la diferencia redondeada y va con signo, «±0» cuando no hay cambio.

Sin series, se muestra el mensaje del spec.

Alternativa descartada: una línea por puesto y nivel, todas superpuestas con colores. Vuelve el problema de los colores repetidos y es difícil de leer con más de tres.

**D7. Orden de `HistorialPage`.**

1. Encabezado, sin cambios.
2. `h2` «Tus entrevistas»:
   - una fila con `CampoBusqueda` (ocupa el espacio) y el `CampoSelect` de Estado, que se apilan por debajo de 640 px;
   - `TablaDeEntrevistas`, que recibe la lista filtrada y el indicador de "hay filtro";
   - la paginación.
3. `h2` «Evolución en el tiempo», solo si `entrevistas_completadas > 0`, con `GraficoProgreso` a todo el ancho del contenedor.

`ComparativaAreas` desaparece.

**D8. Eliminaciones, verificadas con grep antes de borrar.**

| Elemento | Dónde |
|---|---|
| `ComparativaAreas.tsx` | frontend |
| `PromedioPorArea` y `Estadisticas.promedio_por_area` | `types/evaluacion.ts` |
| `por_area` y la clave `promedio_por_area` | `calcular_estadisticas` |
| `test_promedio_por_area_desglosa_los_temas_de_la_entrevista` | `test_evaluaciones.py` |
| Los asserts de `promedio_por_area` | `test_evaluaciones.py:69`, `:120`, `:125`: se borran o se reescriben si protegen otra cosa del mismo test |
| `COLORES_PUESTO`, `COLOR_POR_DEFECTO` y la leyenda | `GraficoProgreso.tsx` |
| La entrada de `GraficoProgreso.tsx` en `EXCEPCIONES` | `estilos.test.ts` |

Lo que **no** se toca: el agrupado por área de `calcular_retroalimentacion` (Retroalimentación) y `por_area` en sus tests.

**D9. Evolución en tres tarjetas por nivel, una línea por puesto.** *(Reemplaza D6 y la parte de D7 sobre `GraficoProgreso`.)*

Revisión del 21-10-2026. D6 dibujaba una sola serie elegida con un selector y sobre `/api/estadisticas/`. Eso dejaba sin resolver tres casos: el eje de calendario (diez entrevistas en una semana, o una y luego otra tres años después), las entrevistas desde convocatoria y que el gráfico no siguiera a la tabla.

- **Fuente:** las entrevistas que ya filtró la tabla, no `/api/estadisticas/`.
  - El filtrado sube de `TablaDeEntrevistas` a `HistorialPage`, o a un hook `useFiltrosDeHistorial`, que lee `?q=`, `?estado=` y `?origen=` y calcula la lista una sola vez.
  - `TablaDeEntrevistas` recibe la lista filtrada y los controles; `EvolucionPorNivel` recibe la misma lista.
  - En el backend, `calcular_estadisticas` pierde `evolucion`.
  - `EntrevistaSerializer` gana `convocatoria` (el id, o `null`). Es aditivo, y la pertenencia ya la garantiza `IniciarEntrevistaSerializer`.
- **Niveles:** salen del catálogo (`obtenerPuestos`, caché `catalogo-puestos`, con su `orden`). Nada se escribe a mano. Las tres tarjetas se pintan siempre, en ese orden.
- **Lógica pura** (`historial.ts`, probada en Vitest):
  - `origenDesdeURL`, y `filtrarEntrevistas(..., origen)` con `'todas' | 'personalizada' | 'convocatoria'`.
  - `evolucionPorNivel(entrevistas, niveles)` devuelve `{ nivel, etiqueta, series: { puesto, etiqueta, puntos }[] }[]`:
    - toma las finalizadas con `puntuacion_promedio`, ordenadas por `fecha_fin` ascendente;
    - agrupa por nivel y luego por puesto;
    - las series se ordenan por el `orden` del puesto en el catálogo, para que la leyenda sea estable;
    - un punto es `{ entrevista_id, numero (1..n en su serie), fecha, nota, desdeConvocatoria, intentoDeConvocatoria, diasDesdeAnterior, saltoAntes }`;
    - `saltoAntes` es `diasDesdeAnterior > DIAS_DE_SALTO` (90);
    - `intentoDeConvocatoria` cuenta, por `convocatoria`, las veces que apareció hasta ese punto, contando en todo el historial filtrado.
  - `marcasDelEje(n)`: `[1..n]` si `n ≤ 8`; si no, la 1, las múltiplos de 5 y la `n`.
- **Color por puesto:** tokens en `styles/tokens.css`, `--color-puesto-<codigo>`, con la paleta Okabe-Ito.

  | Puesto | Token | Valor |
  |---|---|---|
  | backend | `--color-puesto-backend` | `#0072B2` (azul) |
  | frontend | `--color-puesto-frontend` | `#E69F00` (naranja) |
  | full_stack | `--color-puesto-full_stack` | `#CC79A7` (morado rojizo) |
  | movil | `--color-puesto-movil` | `#009E73` (verde azulado) |
  | escritorio | `--color-puesto-escritorio` | `#56B4E9` (celeste) |
  | qa | `--color-puesto-qa` | `#D55E00` (bermellón) |
  | videojuegos | `--color-puesto-videojuegos` | `#4D4D4D` (gris oscuro) |

  `lib/puestos.ts::colorDePuesto(codigo)` devuelve `var(--color-puesto-<codigo>)`, y un puesto desconocido cae en `var(--color-vidrio-muted)`. Los hex viven solo en `tokens.css`, así que `estilos.test.ts` no necesita excepciones.
- **Componentes:**
  - **`EvolucionPorNivel.tsx`:**
    - la leyenda única: los puestos presentes con su color, más ● «personalizada» y ○ «desde convocatoria»;
    - luego `grid gap-4 xl:grid-cols-3`, con una `Tarjeta` por nivel, titulada con `EtiquetaMono` (el nombre del nivel).
  - **`GraficoDeNivel.tsx`:**
    - un SVG con escala Y fija de 0 a 100 y guías en 0, 25, 50, 75 y 100, iguales en las tres tarjetas;
    - el eje X va de 1 al máximo `numero` del nivel, para que las series de distinto largo compartan eje;
    - una `path` y sus `circle` por serie;
    - el punto se rellena con el color del puesto, o es hueco (`fill` blanco con borde de 2 px del color) si viene de convocatoria;
    - `<title>`: «Entrevista n · dd/mm/aaaa · nota/100», más « · Basada en tu convocatoria (k.º intento)» cuando aplica;
    - el salto es una `line` vertical punteada a mitad de camino, con el `<title>` «Pasaron N días»;
    - `role="img"`, con un `aria-label` que nombra el nivel, y un `<ul class="sr-only">` con «<Puesto>: de X a Y en n entrevistas» por serie;
    - sin series, el mensaje «Aún sin entrevistas <Nivel> finalizadas.».
- **Tabla:**
  - el filtro de Origen va como un `CampoSelect` más (`marcador={null}`, `ocultarEtiqueta`), en la misma fila que Estado;
  - la etiqueta «Convocatoria» junto al puesto reutiliza la pastilla de `ResumenDeEntrevista`.

  Si esa pastilla se repite en tres sitios, se extrae a `components/ui` como `EtiquetaConvocatoria`. Si solo hay dos, se deja.

Alternativas descartadas:
- **Eje de calendario o agrupar por semana o mes:** aplasta las rachas o las promedia, y esconde justo la mejora de una semana de preparación.
- **Una sola línea con convocatoria y personalizadas separadas:** la nota se calcula igual con o sin convocatoria (el evaluador nunca recibe los requisitos), así que separarlas partiría el progreso real en dos.
- **Tarjetas vacías ocultas:** en una fila, las demás cambiarían de lugar y se perdería la lectura Junior → Senior.
- **Pestañas por nivel:** no dejan comparar los tres niveles a la vez.

**D10. Cuadro de detalle, puntos iguales y sin filtro de origen.** *(Reemplaza, de D9, el punto hueco, el conteo de intentos de convocatoria, el campo `convocatoria` del historial, el filtro «Origen» y el `<title>` nativo.)*

Revisión del 21-10-2026, a pedido del usuario. El gráfico no distingue el origen de la entrevista. Hay dos razones: la nota se calcula igual (el evaluador nunca recibe los requisitos de la convocatoria), y distinguirlo añadía leyenda y un filtro que no ayudaban a leer el progreso.

- **Cuadro de detalle** (`features/historial/components/DetalleDePunto.tsx`). Es un `div` absoluto sobre un contenedor `relative` que envuelve el SVG.
  - **Posición:** se calcula en porcentaje desde las coordenadas del `viewBox` (`left = x / ANCHO`, `top = y / ALTO`). Se ancla por encima del punto, y con `translate` a izquierda o derecha cerca de los bordes, para no salirse de la tarjeta.
  - **Contenido:** una `dl` de cuatro filas: Fecha, Puesto, Tecnología («—» si no tiene) y Puntaje («75/100»).
  - **Estilo:** el de `components/ui/Tooltip.tsx` (`bg-vidrio-ink`, texto blanco, `rounded-control`, `text-xs`, `shadow-flotante`); solo tokens.
  - **Atributos:** `role="tooltip"` y `pointer-events-none`.
  - `Tooltip` no sirve aquí, porque envuelve un hijo HTML y el disparador es un `<circle>`.
- **Interacción:** `GraficoDeNivel` guarda el punto activo en estado (`useState<PuntoActivo | null>`).
  - **Abrir:** con `onPointerEnter`/`onFocus` en cada `circle`.
  - **Cerrar:** con `onPointerLeave`/`onBlur`, y con `onKeyDown` Esc.
  - **Accesibilidad de los puntos:** cada `circle` lleva `tabIndex={0}`, `role="img"`, un `aria-label` con los cuatro datos y `foco-anillo`. El anillo con `outline` también se ve sobre SVG en los navegadores actuales.

  Se eligió que cada punto sea una parada de Tab, en vez de navegarlos con flechas: hay pocos por tarjeta y es lo más predecible.
- **Datos del punto:**
  - `evolucionPorNivel` añade `tecnologia` (`tecnologia_display`);
  - quita `desdeConvocatoria`, `intentoDeConvocatoria` y el `Map` de intentos.
- **Puntos iguales:** todos con `fill` del color del puesto, y la leyenda de `EvolucionPorNivel` solo con los puestos.
- **Sin filtro de origen:**
  - `useFiltrosDeHistorial` vuelve a leer solo `q` y `estado`;
  - `filtrarEntrevistas` pierde el parámetro `origen`;
  - se borran `FiltroDeOrigen` y `origenDesdeURL`;
  - `TablaDeEntrevistas` pierde el `CampoSelect` de Origen y `OPCIONES_DE_ORIGEN`;
  - un `?origen=` heredado se ignora.
- **Backend:** `EntrevistaSerializer` deja de exponer `convocatoria`, que solo servía para contar intentos, y se borra su test. Se conserva `desde_convocatoria`, que usan la etiqueta de la tabla, el resumen de Nueva entrevista y el chat.

Alternativa descartada: el `<title>` nativo de SVG. Tarda en aparecer, no se ve con teclado y no permite dar formato a las cuatro filas.

**D11. Filtro de nivel, encabezado con descripción y paginación sin rango.** *(Reemplaza D3 y lo que D9 dice de `/api/estadisticas/`.)*

Revisión del 21-10-2026, con las opciones aprobadas por el usuario.

- **Filtro de nivel:**
  - `filtrarEntrevistas(lista, texto, estado, nivel)`, con `nivel = 'todos' | <codigo>`;
  - `nivelDesdeURL(valor, codigos)` acepta solo códigos del catálogo y, si no, devuelve `'todos'`;
  - `useFiltrosDeHistorial(entrevistas, codigosDeNivel)` lee y escribe `?nivel=` con `replace` y borra `?pagina=`, como `estado`;
  - en `TablaDeEntrevistas`, un tercer `CampoSelect` (`marcador={null}`, `ocultarEtiqueta`, «Todos los niveles» y los niveles del catálogo). Las opciones salen de `catalogo-puestos`, que la página ya pide, y si el catálogo no llegó, el selector no se pinta.
- **Evolución con un nivel elegido:** `HistorialPage` pasa a `evolucionPorNivel` solo ese nivel, y `EvolucionPorNivel` usa `xl:grid-cols-3` solo cuando recibe tres. Con uno, la tarjeta ocupa todo el ancho. Se descartó mostrar las otras dos vacías: dirían «Aún sin entrevistas Senior» aunque las hubiera.
- **Paginación sin rango:**
  - `Paginacion` pierde el párrafo «Mostrando…» y las props `sustantivo` y `rangoSiempre`;
  - el `nav` queda con los botones a la derecha (`flex justify-end`);
  - un `<p className="sr-only" aria-live="polite">` anuncia «Página p de total».
- **Encabezado:** el `h1` y un `<p className="max-w-prose text-base text-vidrio-texto">` con la descripción aprobada. Se quitan la `EtiquetaMono` con el número de registradas y el párrafo de completadas y promedio.
- **Fin de `/api/estadisticas/`:**
  - se eliminan `EstadisticasView`, la ruta `""` de `apps/evaluaciones/urls.py` y `selectors.calcular_estadisticas`;
  - `config/urls.py` conserva `api/estadisticas/` como prefijo de `retroalimentacion/`;
  - en el frontend se eliminan `obtenerEstadisticas`, el tipo `Estadisticas` y la petición `estadisticas` de `useHistorial`, que queda solo con el historial;
  - "Evolución en el tiempo" se muestra si hay alguna entrevista finalizada en el historial.

## Risks / Trade-offs

- **[Se quita un campo de la API]** → `promedio_por_area` no tiene más consumidores que el gráfico eliminado. Un grep en `frontend/src` lo confirma antes de borrar. No hay clientes externos.
- **[Mover `CampoSelect`]** → Hay que tocar los imports de `features/seleccion`. `tsc` detecta cualquiera olvidado.
- **[Filtrar al escribir con 50 o más filas]** → Es un filtro lineal sobre decenas de objetos, despreciable. Sin debounce: cada pulsación hace un `replace` en la URL, que no navega.
- **[Siete colores de puesto]** → Con la paleta Okabe-Ito, pensada para daltonismo, y un color fijo por puesto. El riesgo real es un nivel con 5 o más líneas: no se limita, porque los filtros de la tabla las reducen y lo normal es practicar 1 a 3 puestos por nivel.
- **[El bermellón de QA se parece al rojo de error]** → Nunca aparecen juntos (los puntos no llevan nota coloreada) y la leyenda lo nombra. Si molesta, se cambia el token sin tocar código.
- **[Tres SVG en tarjetas de unos 320 px]** → Con escala fija y rótulos ralos pasadas 8 entrevistas, sigue legible. El detalle de cada punto está al pasar el puntero.

## Migration Plan

No hay migración de base de datos. El frontend nuevo no lee `promedio_por_area` ni `evolucion`. Si se despliega el backend primero, el frontend viejo pediría esas claves y sus gráficos recibirían `undefined`, así que conviene desplegar los dos juntos, como en Render, o primero el frontend. El rollback es revertir el commit.
