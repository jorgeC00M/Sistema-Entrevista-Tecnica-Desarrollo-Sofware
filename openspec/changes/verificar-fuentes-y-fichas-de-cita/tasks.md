## 1. Verificación de enlaces

- [ ] 1.1 Abrir con `web-fetch`, en lotes de unas 15, las URL de las 50 referencias y de las líneas «Fuente:».
- [ ] 1.2 Anotar en `docs/marco-teorico-fuentes.md`, para cada fuente:
  - su estado (`abre`, `resumen`, `pago`, `404` o `rechazado`);
  - el registro consultado;
  - la fecha de verificación.
- [ ] 1.3 Para las fuentes que devuelven 403 o rechazan la conexión (ACM, Hindawi, par.nsf.gov), verificarlas a través de Crossref, arXiv, RePEc, Semantic Scholar o el repositorio del autor.

## 2. Enlaces abiertos y reemplazos

- [ ] 2.1 Para cada obra con estado `pago` o `resumen`, buscar una versión de texto completo abierta: arXiv, repositorio institucional, página del autor, SciELO, Redalyc o Dialnet.
- [ ] 2.2 Para cada obra sin ninguna versión accesible (por ahora *Hidden Workers*, Powell 2018 y los dos estudios de Behroozi si no aparecen), proponer una fuente sustituta que respalde la misma idea.
- [ ] 2.3 **Aprobación de Jorge** de los reemplazos, presentados en una tabla: fuente actual, problema, sustituta e idea que respalda.

## 3. Fuentes en español

- [ ] 3.1 Buscar en SciELO, Redalyc y Dialnet artículos arbitrados de los últimos 8 años sobre las ideas que ya están en el texto: entrevista estructurada, ansiedad en la entrevista, retroalimentación formativa, reclutamiento o ATS, chatbots y evaluación automática.
- [ ] 3.2 **Aprobación de Jorge** de las fuentes en español, presentadas en una tabla: tema, fuente, URL e idea que respalda.

## 4. Fichas de cita

- [ ] 4.1 Confirmar cómo llama Google Docs a sus tipos de fuente y al campo «modo de acceso» (D3).
- [ ] 4.2 Escribir en el borrador la tabla «Fichas de cita»: una fila por obra con su clave y sus campos, con fechas según D4 y autores corporativos donde corresponda.
- [ ] 4.3 Redactar el resumen de dos líneas de cada obra, a partir de lo que se leyó al verificarla.

## 5. Actualización del borrador y del Word

- [ ] 5.1 Actualizar las líneas «Fuente:», las referencias APA 7 y la lista de verificación con los enlaces nuevos, los reemplazos y las fuentes en español aprobadas. Integrar las citas nuevas en el texto con el mínimo cambio.
- [ ] 5.2 Ampliar `docs/herramientas/generar_marco_teorico.py`:
  - generar las fichas debajo de cada línea «Fuente:», con el resumen en verde;
  - agregar la opción `--sin-fichas`;
  - ampliar el cruce de datos para que compare citas, fichas y referencias;
  - poner un aviso en la primera página del Word de trabajo.
- [ ] 5.3 Generar `docs/capitulo-2-marco-teorico.docx`, con fichas, y la versión de entrega sin fichas. Revisar ambos:
  - ninguna marca Markdown;
  - una ficha por cada obra citada;
  - ningún enlace con estado `404` o `rechazado`.
- [ ] 5.4 Revisión final de Jorge.
