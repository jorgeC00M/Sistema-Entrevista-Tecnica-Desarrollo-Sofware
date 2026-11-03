## 1. Backend: revisión con IA v2

- [x] 1.1 En `integrations/ia/prompts/revisor_cv.py`:
  - `EntradaDeRevision.demostrados` y su bloque en `usuario()`;
  - en `sistema()`, la tarea `lectura`, que solo resume y nunca juzga aptitud, probabilidad ni porcentaje, y queda vacía sin convocatoria;
  - en `requisitos`, para los ausentes, `muestralo`, `ejemplo` (con [cifra]) y `aprendelo`;
  - el esquema;
  - `RevisionDeCV.lectura` y `SugerenciaDeRequisito.muestralo/ejemplo/aprendelo`;
  - en el parser, `_CONCLUYE_APTITUD`, con límites de palabra, y `_limpio` en los campos nuevos.

  Verificar con los tests de `tests/integration/`, nuevos y existentes:
  - una lectura con «eres apto» o con «80%» se descarta;
  - una con «aptitudes» se conserva;
  - se conservan los campos nuevos;
  - sin convocatoria, la lectura queda vacía.
- [x] 1.2 Que `FakeProveedorIA.revisar_cv` devuelva una lectura neutra (vacía sin convocatoria) y los tres campos por requisito ausente.

  En `apps/curriculums/revision.py`:
  - enviar `demostrados` desde la brecha;
  - guardar `lectura`, los campos nuevos y `version: VERSION_DE_REVISION` (2), también en `_sin_revision`;
  - hacer que `necesita_revision` sea verdadero para `ok` con una versión menor.

  Verificar con `manage.py test apps.curriculums tests.integration`, que incluye `test_frontera_con_ia`, y con tests nuevos de la versión y de la forma de `revision_ia`.

## 2. Frontend: datos

- [x] 2.1 En `types/curriculum.ts`:
  - `RevisionIA.lectura?` y `version?`;
  - `muestralo?`, `ejemplo?` y `aprendelo?` en la sugerencia de requisito.

  En `useRevisionDelCv.ts`, pedir también la revisión si es `ok` y su versión es menor que 2. Verificar con tsc.
- [x] 2.2 En `requisitos.ts`:
  - `requisitosPorEstado(brecha)`, que devuelve `{coinciden, noDetectados}` con `{requisito, tipo}`, primero los obligatorios, y `tipo` null sin `separada`;
  - `NOTA_DE_DONDE`;
  - borrar `busquedaDelReclutador` y sus tests.

  Verificar con `pnpm test` (requisitos.test.ts).

## 3. Frontend: pestañas del dirigido

- [x] 3.1 Barra:
  - con convocatoria, «frente a {cargo o 'la convocatoria'}» en `ResultadoDelAnalisis`.

  Resumen:
  - nuevo `RequisitosNoDetectados.tsx`;
  - `VeredictoDeLegibilidad` con el slot `requisitos`, que pone «Formato» y el bloque en `md:grid-cols-2`;
  - en `ResumenDelAnalisis`, quitar la franja, `onVerMatch` y las tecnologías del dirigido;
  - borrar `BusquedaDelReclutador.tsx`.
- [x] 3.2 Match:
  - `ColumnasDeMatch.tsx`, con «Coinciden» y «No detectados en tu CV» y su nota;
  - `LecturaGeneral.tsx`, con «Generado por IA», la nota y los estados pidiendo / no disponible;
  - `FrenteAlAviso.tsx` pasa a ser `RequisitosDelPuesto.tsx`: experiencia, cargo, filtros y el aviso `con_evidencia`, sin chips, búsqueda ni extras.

  Panel `match`: columnas → lectura → requisitos del puesto. Se mantiene `SinRequisitosReconocidos`.
- [x] 3.3 Plan:
  - `PalabrasClaveNoDetectadas.tsx` reemplaza a `CubrirLaOferta.tsx`, que se borra;
  - la frase, una sección por ausente con el chip, el tipo y la nota de las deseables;
  - las dos cajas con la IA rotulada o la pauta fija, y el vacío.

  Verificar con un `grep` de que no quedan `CubrirLaOferta`, `BusquedaDelReclutador`, `FrenteAlAviso` ni `busquedaDelReclutador`. También con tsc, lint y `estilos.test.ts`.

## 4. Specs, documentación y verificación

- [x] 4.1 Hacer que remitan a este cambio:
  - `pestanas-del-resultado-por-tipo`: la línea de match y el contenido de Match;
  - `correcciones-accionables-y-menos-pestanas`: «Frente a este aviso»;
  - `diferenciar-revision-y-comparacion-de-cv`: la búsqueda del reclutador;
  - `plan-de-mejora-sin-casilla-y-con-brechas`: «Cubrir lo que pide la oferta».

  Verificar con `openspec validate` de cada uno.
- [x] 4.2 En `CLAUDE.md`:
  - el Resumen, Match y el Plan del dirigido;
  - la revisión v2 (`lectura`, los dos caminos, `VERSION_DE_REVISION`, el guardián de aptitud);
  - los componentes borrados;
  - la lista de reaperturas.
- [x] 4.3 Verificación completa:
  - la suite del backend;
  - `pnpm exec tsc --noEmit`;
  - `pnpm test`;
  - `pnpm run lint`, que debe quedar en 5 advertencias;
  - `pnpm run build`;
  - `openspec validate vista-dirigida-resumen-match-y-plan`.

## 5. Cierre (lo hace el usuario)

- [ ] 5.1 Pruebas manuales con `fake` y con un proveedor real:
  - la barra «frente a…»;
  - el banner con sus dos bloques y la dona igual que en el general;
  - las columnas con los obligatorios primero;
  - la lectura con su etiqueta y la nota;
  - los dos caminos, con la pauta fija mientras llega la IA;
  - el celular;
  - un análisis viejo que pide la revisión v2.
- [ ] 5.2 No hacer commit. El usuario lo hará tras revisar.
