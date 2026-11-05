## Context

- **Entrada con sesión:** `features/landing/pages/EntradaRaiz.tsx` manda a `/simular-entrevista`.
- **Menú:**
  - `components/layout/destinos.ts` define los grupos «Prepararte», «Tu progreso» (con «Historial y progreso») y «Tu cuenta»;
  - `Sidebar.tsx` pinta la marca, `SidebarAccionPrincipal` («Continuar · m min» y «Simular entrevista») y luego los grupos.
- **Historial:**
  - `features/historial/pages/HistorialPage.tsx` muestra la tabla, el buscador, el filtro de nivel y «Evolución en el tiempo» (`EvolucionPorNivel`, `GraficoDeNivel`, `DetalleDePunto`);
  - recibe la lista filtrada de `useFiltrosDeHistorial`;
  - `historial.ts` mezcla el filtro de la tabla (`filtrarEntrevistas`, `nivelDesdeURL`) con la evolución (`fechaDelPunto`, `DIAS_DE_SALTO`, `evolucionPorNivel`, `marcasDelEje`, `resumenDeSerie`).
- **Datos que ya existen en caché** (`usePeticion`, que avisa a las instancias montadas desde `una-entrevista-en-curso`):
  - `historial` (`Entrevista[]`, con `estado`, `puntuacion_promedio`, `preguntas_calificadas`, `fecha_inicio`, `fecha_fin`, `fecha_limite`, `ahora`);
  - `curriculums` (`CurriculumEnLista[]`: `nombre_archivo`, `fecha`, `parseabilidad`, `veredicto`, `con_convocatoria`);
  - el catálogo (`useCatalogos`: niveles).
- **Funciones que ya existen:**
  - `practicaRecomendada(entrevista, banda, niveles)` en `reporte.ts`;
  - `destinoDePractica(revision)` en `curriculum/practica.ts`;
  - `rutaDelAnalisis(conConvocatoria, id)` en `hallazgos.ts`;
  - `formatearDuracion` en `lib/estados.ts`;
  - `VEREDICTOS` en `hallazgos.ts`;
  - `useEntrevistaEnCurso`, más `etiquetaDeContinuar`, `minutosRestantes` y `tramoDelReloj` en `entrevista/tiempo.ts`.

## Goals / Non-Goals

**Goals:**
- un tablero que resume y orienta, calculado por reglas explicables;
- la evolución en un solo lugar;
- un Historial más limpio.

**Non-Goals:**
- un endpoint `/api/inicio/` (con decenas de entrevistas por estudiante, calcular en el cliente basta);
- actividad reciente, puestos explorados, rachas o metas;
- filtros en el Inicio;
- llamar a la IA.

## Decisions

### Lógica pura en `features/inicio/inicio.ts`
- **`cifrasDeResumen(entrevistas, curriculums)`** devuelve `{finalizadas, sinTerminar, preguntas, segundosDePractica, analisis, generales, conOferta}`:
  - `preguntas` suma `preguntas_calificadas` de las no `en_progreso`;
  - `segundosDePractica` suma `fecha_fin - fecha_inicio` solo de las `finalizada`. Una vencida tiene como fin el límite, y sumarla inventaría práctica.
- **`siguientePaso(datos)`** devuelve una unión discriminada `{tipo: 'continuar' | 'analizarCv' | 'primera' | 'reintentar' | 'subir' | 'repasar', ...}`, con la ruta del botón ya armada. Los 6 casos van en el orden de la spec. Recibe:
  - la en curso (de `useEntrevistaEnCurso`);
  - la lista de entrevistas;
  - si hay CV, y el puesto sugerido del último;
  - la última finalizada con su `resumen`;
  - los niveles.
- **Reglas de los casos:**
  - **«Subir»** y **«repasar»** usan `practicaRecomendada`. «Repasar» toma el área de `resumen.prioridad`.
  - **«Reintentar»:** la última **terminada**, por `fecha_fin` y luego por `pk`, es `abandonada` o `tiempo_agotado`.
  - **«Primera»:** usa `destinoDePractica` con la revisión del último CV.
  - Las rutas de práctica se arman con `URLSearchParams`, como en `PlanDeMejora`.
- **El texto del caso 1** reutiliza `minutosRestantes`. El tono de aviso se decide con `tramoDelReloj`.
- Todo con tests en `inicio.test.ts`: cada caso y su prioridad, empates de fecha, el tiempo solo de las finalizadas y «sin terminar» con los dos estados.

### `useInicio` junta todo en un estado
- Lee `historial`, `curriculums` (las mismas claves de caché) y `useCatalogos`.
- **Dos pedidos dependientes:**
  - `obtenerResultados(id)` de la última finalizada, por `resumen` (banda y prioridad), con la clave `resultados-<id>`;
  - `obtenerCurriculum(id)` del último análisis, por `revision_ia.puesto_sugerido` y su `analisis`, con la clave `curriculum-<id>`.
- Ninguno llama a la IA: `revision_ia` llega tal como está guardada.
- Expone `{cargando, error, cifras, siguiente, ultima, cv}`. Un fallo de los pedidos dependientes no rompe la pantalla: esa tarjeta simplemente no se muestra.

