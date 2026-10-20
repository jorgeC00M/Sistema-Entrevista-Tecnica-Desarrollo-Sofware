## Why

La pestaña "Con convocatoria" mezcla demasiado:
- un conmutador Pegar texto / Subir archivo;
- el análisis;
- debajo, los mismos desplegables de Puesto, Nivel y Tecnología que la pestaña "Personalizada".

El usuario no sabe si tiene que analizar, elegir o las dos cosas. Además, "Iniciar entrevista" arranca la entrevista sin decir antes qué va a pasar. El usuario quiere un camino directo y fácil de seguir —pegar o subir, analizar, ver qué se detectó, iniciar— y una pausa informativa antes de empezar.

## What Changes

- **Pestaña "Con convocatoria" en una columna de 3 pasos** (diseño aprobado por el usuario):
  1. el área "Texto de la convocatoria", con sus ejemplos; debajo, separada por un "o", la subida de archivo PDF/DOCX;
  2. "Analizar convocatoria" a la derecha;
  3. tras analizar, debajo, el resumen detectado (puesto, tecnología, nivel, requisitos y lo que no se evalúa) y "Iniciar entrevista".
- **Texto y archivo visibles a la vez, uno bloquea al otro** (aprobado): con texto, la subida queda deshabilitada; con archivo, el área de texto también. Cada uno dice cómo cambiar.
- **BREAKING (interfaz):** en esa pestaña se eliminan el conmutador Pegar/Subir, los desplegables de puesto, nivel y tecnología, y "Volver a aplicar este perfil". Los campos solo existen en "Personalizada".
- **Análisis incompleto** (sin tecnología, o Full Stack sin backend): el resumen marca el dato faltante y ofrece "Completar en Personalizada" (aprobado). Ese botón pasa a la otra pestaña con lo detectado cargado y **conserva la convocatoria**. Cambiar de pestaña a mano la sigue descartando, como hasta ahora.
- **"Iniciar entrevista" abre un modal de información en ambas pestañas** (aprobado: "Resumen + qué esperar"):
  - muestra el puesto, la tecnología y el nivel, la etiqueta "Basada en tu convocatoria" si corresponde, y tres puntos: la cantidad de preguntas, que la nota se ve al terminar y que se puede abandonar;
  - botones Cancelar / Comenzar;
  - el error de inicio se muestra dentro del modal.
- El botón "Iniciar entrevista" pierde su icono en las dos pestañas.

## Capabilities

### New Capabilities
- `convocatoria-en-tres-pasos`: el flujo de la pestaña "Con convocatoria" (entrada, análisis, resumen e inicio) y la confirmación informativa antes de iniciar cualquier entrevista.

### Modified Capabilities
Ninguna en `openspec/specs/` (está vacío). Reemplaza la interfaz de la convocatoria de `formulario-de-entrevista` y `pestanas-y-resumen-en-panel`, que siguen sin archivar: allí la convocatoria se analizaba junto a los desplegables y el inicio era inmediato.

## Impact

- **Frontend:**
  - en `features/seleccion/components/`, nuevos `ResumenDeConvocatoria.tsx` y `ModalDeInicio.tsx`; `PanelDeConvocatoria.tsx` se reescribe y `ResumenDeEntrevista.tsx` se ajusta (sin icono ni error);
  - `features/seleccion/pages/SeleccionPuestoPage.tsx` cambia: contenido por pestaña, modal y "Completar en Personalizada".
- **Se reutilizan:** `Modal` / `ModalDeConfirmacion`, `Textarea`, `Chip`, `Boton`, `ZonaDeArchivo` y `seleccion.ts`.
- **Backend:** sin cambios.
- **Docs:** `CLAUDE.md`.
