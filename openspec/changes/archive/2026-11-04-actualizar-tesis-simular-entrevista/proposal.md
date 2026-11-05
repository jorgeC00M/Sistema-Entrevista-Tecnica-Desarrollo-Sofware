## Why

`simular-entrevista` renombró la pantalla a «Simular entrevista» y dejó pendiente la tarea 4.2: la tesis seguía diciendo «Nueva Entrevista». Jorge pidió además revisar sus dos Word del marco teórico y modificarlos solo si había algo desactualizado.

Ninguno de los dos dice «Nueva entrevista». Pero en 2.5.4, la lista de funciones de la API de Claude no incluye al redactor del veredicto que agregó `reporte-de-entrevista-en-pestanas`.

## What Changes

**Perfil** (`docs/Copia de Copia de PerfilJorgeV3.docx.md`):
- «Formulario de Nueva Entrevista» pasa a «Formulario «Simular entrevista»» en 10 líneas:
  - 168 y 170: índice de figuras;
  - 218 y 220: índice de tablas;
  - 994 y 1008: títulos de sección;
  - 998 y 1012: Figuras 12 y 13;
  - 1006 y 1019: Tablas 17 y 18.

  Cada línea conserva su formato markdown.
- En la línea 1046, «Abre una nueva entrevista con el mismo puesto y nivel preseleccionados.» pasa a «Abre «Simular entrevista» con el mismo puesto y nivel preseleccionados.».

**Marco teórico** (`docs/capitulo-2-marco-teorico.docx` y `docs/capitulo-2-marco-teorico-entrega.docx`):
- En 2.5.4, justo después de la viñeta «Evaluar cada respuesta…», se agrega una viñeta con el mismo formato:

  > **Redactar un veredicto breve** del reporte al terminar la entrevista, a partir de las evaluaciones ya guardadas, sin recibir las respuestas y sin modificar la nota.

**No cambian**, por decisión de Jorge:
- «resultados, historial y retroalimentación» en los incrementos de la metodología;
- el marcador `[REVISAR MANUALMENTE 10]`;
- el resto de los documentos.

## Capabilities

### New Capabilities
- `tesis-alineada-con-el-sistema`: la tesis nombra la pantalla y las funciones de la IA tal como están en el sistema.

### Modified Capabilities
- (ninguna)

## Impact

- **Documentos:** solo los tres archivos de `docs/` mencionados. No se toca código, specs del sistema ni `CLAUDE.md`.
- **Sin git:** la tesis no se sube al repositorio. Por eso, antes de editar se guarda una copia de respaldo de cada archivo en el scratchpad.
- **Word abierto:** los dos `.docx` tienen archivos de bloqueo `~$`. Jorge debe cerrarlos antes del apply para que Word no sobrescriba el cambio.
- **Lo que hace Jorge al cerrar:**
  - revisar los documentos en Word;
  - actualizar los índices;
  - llevar los mismos cambios a su perfil en Word si lo mantiene aparte del `.md`.
