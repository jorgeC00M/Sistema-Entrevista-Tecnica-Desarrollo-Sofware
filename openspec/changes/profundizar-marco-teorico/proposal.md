## Why

El Capítulo II (Marco teórico) de `docs/Copia de Copia de PerfilJorgeV3.docx.md` (líneas 409–686) es delgado y no resiste una defensa:

- Varias secciones se resuelven en una sola oración: 2.1.3 *Prompt Engineering* y 2.1.4 *Entrevista técnica*.
- Faltan conceptos centrales del proyecto: qué es un LLM y la arquitectura Transformer, la retroalimentación formativa, la entrevista estructurada, la evaluación automatizada de respuestas abiertas y la privacidad o minimización de datos.
- La mayoría de las afirmaciones técnicas no tienen cita. Las que hay usan un formato APA incorrecto y el documento no tiene una lista de referencias.
- Hay contenido de diseño del sistema mezclado con la teoría: la fórmula, las bandas, las funciones de la API y los incrementos del sistema.

Jorge pidió profundizarlo **sin reemplazarlo**, con citas APA 7 verificables y un enlace a la fuente al final de cada párrafo citado. Pidió entregarlo como un Word que contenga solo este capítulo.

## What Changes

- Se mejora y profundiza cada sección del Capítulo II y se conserva su estructura, su voz y su enfoque. La numeración 2.1–2.5 y las Tablas 3–5 y Figuras 2–5 se mantienen. Las tablas o figuras nuevas siguen la numeración correlativa y se señalan para renumerar.
- Se agregan conceptos que faltan **dentro de las secciones existentes**, como subsecciones nuevas de 2.1, sin abrir capítulos nuevos.
- Cada afirmación técnica importante se cita en APA 7. Debajo de cada párrafo citado va la línea «Fuente:» con el DOI o la URL.
- Solo se usan fuentes encontradas y leídas en esta sesión, al menos el resumen y los datos clave. Lo dudoso se marca `[VERIFICAR]`.
- **No se mueve contenido entre capítulos.** Lo que pertenece a otro capítulo se deja en su lugar y se anota en la lista «Para revisar manualmente».
- El trabajo sigue cinco pasos con dos puertas de aprobación:
  1. Diagnóstico.
  2. Plan (**aprobación**).
  3. Investigación, con la tabla de fuentes (**aprobación**).
  4. Redacción con el antes y el después de cada sección.
  5. Referencias y lista de verificación.
- Entregable: `docs/capitulo-2-marco-teorico.docx`.

## Capabilities

### New Capabilities
<!-- ninguna -->

### Modified Capabilities
- `perfil-academico`: se agregan los requisitos del Marco teórico. Ese capability lo introduce el cambio `actualizar-perfil-capitulos-1-a-3`, todavía sin archivar.

## Impact

- Archivos nuevos:
  - `docs/capitulo-2-marco-teorico.docx`.
  - `docs/herramientas/generar_marco_teorico.py`, que genera el Word con `python-docx`, ya instalado en `backend/.venv`, igual que `generar_guia.py`.
  - `docs/marco-teorico-fuentes.md`: la tabla de fuentes aprobada y la lista de verificación.
- No se toca el código del sistema.
- No se toca el texto de los Capítulos I y III. Tampoco se toca el `.md` del perfil (ver design, D1).
- Depende de la búsqueda web (WebSearch / web-fetch), que está disponible en esta sesión.
