## Context

Fuente: `docs/Copia de Copia de PerfilJorgeV3.docx.md`, Capítulo II, líneas 409–686. Es la copia corregida en `actualizar-perfil-capitulos-1-a-3`, que Jorge transcribe al Word oficial con la guía `docs/guia-de-transcripcion-capitulos-1-a-3.docx`. El documento no tiene lista de referencias. El Capítulo III (3.2 Definiciones) repite varios conceptos de 2.1.

## Paso 1 — Diagnóstico (sin editar)

### Secciones y solidez

| Sección | Solidez | Observación |
|---|---|---|
| 2.1 Área de conocimiento (intro) | Débil | Una sola línea. No explica cómo se relacionan la Ingeniería de Software y la IA. |
| 2.1.1 PLN | Media | Buena definición, pero la única cita es de 1999. No menciona el giro a modelos neuronales y Transformers. Las viñetas describen el sistema, no la teoría. |
| 2.1.2 Agentes conversacionales | Media | Cita adecuada (Jurafsky & Martin). Faltan la tipología (por reglas, por recuperación, generativos) y sus límites (alucinaciones). Hay un error de concordancia en el título. |
| 2.1.3 Prompt Engineering | Muy débil | Una oración. Faltan técnicas: rol, *zero-shot* / *few-shot*, salida estructurada, cadena de razonamiento. |
| 2.1.4 Entrevista técnica | Muy débil | Una oración, y es el concepto que da nombre al proyecto. Faltan los tipos de entrevista, la validez de la entrevista estructurada, la ansiedad y la práctica simulada. |
| 2.1.5 IA | Media | Está **después** de PLN y de agentes: el orden de lo general a lo específico está invertido. |
| 2.1.6 Características / 2.1.7 Elementos | Débil | Títulos sueltos (¿características de qué?). Repiten 2.1.2 y 2.1.3. No tienen citas. Errata: «texturizadas». |
| 2.1.8 Rúbrica y LLM como evaluador | Buena | Es la sección mejor fundamentada. Las tres citas están en `[VERIFICAR]`. Le falta discutir los sesgos del LLM como evaluador. Mezcla diseño del sistema (fórmula y bandas). |
| 2.1.9 ATS | Media | La idea es sólida y original, pero no tiene ni una cita. |
| 2.2 Metodología | Media | La Tabla 4 aparece antes de definir el modelo. El tamaño de equipo de Scrum (3–9) corresponde a guías anteriores a la de 2020. Las ventajas no tienen cita. 2.2.3 lista los incrementos *del sistema*. |
| 2.3 Plataforma | Débil | Sin citas. Usa REST, JWT, TypeScript, Vite y Tailwind sin definirlos. |
| 2.4 Gestión de datos | Media | Sin citas. No define ACID. 2.4.4 repite la conclusión de 2.4.3. Hay afirmaciones sobre MongoDB sin respaldo. |
| 2.5 Herramientas | Media | Citas con formato incorrecto. 2.5.4 describe sobre todo funciones del sistema. 2.5.5 no tiene citas y tiene un `[CONFIRMAR]`. |

### Conceptos clave que faltan o están débiles
1. **Modelo de lenguaje de gran escala (LLM) y Transformer.** Solo aparece como viñeta en 2.1.7 y en 3.2.3. Es la tecnología de la que depende todo el sistema.
2. **Entrevista estructurada y su validez predictiva.** Es la base para justificar las 5 preguntas con un plan fijo.
3. **Retroalimentación formativa.** Es el objetivo central del sistema y el capítulo no la trata.
4. **Evaluación automatizada de respuestas abiertas** (*automated short answer grading*). Es el antecedente directo del LLM como evaluador.
5. **Sesgos y límites del LLM como evaluador:** posición, verbosidad, autopreferencia, alucinación y variabilidad.
6. **Salida estructurada (JSON) y validación**, como parte de la ingeniería de instrucciones.
7. **Adaptación de la dificultad.** Hay que tratarla como concepto general, sin adelantar el diseño.
8. **Privacidad y minimización de datos personales** al usar servicios de IA de terceros. Respalda el enmascaramiento del CV.
9. **API REST y autenticación por tokens (JWT).**

### Afirmaciones que necesitan cita
- 2.1 intro: la ubicación disciplinar.
- 2.1.2: las capacidades de los agentes con LLM.
- 2.1.3: «un prompt bien diseñado es fundamental…».
- 2.1.6–2.1.7: todas las viñetas.
- 2.1.8: las tres referencias marcadas `[VERIFICAR]`.
- 2.1.9 completo: cómo funciona un ATS, que no rechaza por puntaje y qué formatos fallan.
- 2.2: los tamaños de equipo, la documentación «Alta / Media / Baja» y las ventajas del modelo incremental.
- 2.3: el Virtual DOM, el flujo unidireccional, MVT, el ORM y DRF.
- 2.4: ACID, `jsonb`, «alta velocidad» de MongoDB, sus transacciones «con limitaciones» y la vigencia de Djongo.
- 2.5: «uno de los editores más utilizados a nivel mundial», la política de datos de Anthropic y Render/Neon.

