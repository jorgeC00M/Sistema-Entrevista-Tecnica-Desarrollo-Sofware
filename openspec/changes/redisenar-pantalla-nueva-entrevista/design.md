## Context

Ver `proposal.md` — Why para la motivación, y `specs/seleccion-area/spec.md` para
los requisitos.

Restricciones del estado actual que condicionan el enfoque:

- La pantalla es la ruta `/nueva-entrevista`, destino del sidebar
  (`components/layout/destinos.ts`) y del CTA de la landing. No es una acción
  incidental lanzada desde otra pantalla.
- El contenido son cinco bloques en una columna `max-w-3xl`: tarjetas de puesto,
  nivel, tecnología, resumen, y la fila del botón.
- Las tarjetas de puesto son altas porque incluyen una lista de 4–5 temas cada
  una, replicada en las tres.
- El sistema de diseño es "vidrio", con tokens `--color-vidrio-*` y Tailwind v4
  mediante `@theme` (sin archivo de config). Las primitivas que hacen falta ya
  existen en `components/ui/`: `Tarjeta`, `Boton`, `EtiquetaMono`, `Icono`,
  `ControlSegmentado`.
- Existe `hooks/useFocusTrap.ts`, usado por el cajón de navegación móvil, por si
  hiciera falta un contenedor modal.
- El linter es oxlint con `jsx-a11y`, y la línea base conocida son **6
  advertencias**.

## Goals / Non-Goals

**Goals:**

- Que las tres opciones de puesto se comparen simultáneamente.
- Que la acción principal sea alcanzable sin desplazarse.
- Eliminar la información duplicada, en lugar de solo reordenarla.
- No introducir ninguna dependencia ni primitiva de UI nueva.

**Non-Goals:**

- No se cambia la semántica de ninguna de las tres elecciones, ni el contrato con
  el backend, ni `api/entrevistas.ts`.
- No se convierte el formulario en un asistente por pasos.
- No se toca el catálogo ni `hooks/useCatalogos.ts`.
- No se rediseña la pantalla de la entrevista ni la de resultados.

## Decisions

### Pantalla completa, no ventana emergente

Era la pregunta que originó esta revisión. Se mantiene la pantalla.

*Alternativa considerada: modal sobre el dashboard*, reutilizando `useFocusTrap`.
Se descarta por cuatro razones acumulativas:

1. El contenido no cabe. En un portátil de 768 px de alto un modal deja unos
   600 px útiles; los cinco bloques necesitan más, así que habría scroll dentro
   del modal.
2. La ruta ya existe y es un destino real. Un modal no tiene URL salvo montando
   *routing-as-state*; al recargar se perdería lo elegido.
3. En anchos pequeños un modal se convierte en pantalla completa de todos modos:
   serían dos comportamientos para lo mismo.
4. Empezar una entrevista de varias preguntas con cronómetro es un compromiso. El
   peso de una pantalla corresponde al peso de la decisión; un modal comunica lo
   contrario.

*Alternativa considerada: modal en escritorio y pantalla en móvil.* Mismo problema
que el punto 4, más el coste de mantener dos comportamientos.

### Los temas se mudan al panel en vez de recortarse

El problema de altura podía resolverse truncando las listas de temas en las
tarjetas. Se rechaza: la lista existe porque, desde que el usuario elige un puesto
y no un área, es lo único que le anticipa sobre qué le van a preguntar —
truncarla devuelve la opacidad que la lista vino a resolver.

Mostrarla una sola vez, para el puesto elegido, conserva entera esa información y
a la vez la convierte en confirmación de la elección en lugar de ruido repetido
tres veces. Esto es lo que habilita el resto del rediseño: con las tarjetas
adelgazadas, las tres caben en una fila.

### Rejilla de dos columnas con panel pegajoso

`grid lg:grid-cols-[1fr_20rem]`: decisiones a la izquierda, panel a la derecha con
`lg:sticky lg:top-6`.

Posición pegajosa en lugar de un botón flotante suelto: el botón necesita el
contexto del resumen al lado —qué se está por iniciar— y así ambos viajan juntos.

Por debajo de `lg` el panel se convierte en barra inferior fija, que es el patrón
nativo en móvil. El contenedor compensa con relleno inferior equivalente al alto
de la barra, para no tapar el último control enfocado.

### El panel absorbe el resumen; no se mantienen los dos

La tarjeta "Resumen de la sesión" desaparece en lugar de coexistir con el panel.
Dos resúmenes serían la misma duplicación que este cambio viene a eliminar.

El panel se extrae a `components/PanelDeSesion.tsx` en vez de quedar en línea
dentro de la página: tiene dos presentaciones (lateral pegajoso y barra inferior)
y lógica propia de estado vacío, suficiente para justificar su propio archivo.

### El estado vacío se expresa en texto, no solo con `disabled`

Se conserva el `disabled` del botón —es lo que impide el envío— pero deja de ser
la única señal. Un control apagado comunica que no se puede continuar, nunca por
qué.

## Risks / Trade-offs

- **El panel pegajoso en alturas de ventana muy pequeñas (≈600 px) podría exceder
  el viewport y volverse inalcanzable** → el panel lleva su propio
  `max-h`/`overflow-y-auto`, así que el botón sigue alcanzable dentro del panel.
- **La barra inferior fija en móvil puede tapar el control enfocado**, que es
  exactamente lo que advierte la guía de accesibilidad "Focus Not Obscured" →
  relleno inferior en el contenedor y verificación explícita recorriendo con Tab
  hasta el último control.
- **Quitar props de `TarjetaPuesto` rompería cualquier otro consumidor** →
  `tsc --noEmit` lo detecta; hoy el único consumidor es `SeleccionPuestoPage`.
- **Compactar `SelectorNivel` le quita su párrafo explicativo**, que justificaba
  que el nivel ajusta la profundidad y no un límite de tiempo. Se acepta la
  pérdida: el `EtiquetaMono "Adaptativa"` conserva la señal, y el párrafo
  impedía que nivel y tecnología compartieran fila. Si la duda reaparece, el
  lugar natural es un `Tooltip` —ya existe en `components/ui/`— no un párrafo.
- **Tres tarjetas en una fila dejan cada una estrecha (~190 px en 1024 px)**, así
  que la descripción debe caber en una o dos líneas. Si el backend devuelve
  descripciones largas, envolverán; se acepta, porque la tarjeta crece en alto
  sin romper la rejilla.

## Migration Plan

No aplica: cambio solo de presentación en el cliente, sin migración de datos, sin
cambio de contrato y sin bandera de activación. Revertir es revertir el commit.
