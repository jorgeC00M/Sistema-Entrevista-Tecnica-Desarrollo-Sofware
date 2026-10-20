## Context

`SeleccionPuestoPage` muestra una tarjeta con:
- un `ControlSegmentado` ("Elegir yo" / "Desde una convocatoria", con `aria-pressed`);
- `PanelDeConvocatoria` (con `hidden` fuera de su modo) y `FormularioDeEntrevista`.

Fuera de la tarjeta, `BarraDeResumen` es una barra `sticky bottom-3` con el resumen y un botón `md` que en el móvil ocupa todo el ancho (`w-full sm:w-auto`). El error de inicio va en un `Alerta` entre la tarjeta y la barra. `Boton` admite los tamaños `sm` (`px-3 py-1.5`) y `md`. Ver proposal.md.

## Goals / Non-Goals

**Goals:** pestañas accesibles y reutilizables; todo el formulario en una sola tarjeta; un botón compacto.

**Non-Goals:** cambiar los campos, el estado (`seleccion.ts`), la convocatoria o la API.

## Decisions

### D1. Componente `Pestanas` con el patrón ARIA *tabs*
`components/ui/Pestanas.tsx` recibe `etiqueta` (`aria-label` del tablist), `pestanas: { valor, etiqueta }[]`, `seleccionada`, `onSeleccionar` e `idPanel`. Renderiza:
- un `div role="tablist"` con un `button role="tab"` por opción;
- en cada pestaña, `id` estable (`useId` más el valor), `aria-selected`, `aria-controls={idPanel}` y `tabIndex` 0 solo en la seleccionada.

Teclado:
- ← y → con vuelta, Inicio y Fin;
- activación automática: mover el foco selecciona, porque el cambio es instantáneo y no hay nada que cargar.

El componente expone `idDePestana(valor)` como prop de render para que la página ponga `aria-labelledby` en su panel.
- **Por qué no reutilizar `ControlSegmentado`:** es un grupo de botones conmutadores (`aria-pressed`) dentro de un `fieldset`. Semánticamente es un interruptor, no una navegación entre vistas, y lo usan otras pantallas (además del selector Pegar/Subir), que no deben cambiar.
- **Estilo:** pestañas de texto con un subrayado de acento de 2 px en la seleccionada y una línea `vidrio-linea` bajo el tablist. Altura táctil de 44 px como mínimo. Es el tratamiento de navegación que distingue a las pestañas de un interruptor.

### D2. Un solo `tabpanel` para ambas pestañas
Ambas pestañas comparten los campos, el resumen y el botón; lo único que cambia es si se ve la entrada de la convocatoria. Por eso hay **un** `div role="tabpanel"` (con `id={idPanel}`, `aria-labelledby` hacia la pestaña activa y `tabIndex={0}`, como pide el patrón) que envuelve todo.
- **Alternativa descartada:** dos paneles que dupliquen el formulario. Habría dos juegos de `<select>` con los mismos `id` o un estado sincronizado entre ambos, por un beneficio nulo.

`PanelDeConvocatoria` sigue montado con `hidden`, así que el texto y el último análisis se conservan, igual que hoy.

### D3. `ResumenDeEntrevista` reemplaza a `BarraDeResumen`
Tiene las mismas props (`eleccion`, `falta`, `areas`, `totalPreguntas`, `cargando`, `onComenzar`, `refBoton`, `desdeConvocatoria`) más `error`. Cambios:
- sin `sticky`, sin fondo translúcido y sin sombra flotante;
- un `border-t vidrio-linea` arriba que lo separa de los campos;
- el texto a la izquierda y el botón a la derecha (`flex flex-wrap items-end justify-between gap-3`); en el móvil el botón baja a su propia línea y se alinea a la derecha (`ml-auto`), sin `w-full`;
- el botón con `tamano="sm"`, `icono="play"` y el texto "Iniciar entrevista";
- `error`, cuando lo hay, va en un `p role="alert"` encima de la fila (con los tokens `error-*`) y reemplaza al `Alerta` suelto de la página.

`BarraDeResumen.tsx` se elimina.
- **Por qué un componente nuevo y no editar el viejo:** el nombre "Barra" describe una posición fija que deja de existir. Renombrar evita que el código mienta sobre lo que pinta.

### D4. Foco
Sin cambios en la lógica: el destino del foco sigue siendo el primer `<select>` vacío o `refBoton`, que ahora apunta a "Iniciar entrevista". El `tabpanel` con `tabIndex={0}` sigue el patrón ARIA: desde las pestañas, Tab entra al panel y luego a sus controles.

## Risks / Trade-offs

- [Sin barra fija, en pantallas bajas el botón puede quedar fuera de la vista] → el formulario es corto (dos filas y el resumen), y tras "Repetir última" o la convocatoria el foco y el desplazamiento llevan al botón si no falta nada.
- [Un `tabpanel` con `tabIndex={0}` agrega una parada de Tab] → es la recomendación del patrón ARIA cuando el panel no empieza con un control enfocable; aquí puede empezar con el texto del panel de convocatoria.
