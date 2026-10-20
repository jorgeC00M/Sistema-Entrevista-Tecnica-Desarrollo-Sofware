## Why

El modal "Aplicar configuración anterior" termina con una línea del tipo "Reemplaza tu selección actual (…) y la búsqueda «des». No se puede deshacer." Es ruido:
- la búsqueda es texto que se vuelve a escribir en un segundo;
- "no se puede deshacer" es exagerado para una elección que se cambia con un clic;
- el modal ya tiene un título y una tabla claros.

Además, hoy "Confirmar" aplica la configuración y cierra, pero no lleva al usuario a ningún lado. El foco vuelve al botón "Repetir última" y no queda claro qué cambió ni qué falta, sobre todo cuando la tecnología de esa entrevista ya no está disponible.

## What Changes

- **Se quita del cuerpo del modal la línea de advertencia.** El cuerpo queda solo con "Tu última entrevista:" y la tabla de puesto, tecnología y nivel.
- **Al confirmar, la pantalla debe:**
  1. elegir el puesto, el nivel y, si sigue disponible, la tecnología de la última entrevista;
  2. borrar la búsqueda, para que el puesto elegido se vea en la lista completa en vez de quedar oculto por un filtro;
  3. llevar al usuario al siguiente paso:
     - con la configuración completa, desplazarse a la barra de resumen y poner el foco en "Comenzar entrevista";
     - si falta la tecnología, desplazarse a "¿Con qué tecnología trabajas?" y poner el foco en su primera opción;
  4. anunciarlo a lectores de pantalla ("Configuración anterior aplicada" o "…; falta elegir la tecnología");
  5. **no** iniciar la entrevista: la acción solo prepara la selección.
- **Se simplifican las propiedades de `RepetirConfiguracion`:** se eliminan `seleccionActual` y `busqueda`, que solo alimentaban la advertencia.
- **Se agrega `focoAlCerrar`** a `components/ui/Modal.tsx`: un elemento al que llevar el foco al cerrarse, en vez del que lo abrió. Lo necesita el punto 3, y sirve a cualquier modal cuya acción mueva al usuario a otro sitio.

## Capabilities

### New Capabilities
- `repetir-configuracion`: qué muestra la confirmación de "Repetir última" y qué ocurre en la pantalla al confirmarla.

### Modified Capabilities
<!-- La capacidad de selección vive en el cambio `rediseno-seleccion-entrevista`, aún sin archivar; este cambio no altera sus requisitos. -->

## Impact

- **Frontend:**
  - `features/seleccion/components/RepetirConfiguracion.tsx`;
  - `features/seleccion/pages/SeleccionPuestoPage.tsx`;
  - `features/seleccion/components/BarraDeResumen.tsx` (necesita referencia a su botón);
  - `features/seleccion/components/EleccionDePuesto.tsx` (referencia al grupo de tecnologías);
  - `components/ui/Modal.tsx` y `ModalDeConfirmacion.tsx` (`focoAlCerrar`).
- **Backend:** sin cambios.
- **Documentación:** el apartado de `CLAUDE.md` sobre "Repetir última".
