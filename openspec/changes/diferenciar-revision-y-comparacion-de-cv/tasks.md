## 1. Backend: el texto que leyó el ATS

- [x] 1.1 **Selector `lineas_del_texto(curriculum)`** en `apps/curriculums/selectors.py`. Devuelve `[{texto, seccion}]` con `secciones.titulo_de()` por línea (D4).
- [x] 1.2 **Vista `CurriculumTextoView`** y la ruta `<int:pk>/texto/` en `urls.py`.
  - Usa `curriculum_del_usuario` (404 para el CV de otro usuario).
  - No llama a la IA ni escribe nada.
- [x] 1.3 **Tests en `tests/test_curriculums.py`:**
  - el dueño recibe 200 y las líneas;
  - un título reconocido trae `seccion`;
  - otro usuario recibe 404;
  - sin autenticar, 401;
  - no se crea ninguna fila.
- [x] 1.4 **`python manage.py test apps.curriculums` en verde.**

## 2. Lógica pura del frontend

- [x] 2.1 **`veredictoDeLegibilidad(analisis)` en `hallazgos.ts`** (D3), con tests de los tres niveles y de la causa.
- [x] 2.2 **`MOTIVOS_DE_INVISIBILIDAD` y `loQueElAtsNoVe(analisis)` en `hallazgos.ts`** (D5), con un test de que solo devuelve los códigos del mapa.
- [x] 2.3 **`busquedaDelReclutador(brecha)`** (D7), con tests:
  - faltan obligatorias;
  - todas cubiertas;
  - cubiertas con alguna declarada;
  - aviso no separado.
- [x] 2.4 **`tipoDeRevision(conConvocatoria)` e `idDeRequisito(termino)`** (D6 y D8).
- [x] 2.5 **Mover los aspectos y las notas de `BrechaDeRequisitos.tsx` a `features/curriculum/aspectos.ts`.** Que la pestaña Requisitos importe de ahí, sin copias.
- [x] 2.6 **`obtenerTextoDelCurriculum(id, signal)` en `api/curriculums.ts`** y su tipo en `types/curriculum.ts`.

## 3. Entrada a dos columnas

- [x] 3.1 **`EntradaDelAnalisis.tsx`:** dos zonas tituladas, «Tu CV (obligatorio)» y «Convocatoria (opcional)», con la línea que explica qué se gana.
  - Lado a lado desde `lg`; apiladas por debajo, en el orden del DOM.
- [x] 3.2 **Quitar el código muerto:** el estado `conConvocatoria`, `alternarConvocatoria`, el botón del plegable y `useId` si deja de usarse.
- [x] 3.3 **Texto del botón:** «Revisar mi CV» o «Revisar y comparar», según haya texto o archivo de convocatoria.
- [x] 3.4 **`CurriculumPage.tsx`:**
  - `refZonaDeConvocatoria`;
  - `compararConConvocatoria`, que navega a `/mi-cv` conservando el CV y enfoca la convocatoria (D2).

## 4. Resultado

- [x] 4.1 **Componente del veredicto,** arriba de `EspejoDelATS` en `ResumenDelAnalisis.tsx`: ícono, texto y causa, sin número.
- [x] 4.2 **Componente `TextoDelATS`,** un plegable `<details>` bajo el espejo:
  - pide el texto al abrirse, con estado de carga y error;
  - caja monoespaciada con altura máxima y scroll, con las líneas de sección resaltadas;
  - debajo, «Lo que el ATS no ve y por qué».

  No se muestra en un CV ilegible.
- [x] 4.3 **Sin convocatoria:** la tarjeta «Tecnologías por las que te encontrarían», con el mensaje para el inventario vacío.
- [x] 4.4 **Con convocatoria:** el componente `FrenteAlAviso` al principio del Resumen:
  - los chips de obligatorias y deseables;
  - la cobertura, la experiencia y el cargo;
  - la línea de búsqueda.

  Si `brecha` es nula, se muestra el aviso existente.
- [x] 4.5 **Al activar un chip:** se abre «Requisitos» y se enfoca su fila. `BrechaDeRequisitos` expone el `id` con `idDeRequisito`.
- [x] 4.6 **En `ResultadoDelAnalisis.tsx`:**
  - la barra muestra `tipoDeRevision` (con `EtiquetaConvocatoria` cuando hay convocatoria);
  - «Compara con una convocatoria» aparece en el resultado sin convocatoria.
- [x] 4.7 **`HistorialDeAnalisis.tsx`:** el mismo texto de `tipoDeRevision` en cada fila.

## 5. Verificación

- [x] 5.1 Ninguna clase nueva viola `estilos.test.ts`: solo tokens y componentes base.
- [x] 5.2 Los chequeos automáticos:
  - `pnpm exec tsc --noEmit`;
  - `pnpm test`;
  - `pnpm run lint`, que debe quedar en 5 advertencias;
  - `pnpm run build`.
- [ ] 5.3 **Pruebas manuales:**
  - un CV a dos columnas: veredicto «con pérdidas» y texto intercalado;
  - un PDF escaneado: un panel único y sin plegable;
  - un CV sin aviso: tecnologías y atajo;
  - un CV con aviso al que le falta una obligatoria: chip ✗ y «no aparecerías»;
  - un CV con todas las obligatorias: «aparecerías»;
  - el teclado y el lector de pantalla en los chips.

## 6. Documentación

- [x] 6.1 **`CLAUDE.md`, sección del CV:**
  - entrada a dos columnas;
  - veredicto;
  - endpoint `texto/`;
  - «Frente a este aviso»;
  - el nuevo criterio de cierre.
- [x] 6.2 **`openspec/changes/cv-cierre-final/pendientes.md`:** marcar como resuelto «mostrar el texto del CV junto al registro del ATS».
- [ ] 6.3 No hacer commit. El usuario lo hará tras revisar.
