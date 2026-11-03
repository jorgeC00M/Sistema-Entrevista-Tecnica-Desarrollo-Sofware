## Context

Lo que hay hoy, comprobado en el código:
- **`EntradaDelAnalisis.tsx`:**
  - una tarjeta con el CV y un botón de texto «Comparar con una convocatoria (opcional)», que despliega `CampoConvocatoria`;
  - el estado local `conConvocatoria` vacía la convocatoria al plegarla.
- **`ResultadoDelAnalisis.tsx`:**
  - una barra con el texto chico «Con convocatoria / Sin convocatoria»;
  - cuatro pestañas; la tercera es «Requisitos» (`BrechaDeRequisitos`) o «Tecnologías» (`InventarioDeTerminos`).
- **`ResumenDelAnalisis.tsx`:** el espejo, «Lo primero que mejorar» y «Qué ya funciona». No dice nada de la convocatoria.
- **`BrechaDeRequisitos.tsx`** ya define tres aspectos con ícono y color de estado: `ACIERTO` (éxito), `INTERMEDIO` (progreso) y `FALLO` (error). También define las notas por estado.
- **`Curriculum.texto`** se guarda, pero `CurriculumSerializer` lo excluye a propósito.
  - El texto del encabezado y de los cuadros de texto **no se guarda**: solo vive en el `detalle` de los hallazgos `texto_en_encabezado` y `texto_en_cuadros` (`ats.py`, `_extracto`).
  - En un DOCX, el texto de las tablas sí entra en `texto` (`extractor.py`).
- **`secciones.titulo_de(linea)`** es el criterio único para reconocer un título de sección, y lo comparten `ats.py` y `segmentar()`.

## Goals / Non-Goals

**Goals:**
- Que las dos rutas se vean desde la entrada y se distingan en el resultado.
- Responder «¿paso?» con un veredicto defendible regla por regla, sin un número.
- Mostrar la prueba de cada hallazgo: el texto que leyó el ATS.

**Non-Goals:**
- Medir cosas nuevas: título, idioma, ubicación o un diccionario más grande. Eso es `filtros-y-diccionario-de-convocatoria`.
- Puntaje numérico o porcentaje de compatibilidad.
- Un puesto de referencia cuando no hay convocatoria.
- Cambiar las reglas, la caché, `VERSION_DE_REGLAS` o la revisión con IA.
- Unificar `CampoConvocatoria` con `PanelDeConvocatoria`: sigue en `pendientes.md`.

## Decisions

**D1. El modo se deduce, no se elige.** Se descartaron dos alternativas:
- **Tarjetas que obligan a elegir antes de subir:** agregan un paso.
- **Analizar al soltar el archivo:** vuelve a esconder la convocatoria y envía un documento personal sin una acción explícita.

Con dos columnas visibles, la opción 1 cuesta 2 pasos y la opción 2 cuesta 3, que es el mínimo. El texto del botón dice qué se va a recibir.

Se borra el estado `conConvocatoria` y su botón. La regla «solo se envía lo que se ve» ya la cumple `CampoConvocatoria`, que vacía la otra vía.

**D2. Atajo desde el resultado.** `CurriculumPage` ya vuelve a la entrada conservando el archivo y la convocatoria («Analizar otro» con `refZonaDelCv`). Se agrega `refZonaDeConvocatoria` y un `onCompararConConvocatoria` que navega a `/mi-cv` y enfoca esa zona. Así se reutiliza el mismo mecanismo de foco.

**D3. El veredicto es una función pura de los hallazgos.** `veredictoDeLegibilidad(analisis)` vive en `hallazgos.ts` y devuelve `{ nivel: 'ilegible' | 'con_perdidas' | 'completo', causa: Hallazgo | null }`:
- `ilegible`: alguna debilidad `critica`. `sin_capa_de_texto` es crítica, así que un CV escaneado cae aquí, aunque ese caso no llega al Resumen.
- `con_perdidas`: `campos_detectados < campos_intentados` o alguna debilidad `alta`.
- `completo`: el resto.

La causa es la primera de `debilidadesPorGravedad`.

**Por qué no un número:** ninguna fórmula de pesos se puede justificar (¿cuánto vale el correo frente a una tabla?), y un 73/100 se leería como una probabilidad de ser contratado. La regla de tres niveles se explica en una frase. Los colores reutilizan los tokens `exito`, `progreso` y `error`.

