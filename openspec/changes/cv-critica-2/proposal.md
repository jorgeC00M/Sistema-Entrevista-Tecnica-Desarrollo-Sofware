## Why

La segunda crítica de Impeccable de "Revisar mi CV" (24/40, en `.impeccable/critique/`) encontró cuatro problemas P1:
1. **La espera no dice nada y puede terminar en un fallo falso.** La revisión de IA se hace dentro del mismo `POST /api/curriculums/`: hasta 30 s por proveedor, más si hay cadena de respaldo, más el arranque en frío de Render. El cliente corta a los 45 s, el estudiante ve "No se pudo analizar" y, sin embargo, el análisis queda guardado.
2. **"Tu PDF es una imagen" aparece también con DOCX.** Un DOCX hecho de cuadros de texto o imágenes también llega sin capa de texto, y el detalle del backend ("se escaneó… exporta desde Word") no le aplica.
3. **"Qué mejorar" tiene dos cifras distintas.** La pestaña suma hallazgos, viñetas y redacción; el botón del Resumen cuenta solo hallazgos. Además, `text-headline-lg` no existe y la guarda de estilos no lo detecta.
4. **En móvil, las pestañas esconden el siguiente paso.** "Para la entrevista", el único camino hacia la práctica, queda fuera de pantalla. Las columnas fijas de etiqueta aprietan las sugerencias a unos 150 px.

El usuario eligió atacar la espera de raíz: primero el diagnóstico y después la IA.

## What Changes

- **Diagnóstico primero:**
  - `POST /api/curriculums/` devuelve la medición sin llamar a la IA. `revision_ia` vale `null`, que significa "aún no pedida".
  - **Nuevo `POST /api/curriculums/<id>/revision/`** pide las sugerencias de un análisis ya guardado. Reconstruye el documento desde el texto guardado (el archivo nunca se guardó), así que no hay que volver a subir nada.
  - **Caché:** si ya hay una revisión vigente, la devuelve sin llamar a la IA. Reintenta solo si nunca se pidió o si el proveedor falló.
  - Tiene su propio límite de peticiones.
- **En el frontend:**
  - el espejo y las correcciones aparecen al instante;
  - las partes que dependen de la IA muestran "Pidiendo sugerencias a la IA…" (anunciado a lectores de pantalla) y se completan solas;
  - la petición de IA tiene su propio tiempo límite, más largo;
  - si la IA falla o tarda demasiado, el aviso ofrece **"Reintentar sugerencias"**, sin volver a subir el CV.
- **CV ilegible según el formato:**
  - el título es "Tu PDF es una imagen" para un PDF y "Tu documento no tiene texto que el ATS pueda leer" para un DOCX;
  - el backend da un detalle propio para DOCX, que menciona los cuadros de texto si el texto vive ahí;
  - el espejo rojo repetido bajo el panel se reemplaza por una línea con la cifra;
  - `VERSION_DE_REGLAS` sube a 3, porque cambia lo que produce `analizar()`.
- **Un solo conteo:** la pestaña se llama "Mejorar · n" (correcciones del ATS + viñetas sin resultado + redacción) y el botón del Resumen deja de mostrar un número propio.
- **Tipografía:**
  - `text-headline-lg` se reemplaza por un token existente;
  - la guarda `estilos.test.ts` falla si se usa una clase de una familia de texto del sistema (`headline`, `body`, `label`…) que no esté definida en `tokens.css`.
- **Móvil:**
  - rótulos cortos: Resumen · Mejorar · Requisitos/Tecnologías · Entrevista;
  - menos separación entre pestañas por debajo de 640 px;
  - "Practicar la entrevista" también al final del Resumen;
  - etiqueta y valor apilados por debajo de 640 px en el espejo completo y en las filas del mapa de requisitos.
- **Fuera de alcance (P2):** el error general lejos de su causa y la alerta roja usada para algo que no es un error.

## Capabilities

### New Capabilities
- `cv-critica-2`: el diagnóstico antes que la IA, el CV ilegible según su formato, un único conteo y los ajustes de móvil en "Revisar mi CV".

### Modified Capabilities
- Ninguna archivada. Ajusta lo que fijaron los cambios sin archivar `cv-en-pasos-y-pestanas` y `cv-critica-p1` (rótulos de pestañas y panel del CV ilegible); se archiva después de ambos.

## Impact

- **Backend:**
  - `apps/curriculums/{services.py, views.py, urls.py}`;
  - `config/settings/base.py`, con la tasa `revisar-cv`;
  - `integrations/documentos/ats.py`, con el detalle para DOCX y `VERSION_DE_REGLAS = 3`;
  - tests en `apps/curriculums/tests/` y `tests/integration/test_ats.py`.
- **Frontera con la IA:** `revision.py` sigue siendo el único módulo que importa `integrations.ia`. `test_frontera_con_ia.py` debe seguir en verde y cubrir el nuevo camino.
- **Frontend:**
  - `api/curriculums.ts` (`pedirRevision`, `timeoutMs`);
  - `features/curriculum/` (página, resultado, resumen, aviso, espejo, requisitos);
  - `components/ui/Pestanas.tsx`;
  - `src/estilos.test.ts`.
- **API:** `POST /api/curriculums/` ya no trae las sugerencias en la misma respuesta (`revision_ia: null`). Es compatible: el frontend era su único cliente y `null` ya era un valor posible para análisis antiguos.
- **Documentación:** `CLAUDE.md`, en el módulo CV: el paso de IA en dos peticiones y la regla de la guarda.
