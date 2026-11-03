## Why

En «Revisar mi CV», lo que hace la pantalla se dice tres veces antes de llegar a las tarjetas:
- el encabezado fijo, «Simulador técnico / Revisar mi CV» con su subtítulo;
- el título grande «Revisa tu CV contra los filtros ATS»;
- un párrafo de tres líneas sobre qué es un ATS.

Esto ocupa unos 120 px justo encima de lo que el usuario vino a hacer. Jorge pidió recuperar ese espacio y aprobó quitar el título visible y el párrafo, solo en esta pantalla.

## What Changes

- **El título grande deja de verse,** pero se mantiene como título principal solo para lectores de pantalla. Pasa a decir «Revisar mi CV», lo mismo que el encabezado, para que la página no se quede sin su título principal.
- **El párrafo de introducción se elimina.** (Nota: el desplegable «¿Qué es un ATS?» descrito aquí se retiró después, por decisión del usuario, en `tipo-de-analisis-en-combo`.) Su idea clave pasa a un desplegable cerrado, «¿Qué es un ATS?», dentro de la tarjeta «Tipo de análisis»:
  - es el sistema con el que las empresas filtran postulaciones;
  - no rechaza con una nota: convierte el CV en campos;
  - si algo no se lee, no apareces.
- **El encabezado fijo no cambia:** está en todas las pantallas, contiene el botón ☰ en el celular y siempre mide 64 px.
- **Código que se elimina:** el cálculo `enResultado`, que solo servía para mostrar u ocultar el párrafo según la vista.
- **Fuera de alcance:** las demás pantallas (Historial, Retroalimentación, Perfil, Nueva entrevista, Resultados) mantienen su título y su párrafo. Si este resultado convence, se aplicará en un cambio aparte.

## Capabilities

### New Capabilities
- `revision-de-cv`: la cabecera de la pantalla sin título visible repetido y la explicación del ATS dentro de la elección del tipo. La capacidad aún no tiene spec principal, así que esta delta es ADDED, igual que en los cambios anteriores.

### Modified Capabilities

## Impact

- **Frontend:**
  - `features/curriculum/pages/CurriculumPage.tsx`: el título queda solo para lectores de pantalla y se quitan el párrafo y `enResultado`;
  - `features/curriculum/components/EleccionDeTipo.tsx`: el desplegable «¿Qué es un ATS?».
- **Specs:** la delta de `intro-solo-en-la-entrada-del-cv`, todavía sin archivar, exige el párrafo y el título visibles. Hay que reescribirla para que no contradiga este cambio.
- **Documentación:** `CLAUDE.md`, sección del CV.
- **Sin cambios** en el backend, el API ni las reglas.