### Repeticiones, saltos de lógica y opinión
- **Repetición:** 2.1.7 repite 2.1.2 y 2.1.3. 2.4.4 repite el último párrafo de 2.4.3. Los conceptos de 2.1 se repiten en 3.2 (va a la lista de revisión, no se toca).
- **Saltos de lógica:** IA (2.1.5) aparece después de sus subcampos. Tabla 4 aparece antes de la definición. 2.1.6 y 2.1.7 no dicen de qué concepto son.
- **Suena a opinión:** «un prompt bien diseñado es fundamental», «genera confianza en el avance», «se adapta bien a proyectos académicos», «reduce la curva de aprendizaje», «alta velocidad de escritura», «uno de los entornos más utilizados».
- **Formato de citas:** «(Chacon & Straub, 2014\)» va después del punto final. «Liu, Y. et al.» no sigue APA 7. «(Microsoft, 2015)» no tiene obra identificable. «Natural(PLN)» no tiene espacio.

### Para revisar manualmente (contenido de otro capítulo, se deja en su lugar)
| # | Ubicación | Contenido | Capítulo que le correspondería |
|---|---|---|---|
| 1 | 2.1.1, viñetas | Lo que hace *el sistema* con el PLN | Diseño / ingeniería del proyecto |
| 2 | 2.1.5, segunda oración | El rol de la IA en el sistema | I (Área de conocimiento 1.4) o diseño |
| 3 | 2.1.8, párrafos 2–4 y Tabla 3 | Fórmula P, niveles del sistema y bandas | Diseño de la evaluación (ingeniería) |
| 4 | 2.1.9, última oración | «el módulo de análisis de CV mide…» | Diseño |
| 5 | 2.2, párrafo tras Tabla 4 y 2.2.3 | Elección del modelo e incrementos del sistema | Metodología aplicada (si existe un capítulo de desarrollo) |
| 6 | 2.3.1–2.3.3 | «en el presente proyecto React se usa…» | Diseño de la arquitectura |
| 7 | 2.4.2, viñetas de PostgreSQL | Ejemplos del sistema (cada respuesta pertenece a…) | Diseño de datos |
| 8 | 2.5.4, las cuatro funciones de la API | Cómo el sistema usa Claude | Diseño |
| 9 | 2.5.5 Despliegue | Infraestructura del piloto | Implementación |
| 10 | 3.2.1–3.2.5 | Repiten 2.1.1–2.1.5 | Decidir cuál se queda con la definición extensa |

En una tesis de la UMSS es habitual que el Marco teórico mencione para qué se usa cada tecnología. Por eso estos puntos se **marcan, no se juzgan**: decide Jorge.

## Paso 2 — Plan por sección (pendiente de aprobación)

- **2.1 intro.** Ampliar a un párrafo que sitúe la IA aplicada dentro de la Ingeniería de Software y anuncie el recorrido de lo general a lo específico.
- **Orden de 2.1.** Para respetar la numeración, no se renumera. En su lugar, 2.1.1 se abre con un párrafo puente que remite a la definición de IA de 2.1.5. *Alternativa, que necesita aprobación: mover 2.1.5 al inicio y renumerar 2.1.1–2.1.5.* Es una reorganización dentro del mismo capítulo, no un traslado entre capítulos.
- **2.1.1 PLN.** Agregar la evolución de reglas a modelos estadísticos, neuronales y Transformers (Vaswani et al., 2017), con fuentes recientes. Conservar Manning & Schütze como clásico. Las viñetas se mantienen.
- **Nueva subsección «Modelos de lenguaje de gran escala».** Concepto, preentrenamiento, cómo genera texto, estado actual y límites como las alucinaciones. Se ubica tras 2.1.1 con el número siguiente libre (2.1.10) o como inciso de 2.1.1 (D2). Lleva una figura descrita: «esquema simplificado del Transformer».
- **2.1.2 Agentes.** Agregar la tipología y una **tabla nueva**: agentes por reglas, por recuperación y generativos, comparados por flexibilidad, control, riesgo de error y ejemplo.
- **2.1.3 Prompt Engineering.** Desarrollar las técnicas (rol, *zero-* y *few-shot*, instrucciones estructuradas, salida JSON, cadena de razonamiento) con una **tabla resumen** de técnica, en qué consiste y para qué sirve.
- **2.1.4 Entrevista técnica.** Desarrollarla en profundidad:
  - entrevista estructurada frente a no estructurada y su validez;
  - preguntas técnicas, conductuales y de caso;
  - el efecto de la ansiedad;
  - la práctica simulada.

  Lleva una **tabla** de tipos de entrevista y cierra con el vínculo al problema: falta de práctica.
