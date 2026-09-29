## 0. Rama

- [x] 0.1 Crear la rama `adoptar-consola-tecnica` desde `rediseno-sistema-visual` y confirmar con `git branch --show-current` antes de tocar nada

## 1. Tokens

- [x] 1.1 En `styles/index.css`, cambiar `--radius-superficie` a `8px` y añadir `--radius-chip: 4px`; verificar con `pnpm run build` que compila y que `rounded-chip` existe como clase
- [x] 1.2 Añadir al bloque `@theme` la escala nominal (`--text-headline-xl/lg/md/sm`, `--text-body-lg/md/sm`, `--text-label-sans`, `--text-label-mono`, `--text-metric-counter`, `--text-code-inline`, `--text-code-block`) con su `line-height` y `letter-spacing` según `design.md`; verificar que `text-label-mono` y `text-metric-counter` se aplican en una pantalla de prueba
- [x] 1.3 Revisar las pantallas ya existentes tras el cambio de radio y confirmar que ninguna tarjeta quedó con esquina inconsistente (`pnpm run dev`, recorrido visual de historial, perfil y retroalimentación)

## 2. Componentes de metadato

- [x] 2.1 Crear `components/ui/EtiquetaMono.tsx`: texto en mayúsculas, `text-label-mono`, `rounded-chip`, con variantes de tono neutro y de marca; verificar que reemplaza el patrón de cuatro utilidades repetidas en al menos dos llamadas
- [x] 2.2 Ajustar `components/ui/ChipPuntaje.tsx` al formato de la maqueta (`92 / 100` en mono, `rounded-chip`, fondo suave según banda) conservando la prop `banda` obligatoria; verificar que sigue sin recalcular la banda desde el número
- [x] 2.3 Añadir a `components/ui/Icono.tsx` los trazos que falten para los destinos nuevos (terminal para "Entrevista en curso", insights para "Resultados"), del mismo conjunto y grosor que los existentes; verificar con `pnpm exec tsc --noEmit` que `NombreDeIcono` los incluye
- [x] 2.4 Crear `components/ui/Cronometro.tsx`: cuenta ascendente desde el montaje, formato `MM:SS`/`HH:MM:SS`, intervalo limpiado al desmontar; verificar que al desmontar no quedan intervalos vivos y que respeta `prefers-reduced-motion` suprimiendo el pulso

## 3. Navegación (spec `navegacion-app`)

- [x] 3.1 Renombrar `useEntrevistaEnCurso` a `useDestinosDisponibles` y ampliarlo para devolver `{ enCurso, ultimaFinalizada }` desde la misma respuesta de `obtenerHistorial()`; verificar que el número de peticiones de red no aumenta (pestaña Network: sigue siendo una, o dos si hay entrevista a medias)
- [x] 3.2 Añadir a `components/layout/destinos.ts` los destinos "Entrevista en curso" y "Resultados" marcados como condicionales, conservando "Retroalimentación"; verificar que la lista sigue siendo la única fuente para barra y cajón
- [x] 3.3 Hacer que `Sidebar` omita los destinos condicionales cuando no aplican; verificar los cuatro escenarios de `specs/navegacion-app/spec.md` (con y sin entrevista en curso, con y sin entrevista finalizada)
- [x] 3.4 Actualizar `components/layout/titulosDeRuta.ts` con los títulos de las rutas nuevas y añadir la miga en mono (`SIMULADOR TÉCNICO / <sección>`) en `Header.tsx`; verificar que una ruta no registrada sigue cayendo en el título por defecto
- [x] 3.5 Confirmar que el modo enfoque del cambio anterior sigue colapsando el sidebar al entrar a `/entrevista/:id` y que se puede reabrir a mano

## 4. Consola de entrevista (spec `consola-entrevista`)

- [x] 4.1 Extender `MensajeDeChat` con `evaluacion?: Evaluacion` y hacer que `enviarRespuesta` conserve `resultado.evaluacion` en el mensaje del candidato; verificar con `tsc --noEmit` y comprobando que el chip aparece tras responder con `IA_PROVEEDOR=fake`
- [x] 4.2 Adjuntar la evaluación al reconstruir el hilo en el efecto de carga (`i.evaluacion` por intercambio); verificar recargando a mitad de entrevista que las respuestas previas conservan su puntaje
- [x] 4.3 Comprobar que el rollback del reintento sigue retirando el mensaje completo sin dejar evaluación huérfana; verificar forzando un fallo de red y reintentando
- [x] 4.4 Mostrar en `ChatEntrevista` el chip de puntaje y el comentario de la evaluación bajo la respuesta que califica; verificar los tres escenarios de retroalimentación del spec
- [x] 4.5 Reestilar `BurbujaPregunta`: entrevistador en superficie clara con borde e identificador mono, candidato en `tinta-900` con texto blanco alineado a la derecha; verificar contraste AA en ambas
- [x] 4.6 Crear la cabecera de sesión de `EntrevistaPage`: área y nivel, contador `PREGUNTA 03 / 05` en `text-metric-counter` y `Cronometro`; verificar que el contador usa el total que informa el servidor y no un 5 fijo
- [x] 4.7 Integrar `BarraProgreso` en esa cabecera con el estilo de la maqueta; verificar que el porcentaje sigue derivándose de `actual/total`
- [x] 4.8 Añadir el contador de caracteres a `CampoRespuesta` vía la prop `maximoCaracteres` que `Textarea` ya soporta, y rotular el atajo real (Enter envía, Shift+Enter salto de línea — la maqueta decía "Ctrl + Enter", pero eso no es lo que el código hace; se rotula lo verdadero, no lo de la maqueta); verificado que el atajo no se rompió

