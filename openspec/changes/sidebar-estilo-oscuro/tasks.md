## 1. Icono de marca y mapa de títulos

- [x] 1.1 Añadir el trazo `marca` a `components/ui/IconoNav.tsx`, reutilizando el mismo path que `features/landing/components/Icono.tsx::marca` para que la marca se vea igual en la landing y en la aplicación
- [x] 1.2 Crear `components/layout/titulosDeRuta.ts` con un título y subtítulo por cada una de las seis rutas protegidas (`/nueva-entrevista`, `/entrevista/:id`, `/entrevista/:id/resultados`, `/historial`, `/retroalimentacion`, `/perfil`), resueltas con `matchPath` de react-router-dom, más un título por defecto para cualquier ruta no listada
- [x] 1.3 Verificar con `pnpm exec tsc --noEmit` que compila

## 2. Sidebar en tema oscuro

- [x] 2.1 Cambiar el fondo del sidebar y del cajón en `router/RutaProtegida.tsx` de `bg-white` a `bg-slate-900`, y el borde de `border-slate-200` a `border-slate-800`
- [x] 2.2 Añadir el bloque de marca en `Sidebar.tsx`: caja indigo con el icono, "Entrevistas Técnicas" y "Simulador con IA" como segunda línea; ocultar el bloque de texto al plegar, dejando solo el icono
- [x] 2.3 Cambiar el destino activo de `bg-indigo-50 text-indigo-700` + barra `before:` a `bg-indigo-600 text-white`, sin la barra; los inactivos pasan a `text-slate-300` con `hover:bg-slate-800 hover:text-white`
- [x] 2.4 Ajustar el color de los iconos de navegación: `text-slate-400` en reposo, blanco cuando el destino está activo
- [x] 2.5 Ajustar el botón "Nueva entrevista", el bloque de perfil, el botón "Cerrar sesión" y el botón de plegado a los nuevos tokens oscuros, conservando sus estados de foco visibles
- [x] 2.6 Verificar que `aria-current="page"` se sigue aplicando al destino activo, ahora sin la barra lateral

## 3. Aviso de entrevista en curso

- [x] 3.1 Ajustar `ContinuarEntrevista.tsx` a `bg-amber-500/10 text-amber-300 ring-amber-500/30`, conservando el icono y el texto sin cambios

## 4. Encabezado con nombre de sección

- [x] 4.1 Quitar de `Header.tsx` el enlace con el nombre genérico de la aplicación
- [x] 4.2 Mostrar el título y el subtítulo de `titulosDeRuta.ts` según la ruta actual, resuelta con `useLocation`
- [x] 4.3 Verificar que cada una de las seis rutas protegidas muestra su propio título, y que una ruta no listada muestra el título por defecto en lugar de quedar vacía

## 5. Cierre y verificación

- [x] 5.1 Verificar el contraste a 4,5:1 del texto del sidebar sobre `slate-900`, en estado normal, hover y activo
- [x] 5.2 Verificar el contraste del texto `amber-300` de `ContinuarEntrevista` sobre su nuevo fondo
- [ ] 5.3 Verificar el foco visible al tabular por el sidebar y el header en el tema nuevo
- [ ] 5.4 Verificar los cuatro anchos (375, 768, 1024, 1440 px) con el sidebar oscuro, en escritorio, plegado y en el cajón
- [x] 5.5 Ejecutar `pnpm exec tsc --noEmit`, `pnpm run lint` y `pnpm run build` y verificar que los tres terminan sin errores
- [x] 5.6 Actualizar la sección de frontend de `CLAUDE.md` con la paleta oscura del sidebar y el mapa de títulos del header
