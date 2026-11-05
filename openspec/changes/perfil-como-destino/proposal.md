## Why

Hoy al perfil solo se llega por el bloque del pie del sidebar: avatar, nombre y correo. Ese bloque es un enlace a `/perfil`, pero no dice «perfil» en ningún lado, y Jorge ve que para el usuario queda oculto. `sidebar-por-etapas` había quitado el destino «Mi perfil» porque duplicaba ese bloque. Ahora se resuelve al revés: el destino vuelve y el bloque deja de ser enlace, así que sigue habiendo un solo camino al perfil.

## What Changes

- **Destino nuevo.** Un tercer grupo en el menú, **«Tu cuenta»**, con **«Mi perfil»** (`/perfil`, ícono `usuario`), debajo de «Tu progreso». Se comporta como los demás destinos: se marca como actual en `/perfil`, muestra un tooltip con el menú plegado y aparece en el cajón de celular y en el riel de tablet.
- **El pie es solo información.** El bloque con avatar, nombre y correo deja de ser enlace: sin chevron, sin estilo de hover y sin foco. Plegado muestra solo el avatar, con el nombre en un tooltip. «Cerrar sesión» no cambia.
- **Limpieza.** Si `onNavegar` de `SidebarPerfil` queda sin uso, se quita, junto con el paso que lo pasaba desde `Sidebar`.

## Capabilities

### New Capabilities
- `perfil-en-el-menu`: el perfil es un destino visible del menú, y el pie del sidebar solo informa quién inició sesión.

### Modified Capabilities
- (ninguna en specs principales; se anota la delta sin archivar `sidebar-por-etapas`, que dice que el perfil se alcanza desde el bloque de usuario)

## Impact

- **Frontend:**
  - `components/layout/destinos.ts`;
  - `components/layout/Sidebar/SidebarPerfil.tsx`;
  - `components/layout/Sidebar/Sidebar.tsx` (solo si se quita `onNavegar`).
- **Documentación:** el párrafo del sidebar en `CLAUDE.md`.
- **Sin cambios:** el backend, las rutas, `titulosDeRuta.ts` (ya tiene `/perfil`) y la página «Mi perfil».
