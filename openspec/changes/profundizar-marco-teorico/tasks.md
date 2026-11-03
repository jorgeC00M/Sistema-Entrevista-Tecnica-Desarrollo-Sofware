## 1. Diagnóstico y plan

- [x] 1.1 Leer el Capítulo II completo y redactar el diagnóstico: solidez, conceptos faltantes, afirmaciones sin cita, repeticiones, saltos de lógica y opinión (`design.md`, Paso 1).
- [x] 1.2 Armar la lista «Para revisar manualmente» sin mover nada.
- [x] 1.3 Proponer el plan por sección (`design.md`, Paso 2).
- [x] 1.4 **Aprobación de Jorge** (dada con `/opsx:apply` el 01-11-2026; las Open Questions se resolvieron con supuestos: párrafo puente, nuevos como 2.1.10+, frontend `[CONFIRMAR]`, la línea «Fuente:» se mantiene) del plan y respuesta a las Open Questions: orden de 2.1, numeración, servicio del frontend, línea «Fuente:». No se pasa al paso 2 sin ella.

## 2. Investigación

- [x] 2.1 Buscar y abrir fuentes por tema:
  - IA;
  - PLN y Transformer;
  - LLM;
  - agentes;
  - prompting;
  - entrevista estructurada y técnica, y ansiedad;
  - retroalimentación formativa;
  - evaluación automatizada y LLM como evaluador, con sus sesgos;
  - ATS;
  - privacidad y minimización de datos;
  - modelo incremental, Scrum y XP;
  - React, Django, DRF, REST y JWT;
  - PostgreSQL, ACID, `jsonb` y MongoDB;
  - Git y GitHub, Python, VS Code, la API y la política de datos de Anthropic, Render y Neon.

  Leer al menos el resumen y los datos clave de cada una.
- [x] 2.2 Verificar las citas que el texto ya tiene: Manning & Schütze 1999, Jurafsky & Martin 2023, Liu et al. 2023 (P. Liu, *prompting*), Behroozi et al. 2019, Russell & Norvig 2022, Y. Liu et al. 2023, Kim et al. 2024, Zheng et al. 2023, Pressman & Maxim 2020, Sommerville 2019, Chacon & Straub 2014, Van Rossum & Drake 2009 y Anthropic. Corregir el año o los datos que no coincidan.
- [x] 2.3 Escribir la tabla de fuentes (tema, fuente, tipo, DOI/URL, idea que respalda) en `docs/marco-teorico-fuentes.md` y presentarla.
- [x] 2.4 **Aprobación de Jorge** de la tabla de fuentes (01-11-2026; Sommerville confirmado como 2016).

## 3. Redacción

- [x] 3.1 Redactar 2.1 (intro, 2.1.1–2.1.9 y las subsecciones nuevas) integrando las citas aprobadas. Mostrar el antes y el después de cada sección.
- [x] 3.2 Redactar 2.2, con la definición antes que la Tabla 4, las citas y la corrección del dato de Scrum. Mostrar el antes y el después.
- [x] 3.3 Redactar 2.3, con REST, JWT y la documentación oficial. Mostrar el antes y el después.
- [x] 3.4 Redactar 2.4, con ACID y `jsonb`, y sin la repetición de 2.4.4. Mostrar el antes y el después.
- [x] 3.5 Redactar 2.5, con el formato de citas corregido y la política de datos verificada. Mostrar el antes y el después.
- [x] 3.6 Agregar las tablas nuevas (agentes, técnicas de prompting, tipos de entrevista, enfoques de evaluación) y los párrafos que describen las figuras nuevas, con numeración correlativa y la lista de renumeración del resto del documento.

## 4. Referencias y entregable

- [x] 4.1 Generar la lista de referencias en APA 7 y cruzarla con las citas del texto: cada cita tiene su referencia y cada referencia está citada.
- [x] 4.2 Escribir la lista de verificación: fuente, DOI/URL e idea atribuida, para comprobarla a mano.
- [x] 4.3 Escribir `docs/herramientas/generar_marco_teorico.py` (con `python-docx`, siguiendo el estilo de `generar_guia.py`) y generar `docs/capitulo-2-marco-teorico.docx`: capítulo, referencias, «Para revisar manualmente» y lista de verificación.
- [x] 4.4 Abrir el Word generado y revisar títulos, tablas, pies, líneas «Fuente:» y que no queden marcas Markdown.
- [ ] 4.5 Revisión final de Jorge. Ofrecer sincronizar el `.md` del perfil (D1).
