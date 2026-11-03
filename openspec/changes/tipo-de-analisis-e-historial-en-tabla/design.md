## Context

- **Entrada actual.** `EntradaDelAnalisis` tiene dos columnas, «Tu CV» y «Convocatoria · Opcional». El modo sale de `conConvocatoria` (hay texto o archivo) y cambia el texto del botón.
- **Historial actual.** `HistorialDeAnalisis` es una lista de `<button>` por fila, con una excepción en `estilos.test.ts`.
- **Lo que trae la lista del API.** `CurriculumEnLista` no trae el veredicto: este sale de `hallazgos.ts::veredictoDeLegibilidad`, que necesita las debilidades y los campos, y esos datos solo llegan en el detalle.
- **Piezas que ya existen y se reutilizan:**
  - el patrón de radios con forma de tarjeta de `features/seleccion/components/EleccionDeVia.tsx`;
  - `Tabla`, `Paginacion` y `EnlaceDeAccion` (los usa `TablaDeEntrevistas`);
  - `lib/paginacion.ts::recortar`.

## Goals / Non-Goals

**Goals:**
- El tipo es una elección explícita y accesible: radios nativos, un Tab y las flechas.
- Un solo campo de CV para los dos tipos, y la convocatoria solo cuando se pide.
- Un historial en tabla que reutiliza los componentes base, sin botones sueltos.

**Non-Goals:**
- No se cambia la medición, los resultados ni `VERSION_DE_REGLAS`.
- No se agregan filtros ni búsqueda al historial del CV.
- No hay columna de cobertura ni de correcciones; el usuario eligió solo «Campos leídos» y «Ver».

## Decisions

**D1. El tipo es un estado propio (`'general' | 'dirigido' | null`) en `CurriculumPage`, no se deduce del texto.**
- Vive junto a `archivo`, `convocatoria` y `archivoConvocatoria`, así sobrevive a ir y volver de `/mi-cv/:id`, igual que hoy el archivo.
- El envío manda la convocatoria solo si `tipo === 'dirigido'`; en «general» se guarda y no se envía.
- **Alternativa descartada:** borrar la convocatoria al volver a «general». Se perdería lo pegado si el usuario duda entre una opción y otra.

**D2. `EleccionDeTipo` copia el patrón de `EleccionDeVia`, y las clases de la tarjeta-radio pasan a `components/ui/estilosDeOpcion.ts::clasesDeOpcion`.**
- Un solo lugar para el borde, el `has-[:checked]`, el `has-[:focus-visible]` y el estado deshabilitado; `EleccionDeVia` pasa a usarlo.
- **Alternativa descartada:** un componente genérico `OpcionesEnTarjeta` en `ui/`. Las dos elecciones difieren en el `legend`, en la disposición (en fila en la convocatoria, apiladas aquí) y en el tipo del valor. Una constante de clases basta, sin forzar genéricos.

**D3. Orden del DOM = orden del celular: tipo → CV → convocatoria.**
- En `lg`, una grilla de 2 columnas pone `EleccionDeTipo` en `lg:col-start-2 lg:row-start-1 lg:row-span-2`, y el CV y la convocatoria en la columna 1. Es la misma técnica del Resumen en dos columnas.
- En la computadora, el lector y el Tab recorren primero el tipo y después el CV, un orden coherente: primero se decide qué análisis, después se entrega el material.

**D4. `faltaParaAnalizar(...)` es una función pura en `hallazgos.ts`.**
- Devuelve el primer mensaje pendiente o `null`. El botón usa `disabled={falta !== null}` y la línea `aria-live` muestra el mensaje.
- Se prueba con Vitest, porque no hay tests de componentes.
- Mientras analiza, la línea sigue diciendo «Leyendo tu CV y aplicando las reglas del ATS…».

**D5. El veredicto del historial se calcula en el backend (`AnalisisATS.veredicto`).**
- La lista no trae las debilidades, y mandarlas solo para calcular un estado inflaría la respuesta.
- La regla está en dos lenguajes, así que queda fijada por tests en los dos lados: `test_curriculums.py` y `hallazgos.test.ts`.
- `veredictoDeLegibilidad` sigue en el frontend para el Resumen, porque además da la causa.
- **Alternativa descartada:** agregar `debilidades` a la lista y reutilizar la función del frontend. Es más tráfico, y el historial no necesita la causa.

**D6. Los nombres de los estados viven en un solo mapa, `hallazgos.ts::VEREDICTOS`.**
- Para cada nivel guarda la etiqueta corta («Ilegible»), el título del Resumen, el icono y las clases.
- `VeredictoDeLegibilidad` y la tabla leen ese mapa; desaparece el mapa local del componente.

**D7. La fila se abre con `EnlaceDeAccion` («ojo + Ver», a `/mi-cv/:id`), no con una fila clicable.**
- Es el mismo patrón que «Tus entrevistas».
- Se borran el `<button>` de fila, `onAbrir` y la excepción de `estilos.test.ts`; el test que avisa de excepciones sin uso lo confirma.
- La página va en `?pagina=` con `recortar`, y `POR_PAGINA = 10`.

**D8. `tipoDeRevision` devuelve «Análisis general» / «Análisis dirigido».**
- Es el mismo texto en la tarjeta-opción, en la barra del resultado y en la tabla.
- Se sigue usando `EtiquetaConvocatoria` para el dirigido y `EtiquetaMono` para el general.

## Risks / Trade-offs

- **[Un paso más para revisar solo el CV]:** elegir el tipo antes, cuando hoy basta con subir el archivo. → Lo decidió el usuario, para que los dos análisis se vean distintos. La línea de lo que falta guía el primer uso.
- **[La regla del veredicto queda duplicada entre Python y TS].** → Tests espejo con los mismos casos en los dos lados, y un comentario en cada lado que nombra al otro.
- **[El alto de la columna izquierda cambia al elegir «dirigido»].** → Es esperado: la convocatoria aparece debajo del CV, y la columna derecha (`items-start`) no se estira.
- **[`?pagina=` en `/mi-cv` se conserva al abrir un análisis y volver].** → Es el comportamiento deseado. Con un número inválido, `recortar` vuelve a la página 1.

## Migration Plan

- Sin migración de datos ni cambio de reglas. El API agrega `veredicto` a la lista y no quita nada.
- Para volver atrás basta con revertir el frontend; el campo extra no molesta a clientes viejos.
