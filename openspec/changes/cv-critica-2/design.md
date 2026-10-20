## Context

- **`services.analizar()`:**
  1. extrae el documento y busca el caché por `(usuario, hash_texto, hash_convocatoria)`;
  2. en una transacción, crea o reutiliza el `Curriculum` (guarda `texto`, `formato`, `paginas`, `convocatoria`) y hace `update_or_create` del `AnalisisATS`;
  3. **fuera** de la transacción, llama a `_guardar_revision()`, que llama a `revision.revisar(documento, vinetas, brecha, convocatoria, revisor)` y actualiza solo la columna `revision_ia`.

  Si el diagnóstico está vigente pero `revision.necesita_revision()` lo pide (nunca se pidió, o `no_disponible`), reintenta la revisión dentro de la misma petición.
- **`revision.revisar()`** usa del documento solo `tiene_capa_de_texto`, `texto` (segmentación, nombre, enmascarado) y nada más.
- **`DocumentoExtraido.tiene_capa_de_texto`** depende de `paginas` y `texto`. Todo eso está guardado en `Curriculum`; el archivo no.
- **Tiempo límite del cliente:** `TIMEOUT_POR_DEFECTO_MS = 45_000` (`api/client.ts`), y `analizarCurriculum` no lo cambia.
- **CV escaneado:** `ats.py` emite `sin_capa_de_texto` con un detalle pensado para PDF escaneados. `VERSION_DE_REGLAS = 2`.

Ver proposal.md.

## Goals / Non-Goals

**Goals:**
- El diagnóstico al instante.
- La IA como paso posterior y reintentable.
- Mensajes de CV ilegible fieles al formato.
- Un único conteo.
- Tokens tipográficos vigilados.
- El paso a practicar visible en móvil.

**Non-Goals:**
- Hacer asíncrona la IA de las entrevistas.
- Colas o tareas en segundo plano (el plan gratuito no tiene un programador de tareas fiable).
- Los P2 de la crítica.
- Cambiar el contrato del proveedor de IA.

## Decisions

### D1. Dos peticiones, sin cola
- **`services.analizar()`** deja de llamar a `_guardar_revision()` en los dos caminos (el nuevo y el cacheado). Devuelve el `Curriculum`, con `revision_ia` tal como esté (`null` si nunca se pidió).
- **Nuevo `services.revisar(usuario, pk, revisor=None) -> dict`:**
  1. `selectors.curriculum_del_usuario(usuario, pk)` (404 si es ajeno) y su `analisis`;
  2. si `not revision.necesita_revision(analisis.revision_ia)`, devuelve la vigente;
  3. si no, reconstruye `DocumentoExtraido(texto=c.texto, formato=c.formato, paginas=c.paginas)` y llama a `_guardar_revision(analisis, documento, c.convocatoria, revisor)`.
- **La reconstrucción es fiel para la revisión:** `revisar()` solo usa `texto` y `tiene_capa_de_texto`. Las partes ocultas (`texto_en_cuadros`, `texto_en_encabezado`) no se envían nunca a la IA, así que no hace falta guardarlas.
- **Vista `CurriculumRevisionView`:** `POST`, `IsAuthenticated`, `throttle_scope = "revisar-cv"` (`"30/hour"` en `base.py`). Responde 200 con `{"revision_ia": …}`.
- **Ruta:** `path("<int:pk>/revision/", …, name="curriculums-revision")`.
- **Por qué sin cola:** el frontend la lanza al recibir el diagnóstico, así que la espera ya no bloquea el resultado. Sin Celery ni cron.
- **Concurrencia:** dos peticiones simultáneas podrían llamar dos veces al proveedor. Se acepta: no corrompe nada, porque cada una hace `update` de una sola columna con un resultado válido, y la siguiente lectura usa la caché.
- **Por qué la frontera con la IA no cambia:** `services` ya importaba `revision`, y la nueva vista llama a `services`. La prueba estática (solo `revision.py` importa `integrations.ia`) y la del guardia `sys.meta_path` se amplían al nuevo camino.

### D2. Cliente: diagnóstico, luego sugerencias
- **`api/curriculums.ts`:**
  - `pedirRevision(id, signal?)`, un `POST` con `timeoutMs: 120_000`;
  - se corrige el comentario "solo CPU" de `analizarCurriculum`, que ahora sí es solo medición.
- **`CurriculumPage`** conserva `resultado`. Un efecto ligado a `resultado?.id` pide las sugerencias cuando `revision_ia === null`, y se dispara al analizar y al abrir desde el historial.
  - Estado local `estadoDeRevision: 'pidiendo' | 'lista' | 'fallo'`.
  - Al responder, fusiona `revision_ia` en `resultado.analisis`.
  - Si hay error o se agota el tiempo, `'fallo'`.
  - El efecto se aborta al cambiar de resultado.
  - Se usa un efecto y no un handler porque abrir desde el historial también debe dispararlo, y ese efecto sincroniza con un sistema externo (la red): no es un `setState` derivado.
- **`AvisoDeRevision`** recibe `pidiendo` y `onReintentar`:
  - pidiendo: icono + "Pidiendo sugerencias a la IA…" en `aria-live="polite"`;
  - `no_disponible` o fallo: el motivo + `Boton variante="texto"` "Reintentar sugerencias", que hace la misma `pedirRevision`.
  - Se muestra en cada pestaña que depende de la IA: Resumen, Mejorar (viñetas y redacción), Requisitos y Entrevista.
- **Fallo en el cliente:** se pinta como `no_disponible` con el motivo "No pudimos obtener las sugerencias a tiempo. El diagnóstico no depende de ellas.". El servidor puede haber terminado; reintentar lo leerá de la caché.

