## 1. Fundamentos compartidos

- [x] 1.1 Exportar `prefiereMovimientoReducido` desde
      `features/landing/hooks/useRevelarAlEntrar.ts` y verificar que
      `ComoFunciona`/`AreasTecnicas`/`QueRecibes`/`CierreCTA` (consumidores
      actuales del hook) siguen compilando sin cambios de comportamiento.
- [x] 1.2 Crear `features/landing/hooks/useProgresoAnimado.ts` (valor 0..N
      animado con easing, activado por un flag `activo`, sin animar si
      `prefiereMovimientoReducido()`) y verificar con un uso mínimo (por
      ejemplo, temporalmente en un `console.log`) que llega a N y se detiene.
- [x] 1.3 Crear `features/landing/components/Wrap.tsx`
      (`max-w-[1280px]` + `px-[clamp(20px,4vw,56px)]`, `mx-auto w-full`) y
      verificar que renderiza sin clases conflictivas cuando se anida en una
      sección con fondo propio.
- [x] 1.4 Agregar a `components/ui/Icono.tsx` los 4 trazos nuevos (flecha
      diagonal, chevron izquierda, chevron derecha, círculo de información),
      mismo `strokeWidth`/tamaño que el resto, y verificar que cada uno
      renderiza correctamente en un uso de prueba.
- [x] 1.5 En `styles/index.css`, agregar `html{scroll-behavior:smooth}` y su
      contraparte en el bloque `@media (prefers-reduced-motion:reduce)` ya
      existente, y verificar que un enlace `href="#como-funciona"` (o el id
      que corresponda tras el punto 2) sigue funcionando.

## 2. Navbar flotante

- [x] 2.1 Reescribir `HeaderLanding.tsx` como barra flotante de vidrio
      (separada de los bordes, esquinas 18px, fondo translúcido con blur),
      con el enlace "Inicio" agregado a la lista de secciones.
- [x] 2.2 Corregir el ícono de marca a fondo blanco + ícono en
      `vidrio-acento` (la causa del "no se ve bien" reportado), igual que ya
      lo tiene `FooterLanding.tsx`.
- [x] 2.3 Implementar el `IntersectionObserver` que alterna el navbar entre
      "oscuro sobre el hero" y "claro tras el hero", y otro que marca el
      enlace activo según la sección visible — verificar manualmente con
      `pnpm run dev` haciendo scroll por las 4 secciones.
- [x] 2.4 Cambiar "Crear cuenta" del navbar a botón blanco con la flecha
      diagonal nueva; confirmar que sigue siendo un `<Link to="/registro">`
      y "Iniciar sesión" sigue siendo `<Link to="/login">` (sin tocar
      rutas).

## 3. Hero a pantalla completa

- [x] 3.1 Reescribir `Hero.tsx`: `min-height:100svh`, fondo degradado con
      la cuadrícula tenue y el resplandor que "respira" (reutilizar el
      patrón de manchas decorativas ya usado, ajustado a degradado +
      grid-overlay), título centrado en Fraunces con la segunda línea en
      `#bcd0f5` (agregar como color puntual solo de este elemento, no como
      token nuevo — es un tono de acento sobre fondo oscuro exclusivo del
      hero).
