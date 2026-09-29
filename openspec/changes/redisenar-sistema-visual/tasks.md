## 0. Rama

- [x] 0.1 Crear la rama `rediseno-sistema-visual` desde `jorge` y cambiar a ella antes de tocar cualquier archivo

## 1. Tokens y tipografía

- [x] 1.1 Declarar la paleta `tinta`/`iris` y los semánticos `exito`/`progreso`/`error` en `@theme` dentro de `frontend/src/styles/index.css`
- [x] 1.2 Declarar `--radius-superficie: 16px` y `--radius-control: 8px` en el mismo bloque `@theme`
- [x] 1.3 Reemplazar el `@import` de Plus Jakarta Sans por IBM Plex Sans (400/500/600) e IBM Plex Mono (400/500), con `display=swap`; actualizar `--font-sans` y añadir `--font-mono`
- [x] 1.4 Verificar con `pnpm run build` que el CSS compila y las fuentes nuevas quedan en el bundle

## 2. Iconos

- [x] 2.1 Crear `components/ui/Icono.tsx` fusionando los trazos de `components/ui/IconoNav.tsx` y `features/landing/components/Icono.tsx`, tomando la forma real de Tabler Icons para cada uno (mismo `viewBox` y `stroke-width` en todos)
- [x] 2.2 Actualizar cada import de `IconoNav`/`Icono` en `components/layout/*` y `features/landing/*` al módulo consolidado
- [x] 2.3 Eliminar `components/ui/IconoNav.tsx` y `features/landing/components/Icono.tsx` una vez migrados todos sus usos
- [x] 2.4 Verificar con `pnpm exec tsc --noEmit` que no queda ningún import roto

## 3. Componentes base (`components/ui/`)

- [x] 3.1 Ajustar `Boton.tsx`: variantes primario (`iris-600` sólido), secundario (borde `tinta-700`), fantasma (`text-tinta-300`, hover `tinta-900`); tamaños, estado `cargando`, slot de ícono
- [x] 3.2 Crear `BotonIcono.tsx` con `aria-label` obligatorio en el tipo de sus props (no opcional)
- [x] 3.3 Ajustar `Input.tsx` a los tokens (`radius-control`, foco `iris-600`)
- [x] 3.4 Crear `Textarea.tsx` con contador de caracteres opcional; migrar `features/entrevista/components/CampoRespuesta.tsx` para usarlo en vez de su `<textarea>` manual
- [x] 3.5 Crear `ControlSegmentado.tsx`; usarlo en `features/seleccion/components/SelectorNivel.tsx` si el patrón encaja (dos opciones excluyentes)
- [x] 3.6 Ajustar `Card.tsx` a `radius-superficie` + `border-tinta-100` sobre `bg-tinta-50`
- [x] 3.7 Crear `Badge.tsx`; migrar el badge de estado de `features/historial/components/ListaEntrevistas.tsx` (hoy `ESTADO_ESTILO` manual) para usarlo
- [x] 3.8 Crear `Divisor.tsx` (1px, `tinta-100` en superficies claras, `tinta-800` en el sidebar)
- [x] 3.9 Crear `Avatar.tsx` con iniciales; migrar el avatar inline de `Sidebar.tsx` para usarlo
- [x] 3.10 Crear `Tooltip.tsx`, accesible por foco además de por hover (lo necesita el sidebar colapsado)
- [x] 3.11 Crear `hooks/useFocusTrap.ts` extrayendo la lógica de Escape/confinamiento/retorno de foco que hoy vive dentro de `components/layout/useCajonNavegacion.ts`; hacer que `useCajonNavegacion` lo consuma en vez de duplicarlo
- [x] 3.12 Crear `Modal.tsx` usando `useFocusTrap`
- [x] 3.13 Crear `EstadoVacio.tsx`; usarlo donde hoy hay un mensaje de "todavía no tienes..." escrito a mano (`HistorialPage`, `RetroalimentacionPage`)
- [x] 3.14 Crear `lib/puntajes.ts` con `NIVEL_POR_BANDA`, `obtenerNivel(banda)` y el contenido movido de `features/resultados/bandas.ts::ESTILO_DE_BANDA`; actualizar los 4 imports existentes (`TablaPuntuaciones`, `PanelCualitativo`, `RepartoPorBandas`, `ListaObservaciones`)
- [x] 3.15 Crear `ChipPuntaje.tsx`: recibe `puntuacion` (para mostrar el número, en `font-mono`) y `banda` (para decidir el color vía `obtenerNivel`); no recibe un número suelto sin banda
- [x] 3.16 Verificar que ninguna prop de los componentes nuevos usa `any`; `pnpm exec tsc --noEmit` limpio

## 4. Sidebar