### Componentes
- `components/ui/TarjetaDeCifra.tsx` es el componente base: rótulo en `text-label-mono` mayúsculas, número en `text-metric-*` y detalle opcional en `text-meta` atenuado. Va dentro de `Tarjeta`.
- En `features/inicio/components/`:
  - `TarjetasDeResumen` es la fila de 4 cifras: `grid-cols-2` y `lg:grid-cols-4`;
  - `SiguientePaso`: la frase y el botón (`Link` con `clasesDeBoton`), y `role="status"` no, porque es contenido, no aviso;
  - `UltimaEntrevista`: la nota con `ESTILO_DE_BANDA`, la prioridad y `EnlaceDeAccion` «Ver reporte»;
  - `UltimoCv`: el estado con `VEREDICTOS` (icono y texto), `parseabilidad` y los enlaces.
- **Orden:** en `InicioPage`, el DOM sigue el orden visual: h1, cifras, siguiente paso, la fila «última entrevista · CV» (`lg:grid-cols-2`) y la evolución.

### La evolución se muda, no se copia
- `EvolucionPorNivel.tsx`, `GraficoDeNivel.tsx` y `DetalleDePunto.tsx` pasan a `features/inicio/components/`.
- `fechaDelPunto`, `DIAS_DE_SALTO`, `PuntoDeEvolucion`, `SerieDePuesto`, `EvolucionDeNivel`, `evolucionPorNivel`, `marcasDelEje` y `resumenDeSerie` pasan, con sus tests, a `features/inicio/evolucion.ts` y `evolucion.test.ts`.
- En `historial.ts` quedan `FiltroDeNivel`, `nivelDesdeURL`, `filtrarEntrevistas` y el normalizador.
- `HistorialPage` deja de importarlas, junto con la leyenda. `useFiltrosDeHistorial` actualiza su docstring, porque ya no alimenta a las gráficas.
- En el Inicio, `EvolucionPorNivel` recibe la lista completa: sin filtros, los 3 niveles siempre.

### Menú y rutas
- **Rutas:** en `router/index.tsx`, `/inicio` va bajo `RutaProtegida`. `EntradaRaiz` manda a `/inicio`.
- **`destinos.ts`:**
  - exporta `DESTINO_INICIO = { ruta: '/inicio', etiqueta: 'Inicio', icono: <casa o marca de trazosDeIconos> }` aparte de `GRUPOS_DE_DESTINOS`, porque no pertenece a una etapa;
  - «Historial y progreso» pasa a «Historial».
- **`Sidebar.tsx`:** pinta `SidebarNavItem` con `DESTINO_INICIO` entre la marca y `SidebarAccionPrincipal`, con el mismo componente, tooltip y estado actual.
- **`titulosDeRuta.ts`:**
  - `/inicio` → «Inicio» / «Tu resumen y lo que te conviene hacer ahora»;
  - `/historial` → «Historial», con su subtítulo actualizado (sin «evolución»).

### Al aplicar
- **Un armador compartido de entrevistas de prueba.** Los tests del historial, de la evolución y del Inicio necesitaban el mismo, así que se sacó a `src/test/entrevistaDePrueba.ts` en vez de copiarlo tres veces. Solo lo importan archivos `.test.ts`.
- **Se quitó la variante «filtrada» de `EvolucionPorNivel`** (una sola tarjeta a todo el ancho): sin filtros, era código muerto.
- **El ícono `casa` (Tabler `home`) se agregó a `trazosDeIconos.ts`,** porque no había ninguno para «Inicio».
- **La marca del sidebar ahora enlaza a `/inicio`,** no a `/simular-entrevista`: el Inicio es el punto de partida.
- **«Inicio» va en su propio `nav aria-label="Inicio"`,** antes de la acción principal, con el mismo `SidebarNavItem`.
- **El enlace de «Tu CV» dice «Ver análisis», no «Ver plan de mejora»:** lleva al análisis, que abre en su Resumen.
- **`useInicio` reutiliza `useResultados`,** con la misma clave `resultados-<id>` que el reporte.
- **`revision_ia` vive en `Curriculum.analisis`, no en `Curriculum`.**
- **Si el reporte de la última finalizada no se pudo traer,** el siguiente paso cae en «Vuelve a practicar <puesto> <nivel>», sin nombrar un área.

## Risks / Trade-offs

- **[Dos pedidos más al abrir el Inicio]** → Son los de la última finalizada y el último CV, quedan cacheados y solo se hacen si existen.
- **[Mover archivos rompe imports]** → `tsc` lo detecta. Se buscan con `grep` todos los imports de `features/historial/historial` y de los componentes movidos.
- **[Un sidebar con un destino más en pantallas bajas]** → Es un ítem de 44 px. Se comprueba en 1366×768, como en `perfil-como-destino`.
- **[Deltas sin archivar que dicen «Historial y progreso» o «evolución en el Historial»]** → Se anotan `sidebar-por-etapas` y `buscador-y-evolucion-en-historial`. Las demás son historia de propuestas y no se tocan.

## Migration Plan

Sin datos ni backend. Para revertir: restaurar la ruta de entrada y mover de vuelta los componentes de evolución.
