## Context

`CurriculumPage.tsx` (241 líneas) junta el estado (archivo, convocatoria y su archivo, resultado, errores por campo, historial con `usePeticion`), la llamada a `analizarCurriculum`, la apertura desde el historial (`obtenerCurriculum`) y todo el render.
- **Entrada:** `CampoConvocatoria` (su propia `Tarjeta` con título, "Opcional" y `ControlSegmentado` Pegar/Subir) y `SubirArchivo` (`Tarjeta` + `ZonaDeArchivo` + "Analizar mi CV"), en una rejilla de dos columnas.
- **Resultado:** las secciones apiladas.

`components/ui/Pestanas.tsx` implementa el patrón ARIA de pestañas con un solo panel (`idBase`, `idPanel`). Ver proposal.md.

## Goals / Non-Goals

**Goals:**
- El CV primero.
- La convocatoria opcional y plegada.
- El resultado que empieza por un resumen, en pestañas.
- La página reducida a orquestación.

**Non-Goals:**
- Cambiar textos, términos, backend, API o el contenido de las secciones.
- Persistir la pestaña en la URL.

## Decisions

### D1. Tres componentes nuevos y la página como orquestadora
- **`EntradaDelAnalisis`:** recibe `archivo`, `convocatoria`, `archivoConvocatoria`, `analizando`, `errores` y los `on*`, más `onAnalizar` y `refArchivo` para el foco. Contiene:
  - una `Tarjeta` con el título "Tu currículum" y la `EtiquetaMono` "PDF o DOCX";
  - `ZonaDeArchivo`;
  - el disclosure;
  - el botón "Analizar mi CV" a la derecha.
- **`ResultadoDelAnalisis`:** recibe `resultado` y `onAnalizarOtro`. Pinta la barra de contexto y las `Pestanas`, guarda la pestaña en estado y se reinicia a "resumen" con `key={resultado.id + fecha}` en la página.
- **`ResumenDelAnalisis`:** recibe `analisis`, `conConvocatoria` y `onVerTodo`.
- **`CurriculumPage`:** conserva el estado, `analizar`, `abrir` y `limpiarErrorDeCampo`, y elige entre la entrada + historial o el resultado.

### D2. Disclosure de la convocatoria
Es un `Boton variante="texto" icono="mas"` con `aria-expanded` y `aria-controls`.
- **Al abrir:** el contenido se monta debajo.
- **Al cerrar:** `onTexto('')` y `onArchivo(null)`.
- **Abierto al entrar** si ya hay texto o archivo de convocatoria, como al volver con "Analizar otro".

`CampoConvocatoria` deja de envolver en `Tarjeta` y de pintar el título "La convocatoria" + "Opcional", porque el disclosure ya lo dice; conserva su explicación, el `ControlSegmentado`, el textarea y el error. Es el único que lo usa, así que no hace falta una prop de variante.

### D3. Orden de gravedad como función pura
En `features/curriculum/hallazgos.ts`:
```ts
const PESO: Record<Severidad, number> = { critica: 0, alta: 1, media: 2, baja: 3 }
export function debilidadesPorGravedad(h: Hallazgo[]): Hallazgo[]
```
- **Ordena:** de forma estable y sin mutar la entrada.
- **Nombres:** los valores reales de `Severidad` se leen de `types/curriculum.ts` al implementar.
- **Test** en `hallazgos.test.ts`:
  - el orden;
  - la estabilidad;
  - que no muta la entrada;
  - una lista vacía.

### D4. Pestañas condicionales
`ResultadoDelAnalisis` construye la lista de pestañas a partir de los datos:
- `resumen` y `corregir` (con su etiqueta `Qué corregir (n)`);
- `requisitos` / `tecnologias`, según `con_convocatoria`;
- `vinetas` si hay `analisis.vinetas` o `revision_ia.correcciones.length > 0`;
- `entrevista` si hay `revision_ia.preguntas.length > 0`.

Cada pestaña pinta los componentes existentes sin tocarlos. "Ver todo en Qué corregir" llama a `setPestana('corregir')` y lleva el foco a esa pestaña.

### D5. Foco
- **Tras analizar o abrir:** el foco va al encabezado del resultado (`h2` con el nombre del archivo, `tabIndex={-1}`).
- **"Analizar otro":** el foco va a la zona del archivo. Se usa `requestAnimationFrame` tras el render, el mismo patrón de `SeleccionPuestoPage`.

### D6. Código muerto
- Se borra `SubirArchivo.tsx`.
- `ResumenDeSeveridad` (en `ListaDeHallazgos.tsx`) se elimina si el contador de la pestaña lo hace innecesario.
- La rejilla `lg:grid-cols-2` de la entrada se quita, junto con su comentario.

## Risks / Trade-offs

- [Contenido repartido en pestañas: quien quería imprimir o leer todo de corrido pierde la vista única] → el Resumen da lo esencial; aceptado por la decisión del usuario.
- [`CampoConvocatoria` pierde su tarjeta] → es su único uso; si otra pantalla lo necesitara, se envuelve allí.
- [Volver a la entrada desmonta el resultado] → se recupera desde el historial, que ya lo lista al volver.

## Ajustes al implementar

- **"Para la entrevista" aparece siempre**, no solo con preguntas. `PreguntasProbables` siempre lleva el paso "Practicar la entrevista", con el puesto sugerido si lo hay; ocultar la pestaña sin preguntas habría quitado el puente entre el CV y la práctica. El spec se corrigió.
- **El disclosure cambia su texto al abrirse** a "Quitar la convocatoria", con el icono `cerrar`. Como al plegar se vacía lo escrito, el botón tiene que decir que quita algo, no solo que lo oculta.
- **`Pestanas` se desplaza en horizontal:** con cinco pestañas, a 375 px la fila desbordaba la página. Ahora la lista hace `overflow-x-auto` y cada pestaña `shrink-0 whitespace-nowrap`; se quitó el `-mb-px`, que con el desplazamiento recortaba el subrayado. Afecta también a las pestañas de "Nueva entrevista", que solo tienen dos y no cambian a la vista.
- **`CampoConvocatoria` arranca en la vía "Subir archivo"** si ya trae un archivo, como al volver con "Analizar otro".
