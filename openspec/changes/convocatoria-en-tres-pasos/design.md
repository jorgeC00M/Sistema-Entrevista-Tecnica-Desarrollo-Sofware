## Context

`SeleccionPuestoPage` tiene dos pestañas sobre un único `tabpanel`. Dentro van:
- `PanelDeConvocatoria`, oculto con `hidden` fuera de su pestaña, con `ControlSegmentado` Pegar/Subir, `Textarea`, `ZonaDeArchivo`, `Chip` de ejemplo, "Analizar" y un resumen con "Volver a aplicar";
- `FormularioDeEntrevista`, con los desplegables;
- `ResumenDeEntrevista`, con el botón con icono y el error de inicio.

Analizar despacha `aplicar` sobre la `seleccion` compartida y guarda `convocatoriaId`; pasar a "Personalizada" lo anula. `ModalDeConfirmacion` envuelve `Modal` (un `<dialog>`, `focoAlCerrar` se evalúa al desmontar). Ver proposal.md.

## Goals / Non-Goals

**Goals:**
- Un camino lineal en "Con convocatoria".
- Cero desplegables en esa pestaña.
- Un modal informativo único para iniciar desde cualquier pestaña.
- Retirar lo que deja de usarse.

**Non-Goals:**
- Cambiar el análisis, el backend, el formato del perfil o la pestaña "Personalizada" (salvo su botón).

## Decisions

### D1. El contenido del `tabpanel` depende de la pestaña
- **"Personalizada":** `FormularioDeEntrevista` + `ResumenDeEntrevista`.
- **"Con convocatoria":** `PanelDeConvocatoria`, que ya incluye su `ResumenDeConvocatoria`.

`PanelDeConvocatoria` sigue **montado siempre** (con `hidden`) para conservar el texto, el archivo y el último análisis al ir y volver. Los campos de "Personalizada" no necesitan seguir montados: su estado vive en el reducer.

### D2. Exclusión texto/archivo en el panel
`textoBloqueado = archivo !== null` y `archivoBloqueado = texto.trim() !== ''`. El `Textarea` recibe `disabled` y una ayuda (`aria-describedby`) y la `ZonaDeArchivo` recibe `deshabilitado` con su ayuda debajo. Los ejemplos (`Chip`) se deshabilitan junto con el texto. Se elimina el estado `via` y el `ControlSegmentado`.

### D3. `ResumenDeConvocatoria`
Recibe `perfil`, `seleccion`, `catalogo`, `onIniciar` y `onCompletar`.
- **Qué muestra:** una `dl` con Puesto, Tecnología y Nivel, tomados de `seleccion` (lo aplicado y validado contra el catálogo), no del perfil crudo. Así, un código inactivo descartado por `aplicar` se ve como faltante.
- **Si está completo:** `campoFaltante() === null` muestra "Iniciar entrevista".
- **Si no:** muestra "Completar en Personalizada" y marca el dato faltante, por ejemplo "no indicada en el aviso" en la Tecnología, o "falta el backend" si la capa existe a medias.
- **Además:** los requisitos en `Chip` estáticos, "No se evalúa", y el aviso de nivel supuesto.
- **Por qué no está en `PanelDeConvocatoria`:** el panel ya es largo, y el resumen es una unidad con su propia lógica de completo o incompleto.

### D4. "Completar en Personalizada" no pasa por `cambiarModo`
La página expone `completarEnPersonalizada()`: `setModo('manual')` **sin** anular `convocatoriaId`, y luego el foco al primer `<select>` vacío (con el `destinoDelFoco` existente). `cambiarModo` desde las pestañas sigue anulando la convocatoria. Son dos intenciones distintas: "quiero completar este perfil" frente a "ya no parto de este aviso".

Dos consecuencias, decididas al implementar:
- **Volver a "Con convocatoria"** con un análisis previo vuelve a aplicar lo detectado y recupera `convocatoriaId`. Así el resumen "Detectamos" siempre dice lo que de verdad se usará, en vez de mostrar valores cambiados a mano bajo ese título. Sustituye al botón "Volver a aplicar este perfil".
- **"Repetir última"** pasa a "Personalizada" y descarta la convocatoria: es una configuración elegida a mano, y en "Con convocatoria" no hay campos donde mostrarla.

### D5. `ModalDeInicio`
Se monta con `{confirmando && <ModalDeInicio …/>}`, igual que los demás modales, y usa `ModalDeConfirmacion` con `titulo="Iniciar entrevista"`, `textoConfirmar="Comenzar"` y `cargando`.
- **Cuerpo:** el nombre del puesto, "tecnología · nivel", la etiqueta "Basada en tu convocatoria" y tres puntos. "N preguntas, una a la vez" toma N de `preguntas_por_entrevista`.
- **Error:** el error de inicio va en un `p role="alert"` dentro del cuerpo. La página deja de mostrarlo en el panel y `ResumenDeEntrevista` pierde la prop `error`.
- **Foco al cerrar:** `focoAlCerrar` no hace falta. Al cancelar, el foco vuelve solo a quien abrió el modal (el botón); al confirmar, se navega.
- **Por qué un componente aparte:** las dos pestañas lo abren con los mismos datos, así que se escribe una sola vez.

### D6. Botón sin icono
`ResumenDeEntrevista` y `ResumenDeConvocatoria` usan `<Boton tamano="sm">Iniciar entrevista</Boton>`, sin `icono`.

### D7. Lo que se elimina
- En `PanelDeConvocatoria`: el `ControlSegmentado`, el estado `via`, la prop `aplicada`, "Volver a aplicar este perfil" y "Perfil aplicado a los campos de abajo".
- En `ResumenDeEntrevista`: la prop `error` y el icono.
- En la página: el `iniciar` directo desde el botón, que ahora abre el modal.
- `ControlSegmentado` **se mantiene**: lo usan `CampoConvocatoria` (CV) y `ListaObservaciones`.

## Risks / Trade-offs

- [Sin desplegables, el usuario no puede corregir el nivel detectado desde esta pestaña] → "Completar en Personalizada" solo aparece si falta algo. Para corregir un dato ya detectado, la pestaña "Personalizada" queda a un clic, aunque cambiar a mano descarta la convocatoria. Se acepta: es la regla aprobada en el cambio anterior. Si en la práctica molesta, el resumen podría mostrar siempre un enlace "Ajustar en Personalizada" con la misma semántica de D4.
- [El modal agrega un clic antes de empezar] → es la pausa que pidió el usuario, y explica qué esperar.
