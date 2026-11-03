## Context

Hoy «Tipo de análisis» es un `CampoSelect` dentro de `<Tarjeta className="p-5 lg:col-span-2">`, en `EntradaDelAnalisis`. Así lo dejó `tipo-de-analisis-en-combo`. La pestaña «Con convocatoria» de «Nueva entrevista» ya resuelve una elección de dos opciones con tarjetas: `EleccionDeVia` usa radios nativos `sr-only` dentro de `label` y estiliza el estado con `has-[:checked]`, `has-[:focus-visible]` y `has-[:disabled]`. Sus clases son la constante local `CLASES_DE_OPCION`.

## Goals / Non-Goals

**Goals:**
- Dos tarjetas compactas, centradas y lado a lado en todos los anchos.
- Reutilizar el patrón y las clases de `EleccionDeVia`.
- Sin una tarjeta dentro de otra.

**Non-Goals:**
- Cambiar la fila CV + convocatoria, el botón, el historial o el valor por defecto.
- Cambiar el aspecto de `EleccionDeVia`.

## Decisions

**D1. Vuelven los radios-tarjeta y `clasesDeOpcion` vuelve a compartirse.**
- `CLASES_DE_OPCION` sale de `EleccionDeVia.tsx` y pasa a `components/ui/estilosDeOpcion.ts::clasesDeOpcion`. Se separó cuando tenía un solo consumidor; ahora vuelve a tener dos.
- El radio nativo da gratis el teclado (flechas, un Tab) y el anuncio «n de 2, seleccionado». Un listbox o botones con `aria-pressed` habría que reimplementarlos a mano.
- *Alternativa descartada:* un `ControlSegmentado`. Es un conmutador de texto corto, sin espacio para icono y pregunta.

**D2. Lado a lado en todos los anchos.**
- El contenedor es `mx-auto grid max-w-xl grid-cols-2 gap-3`:
  - dos columnas siempre, como pidió el usuario;
  - `max-w-xl` (576 px), así cada tarjeta mide como mucho ~280 px y queda centrada;
  - a 390 px, con los márgenes de la página, cada una mide ~170 px.
- Para que el texto quepa, la pregunta va en `text-meta` y el nombre en `text-sm font-semibold`. Las dos se parten en líneas (`min-w-0`, sin `truncate`).
- Si el padding de `clasesDeOpcion` (`px-4 py-3.5`) resulta excesivo a 390 px, se reduce solo en estas tarjetas con una clase adicional (`px-3`). El estilo compartido no se toca.

**D3. Sin tarjeta contenedora.**
- `EntradaDelAnalisis` cambia la `Tarjeta` del tipo por un `<div className="lg:col-span-2">`.
- Las opciones ya tienen borde y fondo, y meterlas en otra caja sería una tarjeta dentro de otra.
- El `fieldset` lleva una `legend` centrada «Tipo de análisis», con el mismo estilo de título que «Tu CV».

**D4. Un indicador redondo decorativo.**
- Es un `span` `h-4 w-4 rounded-full border`, que se rellena con `group-has-[:checked]` (el `label` lleva `group`). Va con `aria-hidden="true"`.
- Hace visible de un vistazo cuál está elegida, además del borde y el fondo de `clasesDeOpcion`. No es la única señal.

## Risks / Trade-offs

- **[Riesgo]** A 320 px, dos columnas con icono y texto pueden quedar apretadas. → **Mitigación:** el icono va arriba del nombre en vez de al lado, con el padding reducido, y se prueba a 360 y a 390 px. Si algo desborda, el texto se parte en líneas en vez de cortarse.
- **[Trade-off]** Se vuelve a extraer `estilosDeOpcion.ts`, que el cambio anterior había borrado. Es correcto: lo que cambió es el número de consumidores.
