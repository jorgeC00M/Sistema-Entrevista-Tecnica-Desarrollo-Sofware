## Why

En el formulario de nueva entrevista, los modos "Elegir yo" y "Desde una convocatoria" se ven como un interruptor de pastilla y sus nombres no dicen con claridad qué hace cada uno. Además, el resumen de lo elegido y el botón para empezar viven en una barra fija aparte, lejos de los campos que resumen, con un botón grande que domina la pantalla. El usuario quiere pestañas con nombres claros y el resumen y la acción dentro del mismo panel.

## What Changes

- Los modos pasan a ser **pestañas** (patrón ARIA *tabs*, con flechas del teclado) con los nombres aprobados por el usuario: **"Personalizada"** y **"Con convocatoria"**.
- **BREAKING (interfaz):** se elimina la barra fija inferior. El resumen ("Puesto · Tecnología · Nivel · 5 preguntas", "Cubre: …" y la etiqueta "Desde convocatoria") pasa **dentro del panel, debajo de Tecnología**.
- El botón "Comenzar entrevista" pasa a llamarse **"Iniciar entrevista"** (nombre aprobado por el usuario). Es más pequeño y se ubica **abajo a la derecha del panel**, sin ocupar todo el ancho.
- El error al iniciar se muestra dentro del panel, junto al botón.
- No cambian:
  - los campos, sus reglas y la convocatoria (pasar a "Personalizada" deja de usarla y conserva los campos);
  - "Repetir última", la preselección por URL y el foco al primer campo vacío o al botón;
  - la API.

## Capabilities

### New Capabilities
- `pestanas-y-resumen-en-panel`: modos del formulario como pestañas, y el resumen con la acción de iniciar dentro del panel.

### Modified Capabilities
Ninguna en `openspec/specs/` (está vacío). Ajusta la interfaz de `formulario-de-entrevista` y `nivel-junto-al-puesto`, que siguen sin archivar. Reemplaza en ellos la barra fija y los nombres "Elegir yo" / "Desde una convocatoria".

## Impact

- **Frontend:**
  - nuevo `components/ui/Pestanas.tsx`;
  - nuevo `features/seleccion/components/ResumenDeEntrevista.tsx`, que reemplaza a `BarraDeResumen.tsx`, el cual se elimina;
  - cambios en `features/seleccion/pages/SeleccionPuestoPage.tsx`.
- **Backend:** sin cambios.
- **Docs:** `CLAUDE.md`.
