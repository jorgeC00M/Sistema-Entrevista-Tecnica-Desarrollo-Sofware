## Why

La pantalla "Nueva entrevista" se configura hoy con tres pasos plegables (tarjetas y botones), y la convocatoria vive aparte, en un modal. El usuario prefiere un **formulario** convencional: cada campo con su título en una etiqueta y un desplegable debajo, y la convocatoria (pegar o subir) **dentro del mismo formulario**. Es el patrón que cualquiera reconoce, se completa de un vistazo y deja juntas las dos formas de configurar la entrevista.

## What Changes

- **BREAKING (interfaz):** los tres pasos plegables se reemplazan por un formulario de campos con `<label>` y un `<select>` nativo con estilo:
  - Puesto;
  - Tecnología, que en un puesto con capas son dos campos: Tecnología de frontend y Tecnología de backend;
  - Nivel ("Junior · Inicial").
- Las tecnologías se agrupan en el desplegable con `<optgroup>` según su `grupo` ("Python": Django, FastAPI, Flask).
- La descripción del puesto elegido se muestra como texto de ayuda bajo su campo.
- Arriba del formulario hay dos pestañas: **"Elegir yo"** y **"Desde una convocatoria"**. La segunda muestra, dentro del formulario, pegar texto o subir PDF/DOCX y el botón "Analizar". El resultado rellena los desplegables, que se pueden ajustar, y muestra los requisitos detectados.
- **BREAKING (interfaz):** se elimina el modal de convocatoria y el paso "Usar este perfil": analizar ya aplica el perfil a los campos.
- Pasar a "Elegir yo" conserva los valores de los campos y deja de usar la convocatoria.
- Se mantienen:
  - "Repetir última" (con su confirmación);
  - la preselección `?puesto=&nivel=`;
  - la barra fija con "Comenzar entrevista";
  - la validación del servidor.
- Se elimina el código sin uso: los componentes de los pasos y el modal de convocatoria. La lógica pura de la selección se simplifica: sin pasos abiertos ni edición.

## Capabilities

### New Capabilities
- `formulario-de-entrevista`: cómo el candidato configura la entrevista en un formulario de desplegables, a mano o desde una convocatoria integrada en el mismo formulario.

### Modified Capabilities
Ninguna en `openspec/specs/` (está vacío). Este cambio **reemplaza** los requisitos de presentación de `seleccion-por-pasos` (tres pasos, capas plegadas, edición por paso) y los de interfaz del modal de `entrevista-desde-convocatoria`; conserva sus reglas de datos (capas, validación, perfil anclado). Ambos siguen sin archivar y deben archivarse antes que este.

## Impact

- **Frontend:**
  - `features/seleccion/`: la página se reescribe; se crean `CampoSelect`, `FormularioDeEntrevista` y `PanelDeConvocatoria`; se adaptan `seleccion.ts` y su test;
  - se eliminan `PasoDeSeleccion`, `TarjetaPuesto`, `EleccionDeTecnologia`, `EleccionDeNivel` y `ConvocatoriaModal`.
- **Backend:** sin cambios; la API ya entrega catálogo, capas, grupos y el análisis de la convocatoria.
- **Docs:** `CLAUDE.md`.