**D4. El texto del ATS sale de un endpoint aparte, por líneas.** `GET /api/curriculums/<id>/texto/` → `{ "lineas": [{ "texto": str, "seccion": str | null }] }`.
- `seccion` es `secciones.titulo_de(linea)`, el mismo criterio del análisis. Así el resaltado nunca contradice el «secciones reconocidas» del diagnóstico.
- Usa `selectors.curriculum_del_usuario(usuario, pk)` (404 si no es suyo), no llama a la IA y no escribe nada.

**Por qué no agregar `texto` al serializer del detalle:**
- el detalle y el historial se piden a menudo, y el texto completo de un CV solo hace falta si el usuario abre el plegable;
- tenerlo fuera del payload habitual mantiene la decisión de `CurriculumSerializer`, que es no repartir el CV por defecto.

**D5. «Lo que el ATS no ve» se arma con los hallazgos, no con datos nuevos.**
- **Mapa único:** un `MOTIVOS_DE_INVISIBILIDAD: Record<codigo, string>` en `hallazgos.ts` cubre `texto_en_encabezado`, `texto_en_cuadros`, `dos_columnas`, `contiene_tablas`, `contiene_imagenes`, `habilidades_en_graficos` y `texto_oculto`.
- **Cada línea:** el título y el detalle del hallazgo (que para el encabezado y los cuadros ya citan el texto escondido), más el motivo.
- **Motivos con matiz:**
  - tablas: «pueden leerse en desorden», porque el texto sí se extrae;
  - imágenes: «si una imagen tiene texto, el ATS no lo lee», porque no hay OCR y no se afirma qué contiene.
- **Sin migración:** no se guarda el texto escondido. Así no se amplía lo que se conserva de un CV real.

**D6. «Frente a este aviso» reutiliza los aspectos de la brecha.**
- **Módulo compartido:** `ACIERTO`, `INTERMEDIO`, `FALLO`, `ASPECTO_POR_ESTADO`, `NOTA_DE_TECNOLOGIA` y los de experiencia salen de `BrechaDeRequisitos.tsx` a `features/curriculum/aspectos.ts`. La pestaña Requisitos y los chips importan de ahí, sin copias.
- **Chip:** un `<button>` (con el componente `Chip`, que ya admite `onClick`) con ícono, término y un `sr-only` con la nota del estado.
- **Al activarlo:** se abre «Requisitos» y se enfoca la fila del término. Es el mismo patrón que `irA`, con un id por término (`idDeRequisito(termino)`) que también usa `BrechaDeRequisitos`.

**D7. La búsqueda del reclutador es una función pura.** `busquedaDelReclutador(brecha)` devuelve `{ apareceria: boolean, faltan: string[], soloDeclaradas: string[] }`, calculado solo sobre `brecha.obligatorios`.
- **Texto:** «Si el reclutador busca las obligatorias del aviso…». No se afirma la búsqueda exacta, porque no se conoce.
- **Avisos sin títulos:** si el aviso no separaba obligatorias de deseables (`separada: false`), todo está en obligatorias y la frase sigue siendo cierta.

**D8. El nombre del tipo vive en un solo lugar.** `tipoDeRevision(conConvocatoria)` en `hallazgos.ts` devuelve «Revisión del CV» o «Comparado con convocatoria». Lo usan la barra y el historial. La barra usa `EtiquetaConvocatoria` para la segunda, el mismo distintivo del historial de entrevistas.

## Risks / Trade-offs

- **[Reabrir una pantalla cerrada]** → El cambio está acotado a la presentación. Al terminar se actualiza el criterio de cierre en `CLAUDE.md`, y lo que aparezca después vuelve a `pendientes.md`.
- **[El texto intercalado de dos columnas puede ser largo]** → Va en una caja con altura máxima y scroll, y se carga solo al abrir el plegable.
- **[El veredicto «completo» puede verse optimista con debilidades medias]** → Las medias («Detalle») no ocultan datos al ATS. El veredicto habla de legibilidad, y las medias siguen listadas en «Mejorar».
- **[Chips con muchos términos]** → Se envuelven en filas con `flex-wrap`. Los avisos tienen pocas tecnologías, y `brecha` ya limita lo reconocido.
