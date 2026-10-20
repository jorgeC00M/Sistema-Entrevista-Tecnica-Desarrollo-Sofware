## Why

La crítica de Impeccable de "Revisar mi CV" (25/40, archivada en `.impeccable/critique/`) encontró tres problemas P1:
1. **Un PDF escaneado recibe mensajes con la causa equivocada.** Las pestañas Tecnologías y Requisitos dicen que las habilidades "quizá están en barras" o que "no se reconoció ningún requisito en la convocatoria que enviaste". Culpan al documento equivocado justo cuando el estudiante más necesita claridad.
2. **El momento propio del producto está escondido.** El resultado abre con una lista de fallos en rojo, el espejo del ATS queda en la segunda pestaña y "Qué conservar" vive dentro de "Qué corregir".
3. **Nada tranquiliza al entregar un CV real.** El backend no guarda el archivo y tapa los datos personales antes de la IA, pero la pantalla no lo dice. Tampoco se ve el límite de 2 MB.

Además, el usuario eligió cambiar el tono de las severidades: "Crítico / Importante / Menor" es un veredicto sobre el CV. Nombrar el **efecto** sobre el ATS es más honesto y coherente con un módulo que se niega a dar un puntaje.

## What Changes

- **CV sin capa de texto:**
  - el resultado se reduce a **un solo panel**: el espejo, un aviso con la causa y el arreglo ("Tu PDF es una imagen: expórtalo desde Word o Google Docs") y "Analizar de nuevo";
  - sin pestañas;
  - sin mensajes sobre barras ni sobre la convocatoria.
- **El Resumen pasa a girar en torno al espejo:**
  - el espejo compacto (qué lee el ATS de tu CV);
  - las 3 correcciones más importantes, al lado en escritorio y debajo en móvil;
  - una línea "Qué ya funciona" con las fortalezas.
- **Pestañas: de 5 a 4.**
  - "Qué conservar" sale de "Qué corregir" y pasa al Resumen.
  - "Viñetas" se une con "Qué corregir", que pasa a llamarse **"Qué mejorar"** porque ahora junta los hallazgos del ATS y la redacción.
  - Quedan **Resumen · Qué mejorar · Requisitos/Tecnologías · Para la entrevista**.
- **Privacidad visible:** bajo la zona del CV, "No guardamos el archivo, solo el texto. A la IA llegan solo secciones, con tu nombre, correo y teléfono tapados." La etiqueta pasa a "PDF o DOCX · máx. 2 MB".
- **Severidades por su efecto:**
  - **Crítico** pasa a "Impide la lectura";
  - **Importante** pasa a "Resta visibilidad";
  - **Menor** pasa a "Detalle".

  Los colores de estado no cambian, y las etiquetas salen de un solo sitio.
- **Fuera de alcance (P2, otra pasada):** el estado de espera con `aria-live`, el tiempo límite mayor y `text-headline-lg`.

## Capabilities

### New Capabilities
- `cv-critica-p1`: el CV ilegible con un solo panel, el Resumen alrededor del espejo, la privacidad visible y las severidades por efecto.

### Modified Capabilities
- Ninguna archivada. Ajusta la tabla de pestañas del cambio no archivado `cv-en-pasos-y-pestanas` (de 5 a 4, y Resumen con el espejo); se archiva después de él.

## Impact

- **Frontend (`features/curriculum/`):**
  - `hallazgos.ts` (+ test): la detección de CV ilegible y las etiquetas de severidad;
  - `ResumenDelAnalisis.tsx`, `ResultadoDelAnalisis.tsx`, `EntradaDelAnalisis.tsx`;
  - `ListaDeHallazgos.tsx` y `EspejoDelATS.tsx`, que gana una variante compacta.
- **Documentación:** `CLAUDE.md`, en la sección de la pantalla del CV.
- **Sin cambios:** backend y API. El hallazgo `sin_capa_de_texto` ya existe y es lo que se detecta.
