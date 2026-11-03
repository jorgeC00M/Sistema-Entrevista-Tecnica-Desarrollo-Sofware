## 1. Backend: veredicto en la lista

- [x] 1.1 Agregar la propiedad `AnalisisATS.veredicto` en `apps/curriculums/models.py`:
  - `ilegible` si hay alguna debilidad crítica;
  - `con_perdidas` si `campos_detectados < campos_intentados` o hay alguna debilidad alta;
  - `completo` en otro caso.

  Lleva un comentario que nombra `hallazgos.ts::veredictoDeLegibilidad`. Verificar con los tests de 1.3.
- [x] 1.2 Agregar `veredicto` a `CurriculumListaSerializer` (`source="analisis.veredicto"`, nulo sin análisis). Verificar que `GET /api/curriculums/` lo trae.
- [x] 1.3 Tests en `apps/curriculums/tests/test_curriculums.py`: los tres estados, un PDF escaneado que da `ilegible` y una fila sin análisis que da `null`. Verificar con `python manage.py test apps.curriculums`.

## 2. Frontend: tipos y lógica pura

- [x] 2.1 `types/curriculum.ts`: `CurriculumEnLista.veredicto: NivelDeVeredicto | null`. Verificar con `pnpm exec tsc --noEmit`.
- [x] 2.2 En `hallazgos.ts`:
  - `type TipoDeAnalisis = 'general' | 'dirigido'`;
  - `tipoDeRevision` devuelve «Análisis general» / «Análisis dirigido»;
  - el mapa `VEREDICTOS` (etiqueta corta, título, icono, clases);
  - `faltaParaAnalizar(tipo, archivo, convocatoria, archivoConvocatoria)`.

  Verificar con tests nuevos en `hallazgos.test.ts`: el orden de los mensajes, «dirigido» sin aviso, «general» ignora el aviso, y `VEREDICTOS` cubre los tres niveles.
- [x] 2.3 `VeredictoDeLegibilidad.tsx` lee `VEREDICTOS` y se borra su mapa local. Verificar que tsc pasa y que no quedan títulos duplicados con `grep`.

## 3. Frontend: entrada con tipo explícito

- [x] 3.1 Crear `components/ui/estilosDeOpcion.ts::clasesDeOpcion` y hacer que `EleccionDeVia.tsx` la use. Verificar que tsc y `estilos.test.ts` pasan y que «Con convocatoria» se ve igual que antes.
- [x] 3.2 Crear `features/curriculum/components/EleccionDeTipo.tsx`: `fieldset` + `legend` «Tipo de análisis» y dos radios `sr-only` apilados con título y ayuda («¿El ATS lee mi CV?» / «¿Encajo en el aviso?»). Sin opción marcada si `tipo` es null. Verificar con tsc y lint.
- [x] 3.3 Reescribir `EntradaDelAnalisis.tsx`:
  - grilla `lg:grid-cols-2` con este orden del DOM: tipo (`lg:col-start-2 lg:row-start-1 lg:row-span-2`) → «Tu CV» → «Convocatoria» (solo con dirigido);
  - la línea `aria-live` con `faltaParaAnalizar`;
  - el botón «Analizar CV» con `disabled` según lo que falta;
  - se borran `conConvocatoria` y los textos «Revisar mi CV» / «Revisar y comparar», y se actualiza el docstring.

  Verificar con tsc y con `grep` sin restos.
- [x] 3.4 `CurriculumPage.tsx`:
  - estado `tipo`;
  - el envío solo manda la convocatoria con `tipo === 'dirigido'`;
  - «Compara con una convocatoria» pone `dirigido` y enfoca la convocatoria después de pintarla;
  - «Analizar otro» conserva el tipo;
  - se actualiza el docstring de las dos rutas.

  Verificar con tsc y con la prueba manual 6.1.
- [x] 3.5 `ResultadoDelAnalisis.tsx`: la barra muestra el nuevo `tipoDeRevision`, sin cambios de estructura. Verificar con tsc.

## 4. Frontend: historial en tabla

- [x] 4.1 Reescribir `HistorialDeAnalisis.tsx` con `Tabla`:
  - columnas Fecha · Archivo CV · Tipo de análisis · Estado del CV (icono + etiqueta de `VEREDICTOS`; «—» si es null) · Campos leídos · Ver (`EnlaceDeAccion` a `/mi-cv/:id`, con `aria-label` que nombra el archivo y la fecha);
  - la tarjeta para el celular;
  - `Paginacion` de a 10 con `?pagina=` y `recortar`, y el foco a `refInicio` al cambiar de página;
  - nada mientras carga o con la lista vacía.

  Verificar con tsc y lint.
- [x] 4.2 Quitar `onAbrir` en `CurriculumPage` y la excepción de `HistorialDeAnalisis.tsx` en `estilos.test.ts`. Verificar que `pnpm test` pasa, incluido el test de excepciones sin uso.

## 5. Specs, documentación y verificación

- [x] 5.1 Delta de `diferenciar-revision-y-comparacion-de-cv`: reescribir «La entrada muestra las dos rutas sin pedir que se elija una» y «Cada análisis nombra su tipo» para que no contradigan este cambio. Verificar con `openspec validate diferenciar-revision-y-comparacion-de-cv`.
- [x] 5.2 `CLAUDE.md`, sección del CV:
  - la entrada con tipo explícito y su orden;
  - el historial en `Tabla`;
  - los nombres «Análisis general» / «Análisis dirigido»;
  - `AnalisisATS.veredicto`;
  - la excepción de estilos que se quitó;
  - este cambio en la lista de reaperturas.

  Verificar con `grep` que no quedan «no mode to choose» ni «Revisar y comparar».
- [x] 5.3 Verificación completa:
  - `python manage.py test`;
  - `pnpm exec tsc --noEmit`;
  - `pnpm test`;
  - `pnpm run lint`, que debe quedar en 5 advertencias;
  - `pnpm run build`;
  - `openspec validate tipo-de-analisis-e-historial-en-tabla`.

  Todo en verde.

## 6. Cierre (lo hace el usuario)

- [ ] 6.1 Pruebas manuales:
  - **Computadora:**
    - sin tipo, el botón está apagado y dice «Elige un tipo de análisis»;
    - con «General» + CV, se activa;
    - con «Dirigido» aparece la convocatoria bajo el CV, y el botón se activa solo con el aviso;
    - al volver a «General», el aviso no se envía y se recupera al regresar.
  - **Celular:** el orden es tipo → CV → convocatoria, y la tabla se ve como tarjetas.
  - **Tabla:** las 6 columnas, «Ver» abre el análisis, la paginación aparece con más de 10 filas, y el estado coincide con el veredicto del Resumen.
  - **Teclado:** flechas entre las opciones y un solo Tab.
- [ ] 6.2 No hacer commit. El usuario lo hará tras revisar.
