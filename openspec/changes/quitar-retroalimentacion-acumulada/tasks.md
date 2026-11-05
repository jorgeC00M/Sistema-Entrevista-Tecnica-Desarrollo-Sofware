## 1. Backend

- [x] 1.1 Borrar `apps/evaluaciones/views.py`, `urls.py` y `selectors.py`, y quitar `path("api/estadisticas/", …)` de `config/urls.py`. Comprobar con `grep` que nada más importe `apps.evaluaciones.selectors` ni `RetroalimentacionView`.
- [x] 1.2 Borrar `apps/evaluaciones/tests/test_retroalimentacion.py`.
- [x] 1.3 En `apps/evaluaciones/tests/test_evaluaciones.py`:
  - `EndpointDeEstadisticasRetiradoTest` comprueba 404 en `/api/estadisticas/` y en `/api/estadisticas/retroalimentacion/`;
  - `DesglosePorAreaTest` se reescribe contra `/resultados/` (`intercambios[].area`), con sus dos casos;
  - quitar `URL_RETROALIMENTACION` y lo que quede sin uso, y actualizar el docstring.
- [x] 1.4 Ejecutar la suite completa (`manage.py test --noinput`).

## 2. Frontend

- [x] 2.1 Borrar `features/retroalimentacion/` y `api/evaluaciones.ts`. Quitar `RepartoPorArea`, `Observacion` y `RetroalimentacionAcumulada` de `types/evaluacion.ts`.
- [x] 2.2 En `router/index.tsx`, `/retroalimentacion` pasa a `<Navigate to="/historial" replace />`. Quitar la entrada de `components/layout/destinos.ts` y la de `titulosDeRuta.ts`, y la mención en el comentario de `Header.tsx`.
- [x] 2.3 Si `brujula` queda sin uso, quitarlo de `trazosDeIconos.ts`.
- [x] 2.4 En `features/landing/sections/QueRecibes.tsx`, la tarjeta «Tu progreso» pasa a «El historial de tus entrevistas, tu evolución por nivel y puesto, y el reporte de cada una con su plan de mejora.».
- [x] 2.5 Ejecutar `pnpm exec tsc --noEmit`, `pnpm test` (con `estilos.test.ts`), `pnpm run lint` (deben quedar 5 advertencias) y `pnpm run build`.

## 3. Specs, documentación y verificación final

- [x] 3.1 Hacer que remitan a este cambio:
  - la delta de `sidebar-por-etapas`: «Tu progreso» solo con «Historial y progreso»;
  - la de `buscador-y-evolucion-en-historial`: el desglose por área ya no se ofrece en «Retroalimentación», y el «Ver» de las observaciones;
  - la de `pantallas-responsivas`: la línea de «Retroalimentación».
- [x] 3.2 En `CLAUDE.md`:
  - quitar la sección «Retroalimentación acumulada counts unfinished interviews too»;
  - quitar las menciones al endpoint y a la pestaña (sidebar, «Aggregates are computed in the database», `RepartoPorBandas`, `EnlaceDeAccion`, «Pages spread into columns», el reparto por área);
  - anotar que la retroalimentación vive en el reporte de cada entrevista.
- [x] 3.3 `grep` final en backend y frontend de `retroalimentacion|calcular_retroalimentacion|RepartoPorArea|Observacion|estadisticas`: solo deben quedar `ListaRetroalimentacion`, la redirección y los tests de 404.
- [x] 3.4 Ejecutar `openspec validate` de este cambio y de los tres ajustados.

## 4. Cierre (lo hace el usuario)

- [ ] 4.1 Pruebas manuales:
  - el menú en escritorio, tablet y celular;
  - abrir `/retroalimentacion` y llegar al historial;
  - «Ver» en el historial y las tres pestañas del reporte;
  - la landing.
- [ ] 4.2 Actualizar el perfil de tesis:
  - el Alcance (línea 329) con el texto del design;
  - la línea 518;
  - quitar la Figura 17 y la Tabla 22, y renumerar.
- [ ] 4.3 No hacer commit; lo hace el usuario.
