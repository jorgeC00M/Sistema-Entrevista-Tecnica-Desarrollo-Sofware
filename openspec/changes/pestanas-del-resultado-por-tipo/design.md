## Context

`ResultadoDelAnalisis` arma las pestañas `'resumen' | 'mejorar'` con `Pestanas` (con `repartir` y fijas bajo la cabecera) y un solo `role="tabpanel"`. `ResumenDelAnalisis`, con convocatoria, pone en la columna izquierda `FrenteAlAviso` (o `SinRequisitosReconocidos`), y calcula `sugerencias` a partir de `revision_ia.requisitos`. `FrenteAlAviso` abre con la frase de `requisitos.ts::busquedaDelReclutador`. `LoQueDebesHacer` lleva a «Mejorar» con `onVerTodo` / `onIrA`.

## Goals / Non-Goals

**Goals:**
- Pestañas con nombres por tipo; el match con la oferta en su propia pestaña en el dirigido.
- Una sola definición de la frase de búsqueda, usada en dos lugares.

**Non-Goals:**
- Cambiar la medición, el contenido de las correcciones, el CV ilegible o la entrada.
- Guardar la pestaña en la URL.

## Decisions

**D1. `Pestana = 'resumen' | 'match' | 'mejorar'`, con la lista según `con_convocatoria`.**
- Los valores internos no cambian de significado: `resumen` y `mejorar` siguen siendo las mismas vistas. Así `verTodo` / `irA` (que llevan a `mejorar`) no cambian.
- Solo cambian las etiquetas y se agrega `match`.

**D2. El bloque del aviso se mueve de `ResumenDelAnalisis` a `ResultadoDelAnalisis` (panel `match`).**
- Va con su cálculo de `sugerencias`.
- El `aviso` de la IA (`AvisoDeRevision`) se muestra también en `match`, porque «Cómo cubrir» depende de las sugerencias.
- `ResumenDelAnalisis` se simplifica: su grilla queda igual con convocatoria y sin ella, salvo «Tecnologías por las que te encontrarían», que sigue solo en el general.

**D3. `BusquedaDelReclutador`, un componente extraído de `FrenteAlAviso`.**
- Recibe la `brecha` y pinta el `<p>` con icono y el par de color de estado.
- `FrenteAlAviso` lo usa como primera línea.
- El Resumen lo usa con «Ver el match» al lado (`Boton variante="texto"`), dentro de una `Tarjeta` a todo el ancho y arriba de la grilla.
- Sin `brecha` (aviso sin requisitos reconocidos), el Resumen no muestra nada y la pestaña Match muestra `SinRequisitosReconocidos`.

**D4. `verMatch` sigue el mismo patrón que `verTodo`.**
- Pone la pestaña `match` y, en el siguiente frame, enfoca su botón (`${idPestanas}-match`), así el lector de pantalla anuncia el cambio.

**D5. Las pestañas en el celular.**
- Con `repartir`, son `grid grid-cols-3`.
- Si el botón de `Pestanas` impide el salto de línea (`whitespace-nowrap`), se permite solo cuando `repartir` está activo (`text-center leading-tight`), para que «Match con la Oferta» quepa en dos líneas sin desbordar.
- Desde `sm` siguen en una sola línea.

## Risks / Trade-offs

- **[Riesgo]** Quien entra al dirigido ve primero el veredicto y no las palabras clave. → **Mitigación:** la línea de match responde la pregunta del dirigido arriba del todo, y «Ver el match» lleva al detalle en un clic.
- **[Trade-off]** La frase de búsqueda aparece en dos pestañas. Es la misma componente y la misma medición; en el Resumen funciona como titular y en el Match como encabezado del detalle.
