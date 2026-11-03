## Why

Después de `correcciones-accionables-y-menos-pestanas`, el usuario revisó el resultado de «Revisar mi CV» con dos preguntas: qué más le sirve al usuario final y de qué otra forma armar el Resumen. Encontró dos problemas:

1. **El Resumen es una fila de tarjetas.** Para llegar a lo que hay que hacer, se pasa por el aviso, el veredicto y la ficha. Las fortalezas («Qué ya funciona») quedan al final, como un premio de consolación, sin decir para qué sirven.
2. **En «Mejorar», la explicación no basta.** Una corrección como «Usa un solo formato de fecha» no se entiende si nunca viste uno. Le falta un ejemplo de cómo debe quedar.

El usuario eligió cada solución entre opciones en texto plano. Esto reabre la pantalla cerrada por `cv-cierre-final`, con su aprobación.

## What Changes

**El Resumen en dos columnas:**
- **Izquierda, «lo que ve el ATS»:**
  - con convocatoria: Frente a este aviso → Veredicto → Ficha del ATS;
  - sin convocatoria: Veredicto → Ficha → Tecnologías por las que te encontrarían.
- **Derecha, «lo que haces tú», que queda fija al bajar:**
  - «Lo que debes hacer», que antes se llamaba «Lo primero que mejorar»: las 3 correcciones más graves y «y n correcciones más» cuando hay más;
  - debajo, «Consérvalo al corregir», con las fortalezas. Reemplaza a «Qué ya funciona».
- **En el celular,** una sola columna y la parte derecha justo después del veredicto.
- **Al final, a todo el ancho:** la práctica de la entrevista, como hoy.

**El ejemplo «Así:» en «Mejorar»:**
- Cada debilidad que lo necesita gana un **ejemplo** fijo, escrito por su regla y sin IA, de cómo debe quedar. Por ejemplo, «Junio 2022 – Marzo 2023 · Abril 2023 – Actual».
- **El ejemplo pasa sus propias reglas:** un test comprueba que el módulo no lo marcaría como error.
- **`VERSION_DE_REGLAS` sube de 6 a 7.** Los análisis guardados antes se sirven con `ejemplo: ""` y no muestran la línea «Así:» hasta que se vuelve a subir el CV.

**Lo que no cambia:** no se agrega al Resumen una lista completa de debilidades. Ya aparecen en la ficha, en el veredicto, en el top 3 y en Mejorar.

**Descartado por el usuario:**
- Resumen en «tres preguntas» o como «recorrido del CV».
- Agrupar las correcciones por dónde se arreglan.
- Casilla «Ya lo corregí».
- Citar el fragmento del CV que causó cada corrección.

## Capabilities

### New Capabilities
- `revision-de-cv`: el Resumen en dos columnas («lo que ve el ATS» / «lo que haces tú»), las fortalezas como «Consérvalo al corregir» y el ejemplo «Así:» de cada corrección. Como en los cambios anteriores, la capacidad no tiene spec principal y se agrega con ADDED.

### Modified Capabilities
<!-- Ninguna en openspec/specs/. -->

## Impact

- **Backend:**
  - `integrations/documentos/ats.py`: `Hallazgo.ejemplo`, un ejemplo por regla y `VERSION_DE_REGLAS = 7`;
  - `apps/curriculums/serializers.py`: `ejemplo` con default `""`;
  - tests en `tests/integration/test_ats.py` y `apps/curriculums/tests/test_curriculums.py`.
  - No hay migración: los hallazgos se guardan como JSON.
- **Frontend:**
  - `types/curriculum.ts`;
  - `ListaDeHallazgos.tsx`, que muestra «Así:»;
  - `ResumenDelAnalisis.tsx`, que pasa a la grilla de dos columnas;
  - componentes nuevos `LoQueDebesHacer.tsx` y `ConservaloAlCorregir.tsx`, sacados del Resumen.
- **API:** `Hallazgo` gana el campo `ejemplo`. Es un agregado y no rompe nada.
- **Docs:**
  - `CLAUDE.md`, sección del CV;
  - la delta de `correcciones-accionables-y-menos-pestanas`, todavía sin archivar: «Lo primero que mejorar» pasa a «Lo que debes hacer».
