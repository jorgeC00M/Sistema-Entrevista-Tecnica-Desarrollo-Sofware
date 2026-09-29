## 1. Backend — retroalimentación acumulada

Es todo el trabajo de backend. No se crean tests: la suite queda en 94.

- [x] 1.1 Añadir `calcular_retroalimentacion(usuario)` en `backend/apps/evaluaciones/services.py`, que agrupe las evaluaciones del usuario por área y cuente cuántas caen en cada banda; agrupar en SQL con `Case`/`When` sobre `puntuacion` y traducir el rango a banda con `rubricas.banda_de`, para no duplicar umbrales
- [x] 1.2 Incluir en cada área su puntuación media y el total de respuestas evaluadas
- [x] 1.3 Añadir la lista de observaciones: área, número de pregunta, texto de la pregunta, puntuación, banda, debilidades, sugerencias y fecha; ordenadas de más reciente a más antigua y limitadas a 20
- [x] 1.4 Filtrar por `intercambio__entrevista__usuario` **sin** filtrar por estado de la entrevista, a diferencia de `calcular_estadisticas`; dejar el motivo en un comentario porque la diferencia es deliberada y no un descuido
- [x] 1.5 Excluir los intercambios sin evaluación, que son las preguntas aún sin responder
- [x] 1.6 Añadir `RetroalimentacionView` en `backend/apps/evaluaciones/views.py` con `IsAuthenticated`, y registrarla en `urls.py` como `retroalimentacion/` bajo `/api/estadisticas/`
- [x] 1.7 Verificar con token que devuelve el reparto por banda y las observaciones de un usuario con entrevistas
- [x] 1.8 Verificar que un usuario no ve observaciones de otro, creando entrevistas para dos usuarios distintos
- [x] 1.9 Verificar que una entrevista abandonada a medias sí aporta observaciones, y que una pregunta sin responder no
- [x] 1.10 Verificar sin token que responde 401
- [x] 1.11 Ejecutar `python manage.py test` y verificar que siguen siendo 94 tests en verde

## 2. Frontend — contrato

- [x] 2.1 Añadir a `types/evaluacion.ts` los tipos `RepartoPorArea`, `Observacion` y `RetroalimentacionAcumulada`, reutilizando `BandaDeRubrica`; verificar con `pnpm exec tsc --noEmit`
- [x] 2.2 Añadir `obtenerRetroalimentacion()` a `api/evaluaciones.ts`
- [x] 2.3 Verificar los tipos contra la respuesta real del endpoint con el backend en marcha

## 3. Frontend — sidebar con destinos fijos

- [x] 3.1 Crear `components/layout/destinos.ts` con la lista única de destinos (etiqueta, ruta e icono), consumida tanto por la barra fija como por el cajón
- [x] 3.2 Crear `components/layout/Sidebar.tsx` con los destinos fijos: nueva entrevista, historial y progreso, retroalimentación, perfil, y la acción de cerrar sesión
- [x] 3.3 Marcar el destino activo con fondo, color y una barra vertical a su izquierda, más `aria-current="page"`; verificar que se distingue sin depender solo del color
- [x] 3.4 Destacar "Nueva entrevista" como acción principal y no como un enlace más de la lista
- [x] 3.5 Montar el sidebar en `router/RutaProtegida.tsx` como primera columna, con el `<Outlet/>` como segunda
- [x] 3.6 Quitar los dos `NavLink` de navegación de `components/layout/Header.tsx`, dejándolo con marca y usuario; verificar que no queda ningún destino duplicado entre header y sidebar
- [x] 3.7 Mover la acción de cerrar sesión al sidebar y quitarla del header, para que no haya dos botones que hagan lo mismo
- [x] 3.8 Crear los iconos que necesiten los destinos siguiendo el patrón de SVG en línea de `features/landing/components/Icono.tsx`, con `aria-hidden`
- [x] 3.9 Añadir el control de plegado a franja de iconos en pantallas anchas, con `aria-expanded` y la etiqueta de cada destino conservada como `title` y texto accesible (alcance añadido a petición del usuario; recogido en la spec)

## 4. Frontend — cajón en pantallas estrechas

