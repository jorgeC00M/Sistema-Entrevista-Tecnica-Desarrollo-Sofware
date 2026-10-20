## Why

En el formulario de entrevista, Puesto y Nivel ocupan cada uno una fila completa, con Tecnología entre ambos. Son las dos elecciones que siempre se hacen y que no dependen de nada más. El usuario quiere verlas juntas, en la misma fila, para que el formulario sea más compacto y se lea de un vistazo.

## What Changes

- En pantallas de `sm` (640 px) en adelante, **Nivel** se coloca a la derecha de **Puesto**, en la misma fila y alineado arriba. Debajo, en su propia fila, va **Tecnología**: un campo a todo el ancho, o dos lado a lado en un puesto con capas (Full Stack).
- En el móvil, los campos se apilan en el orden Puesto, Nivel, Tecnología.
- El orden de los campos pasa a ser Puesto → Nivel → Tecnología. Con él cambian dos cosas:
  - el campo que falta, que la barra anuncia ("Elige el nivel" antes que "Elige la tecnología");
  - adónde va el foco tras "Repetir última" o la convocatoria: al primer campo vacío en ese orden.

  Así la pantalla, el anuncio y el foco recorren los campos en el mismo orden.
- Sin cambios de comportamiento en los valores, las reglas ni la API.

## Capabilities

### New Capabilities
- `nivel-junto-al-puesto`: disposición del formulario de entrevista con Puesto y Nivel en la misma fila, y el orden de los campos que de ella se sigue.

### Modified Capabilities
Ninguna en `openspec/specs/` (está vacío). Ajusta la disposición de `formulario-de-entrevista`, que sigue sin archivar.

## Impact

- **Frontend:**
  - `features/seleccion/components/FormularioDeEntrevista.tsx`: el orden y las columnas de los campos;
  - `features/seleccion/seleccion.ts`: el orden en `campoFaltante`;
  - `seleccion.test.ts`.
- **Backend:** sin cambios.
- **Docs:** el párrafo del formulario en `CLAUDE.md`.
