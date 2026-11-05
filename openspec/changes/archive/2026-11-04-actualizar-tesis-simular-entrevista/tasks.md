## 1. Preparación

- [x] 1.1 Comprobar que no existan `docs/~$pitulo-2-marco-teorico.docx` ni `docs/~$pitulo-2-marco-teorico-entrega.docx`. Si siguen, detenerse y pedirle a Jorge que cierre Word.
- [x] 1.2 Copiar los tres archivos al scratchpad como respaldo:
  - `Copia de Copia de PerfilJorgeV3.docx.md`;
  - `capitulo-2-marco-teorico.docx`;
  - `capitulo-2-marco-teorico-entrega.docx`.

## 2. Perfil

- [x] 2.1 Reemplazar «Formulario de Nueva Entrevista» por «Formulario «Simular entrevista»» (6 coincidencias: 168, 170, 994, 998, 1008, 1012) y, en las tablas, «Campos del formulario de Nueva Entrevista» por «Campos del formulario «Simular entrevista»» (4 coincidencias: 218, 220, 1006, 1019), con su minúscula.
- [x] 2.2 En la línea 1046, «Abre una nueva entrevista con el mismo puesto» pasa a «Abre «Simular entrevista» con el mismo puesto», exigiendo 1 coincidencia exacta.

## 3. Marco teórico (los dos `.docx`)

- [x] 3.1 En cada `.docx`, clonar el `w:p` de «Evaluar cada respuesta con la rúbrica analítica…» con su `w:pPr` y el `w:rPr` del primer run. La copia lleva dos runs, como las demás viñetas: «**Redactar un veredicto breve**» en negrita y «del reporte al terminar la entrevista, a partir de las evaluaciones ya guardadas, sin recibir las respuestas y sin modificar la nota.» normal. Insertar la copia justo después del original. Los demás miembros del ZIP se copian sin cambios.

## 4. Verificación

- [x] 4.1 Perfil: 0 coincidencias de «Nueva Entrevista» y 10 de «Formulario «Simular entrevista»». Un `diff` contra el respaldo muestra solo las 11 líneas.
- [x] 4.2 En cada `.docx`, releer `document.xml`:
  - hay un párrafo más;
  - la viñeta nueva sigue a «Evaluar…» y precede a «Analizar convocatorias…»;
  - su `w:pPr` es igual al del original;
  - el ZIP se abre sin errores.
- [x] 4.3 Ejecutar `openspec validate actualizar-tesis-simular-entrevista`.

## 5. Cierre (lo hace Jorge)

- [ ] 5.1 Abrir los dos `.docx` en Word y revisar que la viñeta nueva tenga el mismo formato que las otras.
- [ ] 5.2 Actualizar los índices en Word (clic derecho > Actualizar campo).
- [ ] 5.3 Si el perfil también vive en un Word aparte, aplicar ahí los mismos 11 cambios.
- [ ] 5.4 La tesis no va a git: no hay commit.
