## Why

En la entrada de «Revisar mi CV», «Tu CV» y el panel lateral («Qué revisamos» en general, «Convocatoria» en dirigido) se reparten la fila a medias. Pero «Tu CV» es la acción principal y el panel lateral es contexto, así que dos mitades iguales les dan el mismo peso. Además, «Qué revisamos» es una lista plana, donde los tres puntos y su detalle se leen con el mismo tamaño.

Jorge pidió una fila asimétrica (2fr / 1fr), con la misma altura, 24 px de separación y jerarquía tipográfica. Aprobó el boceto con dos decisiones:
- la misma rejilla en las dos pestañas;
- tres niveles de texto en el panel.

## What Changes

- **Fila 2/3 – 1/3.** Desde 1024 px, «Tu CV» ocupa unos 2/3 y el panel lateral 1/3 (`2fr 1fr`), en las dos pestañas, así que el CV no cambia de ancho al pasar de una a otra.
  - Las dos tarjetas tienen la misma altura.
  - La separación pasa de 20 a 24 px.
  - En pantallas menores se apilan como hoy.
- **«¿Qué revisamos?» con jerarquía.** El título lleva signos de pregunta y el mismo estilo que «Tu CV». Debajo van tres bloques, cada uno con un subtítulo en negrita y su detalle en texto secundario:
  - «Tus datos»: los 8 campos;
  - «El formato»: columnas, tablas, imágenes, encabezados y pies;
  - «Tus viñetas»: si muestran logros o solo tareas.

## Capabilities

### New Capabilities
- `revision-de-cv`: la proporción de la fila de la entrada y la jerarquía de «¿Qué revisamos?». Aún no tiene spec principal, así que la delta es ADDED, como en los cambios anteriores.

### Modified Capabilities

## Impact

- **Frontend:** `features/curriculum/components/EntradaDelAnalisis.tsx`.
- **Specs sin archivar que dicen «mitad»:** se ajustan `tipo-de-analisis-en-combo`, `tipo-de-analisis-en-pestanas` y `entrada-del-cv-que-revisamos`.
- **Documentación:** `CLAUDE.md`.
- **Sin cambios** en el backend, el API, la lógica (`puedeAnalizar`, `CAMPOS_QUE_BUSCA_EL_ATS`) ni el historial.
