## Why

En la entrada de «Revisar mi CV», Jorge ve tres cosas que cambiar:
- la nota de privacidad bajo «Tu CV», que no considera necesaria;
- la línea «Sube tu CV.» / «Pega o sube la convocatoria.» junto al botón, que repite lo que la zona vacía ya muestra;
- en «Análisis general», la mitad derecha de la fila, que queda vacía.

Ese espacio puede decir qué se va a medir antes de que el estudiante suba su CV. Jorge aprobó el boceto con dos decisiones: el panel va solo en general, y se quita la línea de avisos completa.

## What Changes

- **Sin nota de privacidad.** Se quita «No guardamos tu archivo ni enviamos tus datos de contacto a la IA.». Revierte, por decisión del usuario, `entrada-del-cv-sin-textos-de-relleno`. La garantía sigue siendo cierta en el sistema; solo deja de decirse en pantalla.
- **Sin línea de lo que falta.** Desaparecen «Sube tu CV.» y «Pega o sube la convocatoria.». «Analizar CV» sigue apagado hasta que el análisis tiene lo necesario. Mientras se analiza, «Leyendo tu CV y aplicando las reglas del ATS…» se sigue anunciando a los lectores de pantalla.
- **Panel «Qué revisamos»**, a la derecha de «Tu CV» y solo en «Análisis general». Dice tres cosas, todas medidas por el sistema:
  - si el ATS extrae tus 8 datos (Nombre, Correo, Teléfono, Ubicación, Experiencia, Educación, Habilidades y Antigüedad);
  - si el formato le impide leer (columnas, tablas, imágenes, encabezados y pies);
  - si tus viñetas muestran logros o solo tareas.
- **Código muerto:** `faltaParaAnalizar` devolvía textos que ya no se muestran. Pasa a ser `puedeAnalizar`, que devuelve un booleano con la misma regla.

## Capabilities

### New Capabilities
- `revision-de-cv`: la entrada sin nota de privacidad ni avisos, y el panel «Qué revisamos». Aún no tiene spec principal, así que la delta es ADDED, como en los cambios anteriores.

### Modified Capabilities

## Impact

- **Frontend:** `features/curriculum/hallazgos.ts` y su test, y `features/curriculum/components/EntradaDelAnalisis.tsx`.
- **Specs sin archivar** que se ajustan para no contradecir este cambio: `entrada-del-cv-sin-textos-de-relleno`, `cv-critica-p1`, `tipo-de-analisis-e-historial-en-tabla`, `tipo-de-analisis-en-combo` y `tipo-de-analisis-en-pestanas`.
- **Documentación:** `CLAUDE.md`.
- **Sin cambios** en el backend ni en el API.
