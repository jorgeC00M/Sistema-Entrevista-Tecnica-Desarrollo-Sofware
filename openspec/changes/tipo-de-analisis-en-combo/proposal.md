## Why

En «Revisar mi CV», el «Tipo de análisis» son hoy dos tarjetas-radio apiladas en la columna derecha, y el CV y la convocatoria van uno debajo del otro a la izquierda. Ocupa mucho alto, y la convocatoria aparece lejos del lugar donde se eligió el tipo. Jorge pidió:

- un combo de una sola fila arriba;
- debajo, el CV;
- en el análisis dirigido, la convocatoria a la derecha del CV, en la misma fila y del mismo tamaño;
- debajo, el mismo botón «Analizar CV».

Aprobó el boceto con tres decisiones:
- el CV ocupa siempre media fila;
- «Análisis general» viene elegido al entrar;
- bajo el combo, nada más: sin ayuda ni «¿Qué es un ATS?» (los retiró tras verlos).

## What Changes

- **Combo de tipo.** «Tipo de análisis» pasa a ser un `<select>` nativo de fila completa (`CampoSelect`). Cada opción muestra su nombre y su pregunta («Análisis general · ¿El ATS lee mi CV?»). Debajo no va nada: se retiran la ayuda y el desplegable «¿Qué es un ATS?».
- **Nuevo valor de entrada:** «Análisis general» viene elegido al entrar. **BREAKING** respecto de `tipo-de-analisis-e-historial-en-tabla`, que pedía entrar sin ninguna opción marcada; se revierte por decisión del usuario. Por eso desaparece el mensaje «Elige un tipo de análisis».
- **Nueva disposición desde 1024 px:**
  - el CV va a la izquierda y ocupa media fila;
  - con «Análisis dirigido», la convocatoria aparece a su derecha, en la misma fila y con la misma altura;
  - el CV no se mueve al cambiar de tipo.
- **El orden es el mismo en todos los anchos:** tipo → CV → convocatoria → botón. Es también el orden del DOM; la grilla ya no reubica nada.
- **No cambia:**
  - «Analizar CV» sigue apagado hasta que el análisis está listo, con la línea de lo que falta;
  - la convocatoria se conserva al volver a «general», pero no se envía;
  - el historial queda igual.
- **Código muerto:** `components/ui/estilosDeOpcion.ts` se queda con un solo consumidor (`EleccionDeVia`), así que sus clases vuelven a ese componente y el archivo se borra.

## Capabilities

### New Capabilities
- `revision-de-cv`: la forma de elegir el tipo de análisis y la disposición de la entrada. Aún no tiene spec principal, así que la delta es ADDED, como en los cambios anteriores.

### Modified Capabilities

## Impact

- **Frontend:**
  - `features/curriculum/components/{EleccionDeTipo,EntradaDelAnalisis}.tsx`, `pages/CurriculumPage.tsx` y `hallazgos.ts`, con su test;
  - `features/seleccion/components/EleccionDeVia.tsx`;
  - `components/ui/estilosDeOpcion.ts`, que se borra.
- **Specs:** la delta de `tipo-de-analisis-e-historial-en-tabla`, sin archivar, se ajusta para no contradecir este cambio: «ninguna marcada», «Elige un tipo» y el orden de las columnas.
- **Documentación:** `CLAUDE.md`.
- **Sin cambios** en el backend, el API ni el historial.