- **Nueva «Retroalimentación formativa».** Concepto, características de una retroalimentación eficaz y su relación con la práctica repetida.
- **2.1.6 / 2.1.7.** Retitular como «Características de los sistemas de IA conversacional» y «Elementos principales», citar cada viñeta y corregir la errata. 2.1.7 deja de repetir: remite a 2.1.2–2.1.3 y agrega el LLM.
- **2.1.8.** Validar las tres citas. Agregar los antecedentes de evaluación automatizada de respuestas abiertas, los sesgos conocidos del LLM evaluador y las técnicas de mitigación. Agregar una **tabla** de evaluación humana, por reglas y LLM con rúbrica. La fórmula y la Tabla 3 se quedan donde están (lista de revisión).
- **2.1.9 ATS.** Respaldar con fuentes el funcionamiento (análisis del documento, campos, búsqueda booleana) y los problemas de lectura de formatos. Agregar una figura descrita: «flujo de un ATS: recepción → extracción → campos → búsqueda del reclutador». Agregar un párrafo sobre minimización de datos personales.
- **2.2.** Definición primero y Tabla 4 después, dentro de la misma sección; la tabla conserva su número. Citar a Pressman & Maxim, Sommerville, la Guía Scrum 2020 y Beck para XP. Corregir el tamaño de equipo de Scrum. Citar o reformular las ventajas.
- **2.3.** Definir API REST (Fielding, 2000) y JWT (RFC 7519). Citar la documentación oficial de React, Django, DRF, TypeScript, Vite y Tailwind. Revisar «Virtual DOM» contra la documentación vigente.
- **2.4.** Definir ACID (Härder & Reuter, 1983) y `jsonb` (documentación de PostgreSQL). Respaldar o matizar las afirmaciones sobre MongoDB y Djongo. 2.4.4 se reduce a lo que no repite 2.4.3.
- **2.5.** Corregir el formato de las citas. Pro Git respalda Git; GitHub se respalda con su documentación oficial. Citar VS Code con su documentación y, para «el más utilizado», la encuesta Stack Overflow. Verificar la política de datos de Anthropic. Citar Render y Neon.
- **Cierre de cada sección.** Una o dos oraciones que enlacen el concepto con el problema (1.2), sin adelantar el diseño.

## Goals / Non-Goals

**Goals:** profundidad, citas verificables, coherencia de lo general a lo específico y conservar la voz del autor.

**Non-Goals:**
- Reescribir desde cero.
- Mover contenido entre capítulos.
- Tocar los Capítulos I y III.
- Mencionar los proveedores de respaldo no documentados (Gemini, DeepSeek): decisión ya tomada.

## Decisions

- **D1. El Word es el entregable; el `.md` del perfil no se modifica en este cambio.** Jorge transcribe al documento oficial desde el Word. Actualizar el `.md` duplicaría el trabajo y podría chocar con `actualizar-perfil-capitulos-1-a-3`, que está abierto. Al final se ofrece sincronizarlo.
- **D2. Numeración.** Los conceptos nuevos de 2.1 entran como 2.1.10, 2.1.11… para no renumerar lo existente. Otra opción es que se intercalen y se renumere, si Jorge lo aprueba en el Paso 2. Las tablas y figuras nuevas toman el número siguiente en el orden de aparición, y se entrega la lista de renumeración del resto del documento: hoy la Tabla 6 y la Figura 6 empiezan en el Capítulo III.
- **D3. El Word se genera con un script**, `docs/herramientas/generar_marco_teorico.py`, con `python-docx`, siguiendo el estilo de `generar_guia.py`. Así se puede regenerar tras cada corrección sin editar el Word a mano.
- **D4. Antes y después en el chat.** Se muestra sección por sección en el Paso 4 y también queda en `docs/marco-teorico-fuentes.md`.
- **D5. Política de fuentes.** Prioridad:
  1. artículos arbitrados y libros académicos;
  2. normas y RFC;
  3. documentación oficial;
  4. informes técnicos.

  Se prefieren fuentes de 2018–2026, salvo clásicos (Manning & Schütze, Fielding, Härder & Reuter). Ningún blog como sustento principal. Cada fuente se abre (DOI/URL) antes de entrar a la tabla.
- **D6. Línea «Fuente:».** Va en un párrafo propio, en cursiva y tamaño menor, inmediatamente después del párrafo citado. Así se puede quitar de una vez antes de entregar si el tribunal no la quiere.

## Risks / Trade-offs

- **Fuentes de pago:** del libro de Pressman o de Russell & Norvig solo se puede verificar la ficha, no el contenido. Se marcan `[VERIFICAR página]` y van a la lista de verificación.
- **Recuperar fuentes de memoria:** es el mayor riesgo de una cita falsa. Mitigación: solo entra a la tabla lo que se abrió en la sesión, con su URL.
- **Extensión:** profundizar puede duplicar el capítulo. Cada agregado debe responder a un punto del diagnóstico.

## Open Questions

- ¿Se reordena 2.1 con IA primero, renumerando, o se usa el párrafo puente?
- ¿Los conceptos nuevos van como 2.1.10+ o intercalados con renumeración?
- ¿En qué servicio se publica el frontend (2.5.5 `[CONFIRMAR]`)?
- ¿La línea «Fuente:» se queda en la versión final o es solo para la revisión?
