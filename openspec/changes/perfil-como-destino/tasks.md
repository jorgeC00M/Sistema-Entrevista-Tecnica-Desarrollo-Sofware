## 1. Menú

- [x] 1.1 En `destinos.ts`, agregar el grupo «Tu cuenta» con «Mi perfil» (`/perfil`, `usuario`) después de «Tu progreso», y reescribir el docstring de `GRUPOS_DE_DESTINOS`.

## 2. Pie del sidebar

- [x] 2.1 En `SidebarPerfil.tsx`, el bloque del usuario pasa de `NavLink` a `div`:
  - avatar, nombre y correo;
  - sin chevron, sin `clasesDeEnlace` y sin el `sr-only` de sección actual;
  - plegado: solo el avatar en un `Tooltip` con el nombre (su texto ya queda en el DOM, sin `sr-only` aparte);
  - reescribir el docstring.
- [x] 2.2 Quitar la prop `onNavegar` de `SidebarPerfil` y su paso en `Sidebar.tsx`, junto con los imports que queden sin uso (`NavLink`, `clasesDeEnlace`, `Icono`).

## 3. Documentación y verificación

- [x] 3.1 En `CLAUDE.md`, en el párrafo del sidebar: el grupo «Tu cuenta» con «Mi perfil», el pie solo informativo, y quitar «"Mi perfil" duplicated the user block» y que el bloque «**is** the link to `/perfil`».
- [x] 3.2 Anotar en la delta sin archivar `sidebar-por-etapas` que `perfil-como-destino` volvió a poner «Mi perfil» como destino y dejó el bloque del pie como solo información.
- [x] 3.3 Hacer dos `grep` en `frontend/src`:
  - `to="/perfil"`: solo debe quedar en `destinos.ts` (vía `ruta`) y en ningún componente del pie;
  - `onNavegar` en `SidebarPerfil`: no debe quedar nada.
- [x] 3.4 Ejecutar `pnpm exec tsc --noEmit`, `pnpm test` (con `estilos.test.ts`), `pnpm run lint` (deben quedar 5 advertencias) y `pnpm run build`.
- [x] 3.5 Ejecutar `openspec validate perfil-como-destino`.

## 4. Cierre (lo hace Jorge)

- [ ] 4.1 Pruebas manuales:
  - el sidebar desplegado, plegado (con el tooltip), en el riel de tablet y en el cajón de celular (que se cierre al elegir «Mi perfil»);
  - recorrerlo con Tab: el nombre no recibe foco;
  - en 1366×768, que el pie y «Cerrar sesión» sigan a la vista.
- [ ] 4.2 Si la tesis describe el menú, agregar «Tu cuenta / Mi perfil».
- [ ] 4.3 No hacer commit; lo hace Jorge.
