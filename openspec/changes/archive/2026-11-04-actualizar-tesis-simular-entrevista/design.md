## Context

- **El perfil** es un `.md`, así que se puede editar texto a texto.
- **Los dos `.docx` del marco teórico** son ZIP con `word/document.xml`. En los dos, la viñeta «Evaluar cada respuesta con la rúbrica analítica…» es un `w:p` con su `w:pPr` (lista y estilo) y uno o más `w:r`/`w:t`.
- **Word está abierto:** existen `~$pitulo-2-marco-teorico.docx` y `~$pitulo-2-marco-teorico-entrega.docx`.
- **Sin git:** la tesis no está en el repositorio, así que no hay forma de deshacer los cambios desde ahí.

## Goals / Non-Goals

**Goals:** los cambios aprobados, sin perder el formato de Word y con un respaldo.

**Non-Goals:**
- reescribir otros párrafos;
- cambiar «resultados, historial y retroalimentación»;
- tocar el marcador `[REVISAR MANUALMENTE 10]`;
- regenerar los índices de Word (eso lo hace Jorge con «Actualizar campo»).

## Decisions

- **Respaldo primero.** Se copian los tres archivos al scratchpad de la sesión antes de cualquier edición.
- **Perfil:** un script con `cambiar(ruta, viejo, nuevo, veces)` que exige el número exacto de coincidencias:
  - «Formulario de Nueva Entrevista» → «Formulario «Simular entrevista»», 10 veces;
  - «Abre una nueva entrevista con el mismo puesto» → «Abre «Simular entrevista» con el mismo puesto», 1 vez.

  Así queda cualquier prefijo de formato (`*`, `**`, `#####`, `######`, `\.`).
- **`.docx`: se clona el párrafo, no se escribe XML a mano.**
  1. Se ubica el único `w:p` cuyo texto empieza con «Evaluar cada respuesta con la rúbrica analítica».
  2. Se copia completo, con `w:pPr` y el `w:rPr` del primer run.
  3. En la copia van dos `w:r`, como en las otras viñetas de la lista: la frase inicial en negrita (`w:b`) y el resto en texto normal (`xml:space="preserve"`). Al aplicar, se vio que las viñetas de la lista empiezan con verbo + objeto en negrita. Por eso Jorge aprobó reordenar el texto para que siga ese formato. El párrafo original no tiene marcadores, comentarios ni `w14:paraId`, así que la copia no duplica ids.
  4. La copia se inserta justo después del original.

  Se reescribe solo `word/document.xml` y los demás miembros del ZIP se copian byte a byte. Se usa solo la biblioteca estándar (`zipfile`, `re`), sin dependencias.
- **Texto de la viñeta:** «**Redactar un veredicto breve** del reporte al terminar la entrevista, a partir de las evaluaciones ya guardadas, sin recibir las respuestas y sin modificar la nota.» Coincide con el sistema: el redactor recibe área, nota, niveles, fortalezas y debilidades, nunca las respuestas, y su parser descarta cualquier nota.

## Risks / Trade-offs

- **[Word abierto sobrescribe el archivo al guardar]** → El apply se detiene si siguen los `~$` y le pide a Jorge cerrar Word.
- **[El párrafo clonado arrastra un id único]** → Se quitan los marcadores y comentarios de la copia. Al abrirlo, Word renumera los `w14:paraId` duplicados. Si no, se borra ese atributo de la copia.
- **[Los índices del perfil y del Word]** → El `.md` se edita a mano en sus dos sitios. En Word, Jorge actualiza el campo.

## Migration Plan

Para revertir, se restauran las copias del scratchpad.