- [x] 4.1 Crear `hooks/useFocusTrap.ts` ya cubierto en 3.11; aquí solo verificar que `useCajonNavegacion.ts` quedó componiéndolo, no duplicándolo
- [x] 4.2 Crear `components/layout/Sidebar/useSidebar.ts`: centraliza `plegado` (+ el efecto de modo enfoque de la tarea 4.6), `useCajonNavegacion` y `useEntrevistaEnCurso`
- [x] 4.3 Crear `components/layout/Sidebar/SidebarMarca.tsx`: logo + "Entrevistas Técnicas" + "Simulador con IA", oculto al plegar
- [x] 4.4 Crear `components/layout/Sidebar/SidebarAccionPrincipal.tsx`: si hay entrevista en curso, "Continuar · N/5" sólido `iris-600`; si no, "Nueva entrevista" sólido `iris-600`. Ambos casos con el mismo tratamiento — ya no hay una variante ámbar para "continuar"
- [x] 4.5 Crear `components/layout/Sidebar/SidebarNavItem.tsx`: ícono Tabler + etiqueta 14px, divisor de 1px `tinta-800` bajo cada ítem, sin fondo en reposo, hover `tinta-900`, activo `bg-tinta-800` + ícono `iris-400` + texto blanco + barra de 3px `iris-600` a la izquierda + `aria-current="page"`
- [x] 4.6 Añadir a `useSidebar.ts` el efecto de modo enfoque: `useEffect` que colapsa al detectar `pathname` bajo `/entrevista/:id` (ver design.md); verificar los 4 escenarios de `specs/modo-enfoque-entrevista/spec.md`
- [x] 4.7 Crear `components/layout/Sidebar/SidebarPerfil.tsx`: `Avatar` + nombre + correo + "Cerrar sesión" en variante fantasma de `Boton`
- [x] 4.8 Colapsado: franja de 72px, íconos centrados, divisores conservados, acción principal como cuadro `iris`, `Tooltip` con la etiqueta en hover y en foco
- [x] 4.9 Convertir `Sidebar.tsx` en composición de los cinco subcomponentes; verificar que `RutaProtegida.tsx` consume solo `useSidebar()`
- [x] 4.10 Sidebar flotante: `fixed top-3 bottom-3 left-3`, `radius-superficie`, `bg-tinta-950`; ajustar `RutaProtegida.tsx` para que el header cubra solo el área de contenido (ya no todo el ancho) y el contenido tenga el margen correspondiente
- [x] 4.11 Cajón móvil con el mismo estilo flotante (mismo radio, mismo fondo, con su propio margen respecto al viewport)
- [x] 4.12 Transición de ancho de 200ms al plegar/desplegar, con `motion-reduce` respetado (ya establecido en `styles/index.css`)
- [x] 4.13 Actualizar `components/layout/Header.tsx` a 64px, fondo blanco, borde inferior `tinta-100`, título de sección en 18px/600 (hoy 14px/600)
- [x] 4.14 Verificar que `components/layout/titulosDeRuta.ts` seguido usándose sin cambios — el mapa de rutas a título no se toca
- [ ] 4.15 Verificar Escape, clic fuera y devolución de foco en el cajón móvil tras la extracción de `useFocusTrap`
- [ ] 4.16 Verificar navegación completa por teclado del sidebar (expandido, colapsado y en cajón), con foco visible mediante anillo `iris-600`

## 5. Resto del sistema

- [x] 5.1 Landing (`features/landing/`): aplicar tokens nuevos a `HeaderLanding`, `FooterLanding` y las 5 secciones; usar el módulo de iconos consolidado en vez del propio
- [x] 5.2 Auth (`features/auth/`): `LoginPage`, `RegistroPage`, `FormularioLogin`, `FormularioRegistro`, `BotonGoogle` — tokens y componentes base
- [x] 5.3 Selección de área (`features/seleccion/`): `TarjetaArea`, `SelectorNivel`, `SeleccionAreaPage` — usar `Card` en vez de las cajas manuales
- [x] 5.4 Entrevista (`features/entrevista/`): `BurbujaPregunta`, `BarraProgreso`, `ChatEntrevista`, `EntrevistaPage`; contador "03 / 05" en `font-mono`
- [x] 5.5 Resultados (`features/resultados/`): `TarjetaResumen`, `TablaPuntuaciones` con `ChipPuntaje`; crear `ListaRetroalimentacion` con prop `variante` y migrar `PanelCualitativo.tsx` para usarla
- [x] 5.6 Historial (`features/historial/`): `ListaEntrevistas` (con divisores finos entre filas en vez de cajas separadas), `ComparativaAreas`, `GraficoProgreso` (resolver los hex sueltos vía las variables de `@theme`, ver design.md)
- [x] 5.7 Retroalimentación (`features/retroalimentacion/`): `RepartoPorBandas`, `ListaObservaciones`, `RetroalimentacionPage`
- [x] 5.8 Perfil (`features/perfil/`): `PerfilPage` con `Card` y los tokens nuevos
- [x] 5.9 Verificar contraste AA en cada superficie tocada: texto sobre `tinta-50`, texto sobre `tinta-950`, los tres pares semánticos (texto/fondo de `exito`/`progreso`/`error`)

## 6. Documentación y cierre

- [x] 6.1 Crear `docs/arquitectura.md` con la paleta completa, la escala tipográfica, los radios y las reglas ("iris es el único color de acción", "los semánticos nunca van en un botón")
- [x] 6.2 Ejecutar `pnpm exec tsc --noEmit`, `pnpm run lint` y `pnpm run build`; deben terminar sin errores ni warnings nuevos
- [x] 6.3 Buscar clases `slate-*`, `indigo-*`, `amber-*`, `emerald-*`, `sky-*`, `pink-*`, `red-*` y hex sueltos (`#[0-9a-fA-F]{6}`) en `frontend/src` y confirmar que solo quedan los comentarios/variables ya justificados en `GraficoProgreso.tsx`; mostrar el resultado
- [x] 6.4 Listar los componentes creados y las duplicaciones eliminadas (los dos módulos de iconos fundidos en uno, las cajas manuales reemplazadas por `Card`, el badge manual reemplazado por `Badge`)
- [x] 6.5 `git add` + commit en la rama `rediseno-sistema-visual` con un mensaje que describa el rediseño
