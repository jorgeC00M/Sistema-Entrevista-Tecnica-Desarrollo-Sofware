## Why

En la pestaña "Con convocatoria" el área de texto y la zona de archivo aparecen una debajo de otra, junto con los ejemplos "Probar con un ejemplo: Backend Python · Full Stack · QA". Visualmente parece un solo formulario largo: no se nota que son **dos formas alternativas** de dar el aviso. Los ejemplos además distraen: son contenido de demostración, no algo que el usuario final necesite.

## What Changes

- Se eliminan los ejemplos ("Probar con un ejemplo" y sus tres `Chip`).
- Arriba del panel, bajo el rótulo "Elige una forma de darnos la convocatoria", aparecen **dos tarjetas lado a lado**:
  - "Pegar texto", con la ayuda "Copia el aviso de la web";
  - "Subir archivo", con la ayuda "PDF o DOCX".

  Cada una lleva su icono. Funcionan como un grupo de opciones con una sola elegida; "Pegar texto" viene elegida al entrar. En móvil se apilan.
- Debajo se muestra **solo** el campo de la tarjeta elegida: el área de texto o la zona de archivo. Después vienen "Analizar convocatoria" a la derecha y el resumen de lo detectado, que no cambian.
- **Se reemplaza el bloqueo mutuo** del cambio `convocatoria-en-tres-pasos`, que usaba las ayudas "Borra el texto…" y "Quita el archivo…", y se quita el separador "o": como ya solo hay un campo a la vista, no hace falta bloquear el otro. Al cambiar de tarjeta se conserva lo escrito o el archivo elegido, pero se analiza solo lo de la tarjeta elegida.
- No cambian el backend, el análisis, el resumen, el modal de inicio ni la pestaña "Personalizada".

## Capabilities

### New Capabilities
- `convocatoria-dos-tarjetas`: cómo elige el usuario entre pegar el texto o subir el archivo de la convocatoria.

### Modified Capabilities
- Ninguna capacidad archivada. Este cambio **sustituye** dos requisitos del cambio aún no archivado `convocatoria-en-tres-pasos`: "Entrada de la convocatoria en una columna" (ejemplos y separador "o") y "Texto y archivo se excluyen". Ambos cambios deben archivarse juntos, este después.

## Impact

- **Frontend:** `features/seleccion/components/PanelDeConvocatoria.tsx`, y una nueva `EleccionDeVia.tsx` para las dos tarjetas.
- **Documentación:** `CLAUDE.md`, en el párrafo de la pestaña "Con convocatoria".
- **Sin cambios:** backend, API y otras pantallas. `Chip` sigue en uso en el resumen y en otras pantallas.