## 5. Reporte de evaluación

- [x] 5.1 Crear el encabezado del reporte: id de sesión, estado y duración total derivada de `fecha_inicio`/`fecha_fin`; verificar con una entrevista finalizada que la duración coincide con la diferencia real
- [x] 5.2 Reestilar `TarjetaResumen` a la composición de la maqueta: nota grande en mono junto al desglose, sin la banda del promedio (no hay dato); verificar que sigue mostrando `—` cuando `puntuacion_promedio` es `null`
- [x] 5.3 Convertir `PanelCualitativo` en las tres tarjetas de la maqueta (fortalezas, debilidades, sugerencias) con acento superior semántico, reutilizando `ListaRetroalimentacion`; verificar que el color semántico no aparece en ningún botón
- [x] 5.4 Reestilar `TablaPuntuaciones` como "Desglose por pregunta": filas con divisores, número en mono, enunciado, duración desde `tiempo_respuesta` y `ChipPuntaje`; verificar que un intercambio sin evaluar no rompe la fila
- [x] 5.5 Añadir el pie de acciones (nueva entrevista, ver historial) con los estilos nuevos; verificar que las rutas de destino no cambian

## 6. Configuración de entrevista

- [x] 6.1 Convertir `TarjetaArea` en la tarjeta de la maqueta: icono en recuadro, nombre, `descripcion` del catálogo, chip `N PREGUNTAS` desde `preguntas_por_entrevista` y estado seleccionado con anillo `iris`; verificar que conserva `aria-pressed`
- [x] 6.2 Disponer las áreas en rejilla 2×2 en escritorio y una columna en móvil; verificar que con un número de áreas distinto de cuatro la rejilla no se descuadra
- [x] 6.3 Envolver `SelectorNivel` en la tarjeta de calibración con su título y nota de recomendación; verificar que sigue delegando en `ControlSegmentado`
- [x] 6.4 Añadir la tarjeta de resumen de sesión (número de preguntas, duración aproximada, evaluación inmediata) antes del botón de arranque; verificar que el número de preguntas sale del catálogo
- [x] 6.5 Rehacer la cabecera de la pantalla con el rótulo de fase en `EtiquetaMono` y el título en `text-headline-xl`; verificar jerarquía de encabezados (un solo `h1`)

## 7. Extrapolación al resto del sistema

- [x] 7.1 Historial: aplicar cabecera con metadato mono y llevar `ListaEntrevistas` al patrón de filas con divisores ya adoptado; verificar que el badge de estado sigue saliendo de `Badge`
- [x] 7.2 Retroalimentación: aplicar el mismo patrón a `RepartoPorBandas` y `ListaObservaciones`; verificar que los puntajes usan `ChipPuntaje` en vez de texto suelto
- [x] 7.3 Perfil: llevar la lista de campos al patrón de tarjeta con divisores y etiquetas en mono; verificar que los datos siguen siendo de solo lectura
- [x] 7.4 Auth (login y registro): aplicar radios y escala nuevos a la tarjeta del formulario; verificar que el botón de Google sigue degradándose sin `VITE_GOOGLE_CLIENT_ID`
- [x] 7.5 Landing: aplicar radios y escala nuevos a las cinco secciones, conservando el logo del proyecto; verificar que sigue funcionando sin catálogo cargado

## 8. Cierre

- [x] 8.1 Verificar contraste AA en las superficies nuevas: burbuja del candidato sobre `tinta-900`, chips de puntaje, etiquetas mono sobre fondo claro y sobre el sidebar oscuro
- [ ] 8.2 Recorrido completo por teclado de la consola de entrevista: foco visible, campo de respuesta alcanzable, atajo de envío operativo
- [x] 8.3 Ejecutar `pnpm exec tsc --noEmit`, `pnpm run lint` y `pnpm run build`; deben terminar sin errores ni warnings nuevos respecto a la línea base de dos advertencias conocidas
- [ ] 8.4 Recorrido funcional con `IA_PROVEEDOR=fake`: iniciar entrevista, responder las cinco preguntas viendo el puntaje tras cada una, llegar a resultados y volver por historial
- [x] 8.5 Actualizar `docs/arquitectura.md` con los radios nuevos, la escala nominal y la regla de qué token usar en código nuevo
- [x] 8.6 Añadir a `docs/arquitectura.md` la tabla de `design.md` con lo que la maqueta pide y el backend todavía no da, como entrada para la fase de backend
- [x] 8.7 Commit en la rama `adoptar-consola-tecnica` con un mensaje que describa la adopción del lenguaje de consola técnica
