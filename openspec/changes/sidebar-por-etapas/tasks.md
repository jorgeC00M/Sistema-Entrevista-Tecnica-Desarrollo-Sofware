## 1. Datos y estado

- [x] 1.1 En `components/layout/destinos.ts`, crear `GrupoDeDestinos` y `GRUPOS_DE_DESTINOS` con "Prepararte" y "Tu progreso" (D1), y eliminar `DESTINOS`, `destinoEntrevistaEnCurso` y `destinoResultados`.
- [x] 1.2 En `useDestinosDisponibles.ts`, `useSidebar.ts` y `RutaProtegida.tsx`, quitar `ultimaFinalizada` y `EntrevistaFinalizada`, conservando `enCurso` (D4). Valorar renombrar el hook si su nombre deja de describirlo.

## 2. Componentes

- [x] 2.1 En `Sidebar.tsx`, pintar los grupos dentro del `nav`: `h2` con `id` y `ul aria-labelledby`; plegado, un `Divisor` y el rótulo `sr-only` (D2). Quitar la prop `ultimaFinalizada`.
- [x] 2.2 En `SidebarPerfil.tsx`, convertir el bloque de usuario en `NavLink` a `/perfil`:
  - activo, hover y foco iguales a los ítems;
  - un chevron decorativo;
  - plegado, el avatar con `Tooltip` "Mi perfil" y un área táctil de 44 px o más;
  - `onNavegar` para cerrar el cajón (D3).

  "Cerrar sesión" no cambia.
- [x] 2.3 Verificar que `grep -rnE "ultimaFinalizada|destinoResultados|destinoEntrevistaEnCurso|EntrevistaFinalizada" frontend/src` no da resultados. Ejecutar `pnpm exec tsc --noEmit`, `pnpm test` (incluida la guarda de estilos), `pnpm run lint` (sin avisos nuevos) y `pnpm run build`, todos en verde.

## 3. Documentación y prueba manual

- [x] 3.1 Actualizar `CLAUDE.md` (sección del shell autenticado y la referencia a `destinos.ts`): los grupos por etapa, el perfil desde el bloque de usuario y que ya no hay destinos condicionales en la lista.
- [ ] 3.2 Prueba manual que cubra:
  - escritorio desplegado y plegado, tablet (barra de iconos) y móvil (cajón);
  - los rótulos y los separadores;
  - el bloque de usuario lleva a Mi perfil, queda activo allí y cierra el cajón en móvil;
  - "Continuar" aparece solo con una entrevista a medias;
  - solo teclado, con los tooltips en la barra plegada.

  Si no se puede ejecutar, queda **sin marcar**.
