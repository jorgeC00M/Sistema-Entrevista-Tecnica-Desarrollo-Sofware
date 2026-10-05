## 1. Panel de sesión

- [x] 1.1 Crear `frontend/src/features/seleccion/components/PanelDeSesion.tsx` con
  las props `puestoElegido`, `nivelElegido`, `tecnologiaElegida`, `areas`,
  `totalPreguntas`, `cargando` y `onComenzar`, reutilizando `Tarjeta`,
  `EtiquetaMono`, `Icono` y `Boton variante="vidrio" forma="pildora"` de
  `components/ui/`. Verificar con `pnpm exec tsc --noEmit` que compila sin añadir
  ninguna importación externa.
- [x] 1.2 Mostrar en el panel el resumen derivado de las elecciones vigentes:
  puesto, nivel, tecnología (omitida si no se fijó) y total de preguntas.
  Verificar en el navegador que cambiar cualquier elección actualiza el resumen.
- [x] 1.3 Mostrar la lista de temas del puesto elegido dentro del panel, y nada
  cuando no hay puesto elegido. Verificar en el navegador que al cambiar de puesto
  los temas cambian.
- [x] 1.4 Sustituir la promesa de retroalimentación inmediata por el texto de que
  la calificación y la retroalimentación aparecen al terminar. Verificar que
  coincide con lo que afirma `features/entrevista/pages/EntrevistaPage.tsx`.
- [x] 1.5 Añadir el estado vacío informativo: mientras falte puesto o nivel, el
  panel nombra en texto qué falta, conservando el `disabled` del botón. Verificar
  en el navegador los tres casos (nada elegido, solo puesto, solo nivel).
- [x] 1.6 Aplicar `lg:sticky lg:top-6` con `max-h`/`overflow-y-auto` propios, y la
  presentación como barra inferior fija por debajo de `lg`. Verificar en el
  navegador a 1280 px, 1024 px y 390 px de ancho.

## 2. Adelgazar las tarjetas y el selector de nivel

- [x] 2.1 Quitar de `components/TarjetaPuesto.tsx` las props `areas` y
  `totalPreguntas` junto con el bloque "Temas que cubre" y el chip de nº de
  preguntas, conservando `<button aria-pressed>`, el anillo del estado activo y el
  `hover:border-vidrio-acento/40`. Verificar con `pnpm exec tsc --noEmit` que no
  queda ningún consumidor pasando esas props.
- [x] 2.2 Actualizar el docstring de `TarjetaPuesto` para que explique que la lista
  de temas vive ahora en el panel, no que la tarjeta la muestra. Verificar
  leyéndolo: no debe quedar afirmando algo que el componente ya no hace.
- [x] 2.3 Compactar `components/SelectorNivel.tsx` quitando el párrafo explicativo
  largo y conservando título, `EtiquetaMono "Adaptativa"` y `ControlSegmentado`.
  Verificar en el navegador que cabe en media fila a 1024 px sin desbordar.

## 3. Rejilla de la página

- [x] 3.1 En `pages/SeleccionPuestoPage.tsx`, pasar de `max-w-3xl` a `max-w-5xl` y
  montar `grid lg:grid-cols-[1fr_20rem]` con las decisiones a la izquierda y
  `PanelDeSesion` a la derecha. Verificar en el navegador que a ≥1024 px hay dos
  columnas y por debajo una sola.
- [x] 3.2 Pasar las tarjetas de puesto de `grid-cols-1 sm:grid-cols-2` a
  `sm:grid-cols-3`, dentro del mismo `<fieldset>/<legend>`. Verificar en el
  navegador que los tres puestos quedan en una sola fila a ≥640 px.
- [x] 3.3 **Desviado del plan**: nivel y tecnología quedan apilados a todo el ancho
  de la columna izquierda, no en una fila de dos. Tecnología tiene cuatro opciones
  de etiqueta larga ("Sin preferencia", "Python / Django", "JavaScript / React",
  "Java / Spring") y `ControlSegmentado` las reparte en una sola fila con
  `flex-1`: en media columna (~300 px) quedarían a ~75 px cada una y el texto se
  rompe. Compartir fila no era un requisito del spec, y sí lo es que las opciones
  se lean. Tecnología gana además una `Tarjeta` propia con encabezado "Stack de
  preferencia" + `EtiquetaMono "Opcional"`, para no quedar como control desnudo
  junto a la tarjeta del nivel.
- [x] 3.4 Eliminar la tarjeta "Resumen de la sesión" y la fila inferior del botón,
  cuyo contenido pasa a `PanelDeSesion`. Verificar que no queda ningún resumen
  duplicado en pantalla.
- [x] 3.5 Quitar del párrafo de introducción la frase sobre el total de preguntas,
  que ahora vive en el panel. Verificar que el dato aparece una sola vez en la
  pantalla.
- [x] 3.6 Añadir al contenedor el relleno inferior equivalente al alto de la barra
  fija (`pb-28` o el valor que corresponda al alto real). Verificar a 390 px
  recorriendo con Tab hasta el último control que la barra no lo tapa.

## 4. Verificación

- [x] 4.1 Ejecutar `pnpm exec tsc --noEmit` y `pnpm run build`, ambos sin errores.
- [x] 4.2 Ejecutar `pnpm run lint` y confirmar que sigue en las 6 advertencias
  conocidas (`react(set-state-in-effect)` ×5 y `react(refs)` ×1); cualquier
  séptima es de este cambio y hay que resolverla.
- [ ] 4.3 Recorrido manual de extremo a extremo en `/nueva-entrevista` con
  `IA_PROVEEDOR=fake`: elegir puesto, nivel y tecnología, comprobar que al
  desplazarse el botón sigue visible, y confirmar que comenzar la entrevista sigue
  navegando a `/entrevista/:id`.

> **4.3 queda pendiente a propósito**: es el único paso que requiere un navegador
> y solo Jorge puede ejecutarlo. Lo automático ya pasó: `tsc --noEmit` limpio,
> `pnpm run build` correcto y `pnpm run lint` en las 6 advertencias conocidas.
> Lo que queda por comprobar a ojo es el comportamiento responsive (tres tarjetas
> en una fila, panel pegajoso, barra inferior que no tapa el foco con Tab).
