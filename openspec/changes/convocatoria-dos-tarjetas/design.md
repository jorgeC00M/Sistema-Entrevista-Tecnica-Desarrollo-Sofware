## Context

`PanelDeConvocatoria` (cambio `convocatoria-en-tres-pasos`, aún sin archivar) muestra, en una columna:
- el `Textarea` con la fila de `Chip` de `EJEMPLOS`;
- un separador "o";
- `ZonaDeArchivo`;
- "Analizar convocatoria" y el slot `resumen`.

Texto y archivo se bloquean entre sí con `textoBloqueado` / `archivoBloqueado` y dos textos de ayuda. El resto de la página (resumen, modal, pestañas) no se toca. Ver proposal.md.

La guarda `src/estilos.test.ts` prohíbe `<button` fuera de `components/ui/`, los colores crudos y los radios a mano. No existe un icono de "subir" en `trazosDeIconos.ts`; hay `respuesta` (líneas de texto en un globo) y `documento`.

## Goals / Non-Goals

**Goals:**
- Que las dos formas se vean como alternativas desde el primer vistazo.
- Que se puedan elegir con teclado y que se anuncie bien.
- Quitar los ejemplos y la lógica de bloqueo que deja de hacer falta.

**Non-Goals:**
- Cambiar el análisis, el resumen, el modal de inicio, la API o la pestaña "Personalizada".
- Unificar con `CampoConvocatoria` del módulo de CV, que sigue con su `ControlSegmentado`.

## Decisions

### D1. Las tarjetas son radios nativos con forma de tarjeta
Se usa un `<fieldset>` con `<legend>` "Elige una forma de darnos la convocatoria". Dentro hay dos `<label>`, cada uno con un `<input type="radio" name=… class="sr-only">`, su icono, el título y la ayuda.
- **Gratis con lo nativo:** la semántica "1 de 2, seleccionado", las flechas, Tab que entra al grupo una sola vez, y que `disabled` en el `fieldset` deshabilite ambas.
- **Estilo con `has-[:checked]`:** borde `vidrio-acento` y fondo `vidrio-acento-suave` en la elegida, y `has-[:focus-visible]` para el anillo de foco (la utilidad `foco-anillo` no aplica, porque el foco lo tiene el input oculto).
- **Forma:** `rounded-control` (8px), porque una tarjeta es un control según la regla de forma. Cuadrícula `grid gap-3 sm:grid-cols-2`.
- **Alternativa descartada:** `<button aria-pressed>`, que exigiría flechas a mano y, por la guarda, vivir en `components/ui`. `ControlSegmentado` es justo lo que el usuario sentía que no destacaba.

### D2. Componente `EleccionDeVia` en la feature
Va en `features/seleccion/components/EleccionDeVia.tsx`, con las props `via: 'texto' | 'archivo'`, `onCambiar` y `deshabilitado`. Las dos opciones (icono, título, ayuda) son una constante del archivo.
- **Por qué no en `components/ui`:** hoy tiene un solo uso. Si el módulo de CV lo adopta, se generaliza entonces.
- **Iconos:** `respuesta` para pegar texto y `documento` para el archivo. No se dibuja un icono nuevo.

### D3. El panel guarda los dos valores y envía el de la vía elegida
- **Estado:** `via` (inicial `'texto'`), `texto` y `archivo`, que viven en paralelo. Ya no se bloquea nada.
- **Qué se muestra:** solo el campo de la vía: `{via === 'texto' ? <Textarea…/> : <ZonaDeArchivo…/>}`.
- **Cuándo se puede analizar:** `listo = via === 'texto' ? largo >= 30 : archivo !== null`.
- **Qué se envía:** `analizar` envía `via === 'archivo' ? { archivo } : { texto }`.
- **Se elimina:** `EJEMPLOS`, la fila de `Chip`, el separador "o", `textoBloqueado`, `archivoBloqueado`, `useId` y las ayudas "Borra el texto…" y "Quita el archivo…".
- **Mientras analiza:** `cargando` deshabilita las tarjetas y el campo.
- **Por qué se conservan ambos valores:** cambiar de tarjeta no borra lo hecho. Desmontar el `Textarea` no pierde el texto, porque el estado vive en el panel.

## Risks / Trade-offs

- [Un clic más para quien sube archivo] → "Pegar texto" queda por defecto porque es lo más común (el aviso viene de una web). Subir el archivo cuesta un clic en la tarjeta, y a cambio la elección se ve clara.
- [Sustituye requisitos de un cambio sin archivar] → los dos cambios se archivan juntos, primero `convocatoria-en-tres-pasos` y luego este. Su spec deja escrito qué requisitos reemplaza.
- [`has-[:checked]` requiere un navegador moderno] → Tailwind v4 ya asume navegadores modernos, y `campo` usa `:has()` desde antes.