- [x] 3.2 Convertir la línea de datos actual ("N preguntas · Respuestas
      escritas · Resultados al instante") en 3 "ticks" con ícono de check,
      el primero conservando `totalPreguntas` dinámico.
- [x] 3.3 Crear `features/landing/components/VistaPreviaEntrevista.tsx`
      (pregunta fija de la IA, respuesta que se escribe sola con
      `setTimeout`, anillo de puntuación que sube a 85, fortaleza y mejora
      de ejemplo) con bucle, respetando `prefiereMovimientoReducido()`
      (mostrar el estado final sin animar) — verificar visualmente el ciclo
      completo en `pnpm run dev`.
- [x] 3.4 Botones del hero: "Crear cuenta gratis" en blanco
      (`vidrio-secundario`) y "Ya tengo cuenta" en la nueva variante de
      vidrio translúcido `vidrio-glass` (agregada a `Boton.tsx`, reutilizada
      también en el CTA final — ver punto 8.1) — confirman que siguen
      apuntando a `/registro` y `/login`.

## 4. Franja de datos

- [x] 4.1 Crear `features/landing/components/FranjaDatos.tsx`: tarjeta de
      vidrio con 4 `useProgresoAnimado` (preguntas y áreas/niveles desde
      `catalogos`, puntos fijo en 100), activados al entrar en pantalla vía
      el mismo patrón de `useRevelarAlEntrar`.
- [x] 4.2 Insertar `<FranjaDatos />` en `LandingPage.tsx` entre `Hero` y
      `ComoFunciona`, pasándole los datos de `useCatalogosPublicos()` ya
      cargados en la página — verificar que no duplica la petición al
      catálogo. Se omite por completo si el catálogo no cargó, mismo
      criterio que ya usa `AreasTecnicas`.

## 5. Encabezados de sección + Cómo funciona

- [x] 5.1 Crear `features/landing/components/EncabezadoSeccion.tsx`
      (número de fase en píldora vía `EtiquetaMono`, título Fraunces
      ~1.9rem, descripción, línea inferior) y usarlo en `ComoFunciona.tsx`
      con el índice `01`, manteniendo el título/subtítulo actuales.
- [x] 5.2 Agregar el número de paso y la línea conectora (se llena al
      entrar en pantalla, vía `IntersectionObserver`/clase `.in` existente
      en el patrón de `useRevelarAlEntrar`) a las 3 tarjetas de
      `ComoFunciona.tsx`; confirmar elevación al pasar el mouse.

## 6. Qué recibes al terminar (bento)

- [x] 6.1 Adoptar `EncabezadoSeccion` en `QueRecibes.tsx` con índice `02`,
      manteniendo título/subtítulo actuales.
- [x] 6.2 Reestructurar el grid a layout bento (`1.3fr 1fr 1fr`, la
      tarjeta de puntuación ocupando 2 filas) y agregar el medidor circular
      (`useProgresoAnimado` sobre `stroke-dashoffset`) + las 3 barras de
      rúbrica (`useProgresoAnimado` sobre `width%`) dentro de la tarjeta
      grande.
- [x] 6.3 Cambiar el aviso final de IA de bloque grande a nota pequeña con
      el ícono de información nuevo, manteniendo el texto actual.

## 7. Áreas (carrusel)

- [x] 7.1 Crear `features/landing/hooks/useCarrusel.ts` (índice, autoplay
      con `setInterval` apagado si `prefiereMovimientoReducido()`,
      `maxIndex` calculado del total real recibido, handlers de
      anterior/siguiente/ir-a).
- [x] 7.2 Crear `features/landing/components/CarruselAreas.tsx`: 3/2/1
      tarjetas visibles según ancho, tarjeta actual elevada con ícono en
      acento, indicadores tipo barra de tiempo, flechas, pausa en
      `mouseenter`/reanuda en `mouseleave`, `touchstart`/`touchend` para
      deslizar. (Se extrajo `ICONO_POR_AREA`/`ICONO_POR_DEFECTO` de
      `SeleccionAreaPage.tsx` a `lib/iconosPorArea.ts`, compartido entre
      ambos consumidores en vez de duplicar el mapeo.)
- [x] 7.3 Reemplazar la cuadrícula de `AreasTecnicas.tsx` por
      `<CarruselAreas areas={areas} niveles={niveles} />`, adoptar
      `EncabezadoSeccion` con índice `03`, y verificar que solo se listan
      las áreas reales del catálogo (sin agregar "Redes y Seguridad" ni
      "Ingeniería de Software").
- [ ] 7.4 **Pendiente de tu confirmación visual** (no puedo abrir un
      navegador): avance cada 3.5s, pausa al pasar el mouse, flechas,
      indicadores, deslizamiento táctil, y 3/2/1 tarjetas visibles al
      cambiar el ancho de ventana.

## 8. CTA final y footer

- [x] 8.1 Reestructurar `CierreCTA.tsx` a texto-izquierda/botones-derecha
      con los dos resplandores difusos de fondo (mismo patrón de manchas
      decorativas ya usado en el hero), botón blanco con flecha diagonal +
      botón de vidrio.
- [x] 8.2 Reescribir `FooterLanding.tsx` como footer compacto de dos filas
      (logo + enlaces en línea arriba; identificación académica + autor/año
      abajo), quitando la columna de descripción y la de "Proyecto" como
      bloques separados — mismo contenido, presentación compacta.

## 9. Verificación final

- [x] 9.1 `pnpm exec tsc --noEmit` limpio, `pnpm run build` sin errores.
      `pnpm run lint` muestra 4 warnings `set-state-in-effect`: los 2 ya
      conocidos más 2 nuevos (`useProgresoAnimado.ts`, `useCarrusel.ts`) —
      misma categoría que los ya aceptados (sincronizan estado con un
      cambio externo real: `matchMedia`/ancho de ventana, no derivable en
      el render). Detalle en el reporte final, no son errores nuevos de
      otro tipo.
- [x] 9.2 Grep en `features/landing/` confirmando cero `tinta-`/`iris-`.
      Los hex puntuales nuevos (`#bcd0f5`, `#5b86d4`, `#8d9cbd`, `#dfe8fb`)
      son los mismos acentos de un solo uso que ya documentaba `design.md`
      como excepción explícita, no tokens duplicados.
- [ ] 9.3 **Pendiente de tu confirmación visual**: con
      `prefers-reduced-motion: reduce` activado, contadores/medidor/barras/
      carrusel deben mostrar su estado final sin animar.
- [x] 9.4 Confirmado por grep: "Crear cuenta"/"Crear cuenta gratis" llevan
      a `/registro` y "Iniciar sesión"/"Ya tengo cuenta" llevan a `/login`
      en las 4 ubicaciones (navbar, hero, CTA final, footer).