### D3. CV ilegible por formato
- **Frontend (`ResultadoDelAnalisis`):** título según `curriculum.formato` (`pdf`: "Tu PDF es una imagen"; si no, "Tu documento no tiene texto que el ATS pueda leer"). Bajo el detalle, una `EtiquetaMono` "El ATS extrae 0/8 campos" (con `parseabilidad`) en lugar del `EspejoDelATS` completo.
- **Backend (`ats.py`):** el hallazgo `sin_capa_de_texto` elige su `detalle` según el formato.
  - **DOCX con `texto_en_cuadros` no vacío:** "Tu texto está dentro de cuadros de texto, que un ATS no lee. Copia el contenido al cuerpo del documento, fuera de los cuadros, y quita los cuadros."
  - **Otro DOCX:** "El documento no contiene texto que el ATS pueda leer: suele ser porque el contenido está como imagen. Escribe el CV como texto en Word o Google Docs."
  - **PDF:** el detalle actual.
- **`VERSION_DE_REGLAS = 3`:** así los análisis guardados con el detalle viejo se recalculan al volver a subirlos, conforme a la regla del módulo.
- **Tests en `tests/integration/test_ats.py`:** un `DocumentoExtraido` DOCX con el texto vacío y con o sin `texto_en_cuadros`.

### D4. Un conteo, una definición
- **`hallazgos.ts`** exporta `porMejorar(analisis)`: debilidades + `vinetas?.sin_resultado.length` + `revision_ia?.correcciones.length`. Con test.
- **Pestaña:** `Mejorar · ${porMejorar}`.
- **Botón del Resumen:** "Ver todo en Mejorar", sin número.
- **El número crece cuando llegan las correcciones de la IA:** es correcto y se ve en vivo; no se anuncia para no hacer ruido.

### D5. Tipografía y guarda
- **Reemplazos:** `text-headline-lg` pasa a `text-headline-md` en la barra del resultado (el `h2` del archivo) y en `VinetasDeLogro`. El `h1` de la página ya usa `headline-xl`, así que la jerarquía queda ordenada.
- **Guarda en `estilos.test.ts`:**
  1. lee `src/styles/tokens.css`;
  2. extrae los nombres `--text-<nombre>:`;
  3. deriva las familias (el primer segmento: `headline`, `body`, `label`, `metric`, `meta`, `cuerpo`…);
  4. falla si en un `.tsx` aparece `text-<familia>-<x>` o `text-<familia>` cuyo `<nombre>` no esté definido.

  No se incluyen los colores (`text-vidrio-*`, `text-error-*`…), que tienen su propia guarda. Se verifica inyectando un `text-headline-lg` y viendo que falla.

### D6. Móvil
- **`Pestanas`:** `gap-4 sm:gap-6`.
- **Rótulos cortos:** "Resumen", `Mejorar · n`, "Requisitos" o "Tecnologías", "Entrevista".
- **"Practicar la entrevista" en el Resumen:**
  - se extrae `destinoDePractica(revision)` desde `PreguntasProbables` a `features/curriculum/practica.ts`, para no duplicar la URL `?puesto=`;
  - al final del Resumen va un `Link` con `clasesDeBoton({ variante: 'secundario' })`.
- **Filas apiladas por debajo de 640 px:**
  - `EspejoDelATS` aplica el apilado `flex-col sm:flex-row` siempre, no solo en el modo compacto; se simplifica la prop `compacto`, que queda solo para el párrafo;
  - `FilaDeRequisito` (`BrechaDeRequisitos.tsx`) pasa de `w-32 shrink-0` a `sm:w-32 sm:shrink-0` dentro de `flex-col sm:flex-row`.

## Risks / Trade-offs

- [Dos llamadas por análisis] → la segunda está en caché: solo llama al proveedor la primera vez, o tras un fallo.
- [El usuario cierra la pestaña antes de que llegue la IA] → `revision_ia` queda en `null`, y abrir el análisis desde el historial la pide.
- [Cambio de API] → el frontend es el único cliente, y `null` ya era posible en análisis anteriores a la revisión.
- [`VERSION_DE_REGLAS = 3` hace recalcular análisis cacheados] → es el comportamiento previsto del módulo; el costo es CPU, sin IA.
- [Aun con rótulos cortos, a 320 px las pestañas pueden pasar el ancho] → la lista ya se desplaza en horizontal; se comprueba en la prueba manual.

## Ajustes al implementar

- **El estado de la revisión vive en un hook,** `features/curriculum/hooks/useRevisionDelCv.ts`. "Pidiendo" no se guarda: se deriva de que `revision_ia` sea `null` y no haya fallado. Así el efecto no hace `setState` síncrono (sin avisos nuevos de lint) y reintentar sin revisión guardada solo tiene que quitar el fallo.
- **Una sola región `sr-only` con `aria-live`** en `ResultadoDelAnalisis` anuncia el estado de las sugerencias. Los avisos visibles de cada pestaña no la repiten, para que cambiar de pestaña no vuelva a anunciarlo.
- **Un alta que quedó a medias** (un `Curriculum` sin análisis) hace que `services.revisar()` responda 404 en lugar de 500.
- **Recalcular el diagnóstico pone `revision_ia` a `None`:** las sugerencias anteriores se anclaban a viñetas y requisitos que pudieron cambiar.
- **El motivo de `no_disponible` en `revision.py`** decía "vuelve a subir el mismo CV" y "el diagnóstico de arriba". Ahora dice que se puede reintentar sin volver a subirlo.
- **La guarda tipográfica** se escribió primero con `\w` dentro de un template literal, donde la barra se pierde. Se cambió por una clase de caracteres explícita y se verificó inyectando `text-headline-lg`: falla nombrando archivo y línea, y pasa al revertirlo.