- [x] 4.1 Crear `components/layout/useCajonNavegacion.ts` que gestione apertura, cierre con Escape, cierre al pulsar fuera y devolución del foco al control que lo abrió
- [x] 4.2 Añadir al hook el confinamiento del foco mientras el cajón está abierto, de modo que el tabulador no salga a la página de detrás
- [x] 4.3 Ocultar la barra fija por debajo del punto de ruptura y mostrar en su lugar un botón de menú en el header, con `aria-expanded` y una etiqueta accesible
- [x] 4.4 Renderizar el cajón con `role="dialog"` y `aria-modal="true"` sobre el contenido, con una capa de fondo que lo cierre al pulsarla
- [ ] 4.5 Cerrar el cajón al elegir un destino; verificar que al llegar al destino ya no está abierto
- [ ] 4.6 Verificar a 375 px que no hay desplazamiento horizontal con el cajón cerrado ni abierto

## 5. Frontend — entrevista en curso

- [x] 5.1 Crear `components/layout/useEntrevistaEnCurso.ts` que pida el historial una vez, tome la entrevista `en_progreso` más reciente y, solo si existe, pida su estado para conocer la pregunta pendiente
- [x] 5.2 Hacer que un fallo de esas peticiones no muestre error: el elemento simplemente no aparece, porque es información de conveniencia
- [x] 5.3 Crear `components/layout/ContinuarEntrevista.tsx` mostrando el área y en qué pregunta se quedó, enlazando a `/entrevista/:id`
- [ ] 5.4 Insertarlo en el sidebar solo cuando haya entrevista en curso; verificar que sin ninguna a medias no ocupa espacio
- [ ] 5.5 Verificar que los destinos fijos se pintan desde el primer render, sin esperar a estas peticiones
- [ ] 5.6 Verificar que con dos entrevistas en curso se ofrece la más reciente
- [ ] 5.7 Verificar que al terminar la entrevista el elemento desaparece

## 6. Frontend — páginas nuevas

- [x] 6.1 Crear `features/perfil/pages/PerfilPage.tsx` mostrando nombre, correo, fecha de registro y el carnet cuando exista, a partir del usuario que ya expone `useAuth`
- [x] 6.2 Indicar en la página que los datos son de solo lectura, sin ofrecer edición
- [x] 6.3 Crear `features/retroalimentacion/hooks/useRetroalimentacion.ts` con `{datos, cargando, error}`
- [x] 6.4 Crear `features/retroalimentacion/components/RepartoPorBandas.tsx` mostrando, por área, cuántas respuestas cayeron en cada banda; reutilizar `features/resultados/bandas.ts` para los colores y etiquetas
- [x] 6.5 Crear `features/retroalimentacion/components/ListaObservaciones.tsx` con cada observación situada por área, pregunta, puntuación y fecha
- [x] 6.6 Crear `features/retroalimentacion/pages/RetroalimentacionPage.tsx` componiendo ambos, con el estado vacío que invita a hacer la primera entrevista y el estado de error
- [x] 6.7 Añadir el aviso de que la evaluación la genera una IA y no sustituye a un entrevistador humano, con el mismo texto que la landing
- [x] 6.8 Registrar `/perfil` y `/retroalimentacion` en `router/index.tsx` dentro de `RutaProtegida`

## 7. Cierre y verificación

- [ ] 7.1 Verificar el recorrido con teclado: se alcanza cada destino y el foco es siempre visible, con un indicador de al menos 2 px
- [ ] 7.2 Verificar que al abrir y cerrar el cajón sin elegir destino el foco vuelve al botón de menú
- [ ] 7.3 Verificar que con el cajón abierto el tabulador no se escapa al contenido de detrás
- [ ] 7.4 Verificar que el header pegajoso no tapa el elemento enfocado al desplazarse
- [ ] 7.5 Verificar el contraste a 4,5:1 del texto del sidebar, en estado normal y activo
- [ ] 7.6 Verificar los cuatro anchos: 375, 768, 1024 y 1440 px
- [x] 7.7 Ejecutar `pnpm exec tsc --noEmit`, `pnpm run lint` y `pnpm run build` y verificar que los tres terminan sin errores
- [x] 7.8 Actualizar la sección de frontend de `CLAUDE.md` con el sidebar, las dos features nuevas y el endpoint de retroalimentación
