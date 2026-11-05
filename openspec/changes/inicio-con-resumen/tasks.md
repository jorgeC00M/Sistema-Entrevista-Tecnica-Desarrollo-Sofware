## 1. Mudar la evolución

- [x] 1.1 Mover a `features/inicio/components/`, sin reescribirlos, `EvolucionPorNivel.tsx`, `GraficoDeNivel.tsx` y `DetalleDePunto.tsx`, que hoy están en `features/historial/components/`.
- [x] 1.2 Partir `historial.ts`:
  - la evolución (`fechaDelPunto`, `DIAS_DE_SALTO`, sus tipos, `evolucionPorNivel`, `marcasDelEje` y `resumenDeSerie`) pasa a `features/inicio/evolucion.ts`, y sus tests a `evolucion.test.ts`;
  - en `historial.ts` queda el filtro de la tabla.
- [x] 1.3 Quitar de `HistorialPage` la sección de gráficas y su leyenda.
- [x] 1.4 Actualizar el docstring de `useFiltrosDeHistorial`: ya no alimenta las gráficas.

## 2. Lógica del Inicio

- [x] 2.1 Crear `features/inicio/inicio.ts` con:
  - `cifrasDeResumen`: «sin terminar» cuenta las abandonadas y las de tiempo agotado; el tiempo suma solo las finalizadas;
  - `siguientePaso`: una unión discriminada con los 6 casos en el orden de la spec y la ruta del botón; reutiliza `practicaRecomendada`, `destinoDePractica` y `minutosRestantes`.
- [x] 2.2 Crear `features/inicio/inicio.test.ts`, que cubra:
  - cada caso y su prioridad;
  - la última terminada por `fecha_fin`, con empates;
  - «Sólido» sin nivel siguiente, que cae en «repasar»;
  - el tiempo solo de las finalizadas;
  - usuario nuevo.

## 3. Datos

- [x] 3.1 Crear `features/inicio/hooks/useInicio.ts`:
  - `historial`, `curriculums` (mismas claves de caché), `useCatalogos` y `useEntrevistaEnCurso`;
  - `obtenerResultados` de la última finalizada y `obtenerCurriculum` del último análisis, solo si existen;
  - expone `{cargando, error, cifras, siguiente, ultima, cv}`;
  - un fallo de los pedidos dependientes solo oculta esa tarjeta.

## 4. Componentes

- [x] 4.1 Crear `components/ui/TarjetaDeCifra.tsx` (rótulo, número y detalle opcional, dentro de `Tarjeta`), con tokens y sin clases arbitrarias (`estilos.test.ts`).
- [x] 4.2 En `features/inicio/components/`, crear:
  - `TarjetasDeResumen.tsx`: 2 columnas, y 4 desde `lg`;
  - `SiguientePaso.tsx`: un `Link` con `clasesDeBoton` y tono de aviso desde 5 min (`tramoDelReloj`);
  - `UltimaEntrevista.tsx`: `ESTILO_DE_BANDA`, la prioridad y «Ver reporte» (`EnlaceDeAccion`);
  - `UltimoCv.tsx`: `VEREDICTOS` con icono y texto, `parseabilidad`, «Tu CV apunta a…» y el enlace al análisis (`rutaDelAnalisis`).
- [x] 4.3 Crear `features/inicio/pages/InicioPage.tsx`:
  - el h1 «Hola, <nombre>»;
  - el orden del DOM igual al visual;
  - la fila «última entrevista · CV» en `lg:grid-cols-2`;
  - `EvolucionPorNivel` con la lista completa;
  - `Spinner` y `Alerta` como en las demás páginas.

## 5. Rutas y menú

- [x] 5.1 Agregar `/inicio` en `router/index.tsx`, bajo `RutaProtegida`. En `EntradaRaiz`, con sesión, mandar a `/inicio`.
- [x] 5.2 En `destinos.ts`:
  - exportar `DESTINO_INICIO`, con un ícono existente de `trazosDeIconos` (casa, o la marca si no hay casa);
  - «Historial y progreso» pasa a «Historial»;
  - actualizar el docstring.
- [x] 5.3 En `Sidebar.tsx`, pintar «Inicio» con `SidebarNavItem` entre la marca y `SidebarAccionPrincipal`, y actualizar el docstring.
- [x] 5.4 `titulosDeRuta.ts`:
  - `/inicio` → «Inicio» / «Tu resumen y lo que te conviene hacer ahora»;
  - `/historial` → «Historial», con un subtítulo sin «evolución».

## 6. Documentación y verificación

- [x] 6.1 Actualizar `CLAUDE.md`:
  - la sección del Inicio, nueva;
  - el párrafo de «Evolución en el tiempo», que ahora vive en el Inicio;
  - la entrada con sesión (`/` → `/inicio`);
  - el sidebar («Inicio» arriba y «Historial»);
  - las menciones a `/simular-entrevista` como entrada.
- [x] 6.2 Anotar las deltas sin archivar `sidebar-por-etapas` («Historial y progreso» → «Historial» e «Inicio» arriba) y `buscador-y-evolucion-en-historial` (la evolución se mudó al Inicio).
- [x] 6.3 Buscar con `grep` en `frontend/src` que no queden imports de `features/historial/components/(EvolucionPorNivel|GraficoDeNivel|DetalleDePunto)` ni de las funciones de evolución desde `historial`, ni el texto «Historial y progreso».
- [x] 6.4 Ejecutar `pnpm exec tsc --noEmit`, `pnpm test` (con `estilos.test.ts`), `pnpm run lint` (deben quedar 5 advertencias) y `pnpm run build`.
- [x] 6.5 Ejecutar `openspec validate inicio-con-resumen --strict`.

## 7. Cierre (lo hace Jorge)

- [ ] 7.1 Pruebas manuales:
  - usuario nuevo (cifras en 0, «Empieza analizando tu CV»);
  - con una en curso («Continuar», en ámbar desde 5 min);
  - la última sin terminar («Volver a intentarlo»);
  - la última «Sólido» («Sube a…»);
  - CV con puesto sugerido;
  - celular a 360 px;
  - sidebar en 1366×768;
  - Historial sin gráficas.
- [ ] 7.2 En la tesis, la pantalla Inicio, el menú y el Historial renombrado.
- [ ] 7.3 No hacer commit; lo hace Jorge.
