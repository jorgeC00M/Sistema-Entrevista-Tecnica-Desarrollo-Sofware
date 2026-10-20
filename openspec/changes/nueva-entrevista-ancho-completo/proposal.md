## Why

`pantallas-responsivas` llevó todas las pantallas del sidebar al contenedor común de 1280 px, salvo "Nueva entrevista", que quedó en `max-w-3xl` (768 px). En escritorio sigue viéndose estrecha junto a las demás, y el usuario pide que también use todo el ancho.

## What Changes

- **La pantalla usa todo el contenedor** desde 1024 px. Se quita su `max-w-3xl`. El título y "Repetir última" quedan en los extremos de la misma fila, y la tarjeta ocupa todo el ancho.
- **Pestaña "Personalizada", en escritorio:**
  - los campos van en **una sola fila**: Puesto | Nivel | Tecnología, o Puesto | Nivel | Frontend | Backend en Full Stack;
  - debajo, el resumen (lo elegido, "Cubre: …", "Desde convocatoria") a la izquierda e "Iniciar entrevista" a la derecha, en una sola fila.
- **Pestaña "Con convocatoria", en escritorio:** dos columnas.
  - A la izquierda, la entrada: las dos tarjetas, el campo y "Analizar convocatoria".
  - A la derecha, lo detectado. Antes de analizar, esa columna muestra un aviso discreto, "Aquí verás el puesto, la tecnología y el nivel detectados", para que la pantalla no salte al aparecer el resultado.
- **Por debajo de 1024 px no cambia nada:**
  - en tablet, Puesto y Nivel van en una fila y la Tecnología debajo;
  - en móvil, todo apilado;
  - la convocatoria, en una columna.
- **Sin cambios de comportamiento:** el reducer, el orden del foco (el primer campo vacío), el modal de inicio, las pestañas y la API siguen igual.

## Capabilities

### New Capabilities
- `nueva-entrevista-ancho-completo`: la distribución de la pantalla "Nueva entrevista" en escritorio.

### Modified Capabilities
- Ninguna archivada. Este cambio reemplaza la excepción "selección en `max-w-3xl`" del cambio aún no archivado `pantallas-responsivas`: se archiva después de él.

## Impact

- **Frontend:**
  - `features/seleccion/pages/SeleccionPuestoPage.tsx`, que pierde el ancho máximo y pasa la convocatoria a dos columnas;
  - `features/seleccion/components/FormularioDeEntrevista.tsx`, con una sola fila en `lg`;
  - `features/seleccion/components/ResumenDeEntrevista.tsx`, con una sola fila en `lg`;
  - `features/seleccion/components/PanelDeConvocatoria.tsx`, donde el slot `resumen` pasa a ser la segunda columna, con el aviso previo.
- **Documentación:** `CLAUDE.md`, en el párrafo de la pantalla de selección y en el del contenedor común (que deja de citar la selección como excepción).
- **Sin cambios:** backend.
