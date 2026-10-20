## 1. Lógica pura

- [x] 1.1 Crear `features/curriculum/hallazgos.ts` con `debilidadesPorGravedad()` (D3), y `hallazgos.test.ts` con el orden, la estabilidad, que no muta la entrada y la lista vacía. Se verifica con `pnpm test` en verde.

## 2. Componentes

- [x] 2.1 En `CampoConvocatoria.tsx`, quitar la `Tarjeta` y el título "La convocatoria / Opcional" (D2), conservando la explicación, la vía, el textarea, el archivo y el error.
- [x] 2.2 Crear `EntradaDelAnalisis.tsx` (D1, D2):
  - el CV primero;
  - el disclosure con `aria-expanded`, que al cerrar vacía la convocatoria y se abre solo si ya hay convocatoria;
  - "Analizar mi CV" a la derecha;
  - los errores por campo.

  Eliminar `SubirArchivo.tsx`.
- [x] 2.3 Crear `ResumenDelAnalisis.tsx`:
  - las cifras (parseabilidad, cobertura si hay brecha, viñetas si hay);
  - `AvisoDeRevision`;
  - las 3 debilidades más graves con `debilidadesPorGravedad`;
  - "Ver todo en Qué corregir";
  - el estado sin debilidades.
- [x] 2.4 Crear `ResultadoDelAnalisis.tsx` (D4, D5):
  - la barra de contexto con "Analizar otro";
  - `Pestanas` condicionales;
  - el contenido de cada pestaña con los componentes existentes;
  - el foco al encabezado.

## 3. Página y limpieza

- [x] 3.1 Reescribir `CurriculumPage.tsx` como orquestación (D1):
  - la entrada + el historial, o el resultado con `key` para reiniciar la pestaña;
  - "Analizar otro" conserva los archivos y enfoca la zona del CV;
  - quitar la rejilla de dos columnas.

  Eliminar `ResumenDeSeveridad` si queda sin uso (D6).
- [x] 3.2 Verificar que `grep -rnE "SubirArchivo|ResumenDeSeveridad" frontend/src` no da resultados, o solo usos vigentes. Ejecutar `pnpm exec tsc --noEmit`, `pnpm test` (incluida la guarda de estilos), `pnpm run lint` (sin avisos nuevos) y `pnpm run build`, todos en verde.
- [x] 3.3 Actualizar `CLAUDE.md`, en el módulo CV: la entrada con el CV primero y la convocatoria plegada, el resultado en pestañas (y cuándo aparece cada una) y "Analizar otro".
- [ ] 3.4 Prueba manual que cubra:
  - el análisis sin y con convocatoria (texto y archivo);
  - plegar la convocatoria la vacía;
  - las pestañas con teclado;
  - "Ver todo en Qué corregir";
  - "Analizar otro" conserva el archivo;
  - abrir desde el historial;
  - un PDF escaneado;
  - 375 px.

  Si no se puede ejecutar, queda **sin marcar**.
