## Context

- **`components/layout/destinos.ts`** define `GRUPOS_DE_DESTINOS` («Prepararte» y «Tu progreso»). Lo pintan tanto la barra fija como el cajón de celular (`Sidebar.tsx`), con `SidebarNavItem`: un `NavLink` con `end` o `prefijo`, un tooltip cuando está plegado y `onNavegar` para cerrar el cajón.
- **`SidebarPerfil.tsx`** es el pie del sidebar:
  - un `NavLink` a `/perfil` con `Avatar`, nombre, correo y un chevron, con `clasesDeEnlace`, envuelto en un `Tooltip` «Mi perfil» cuando está plegado;
  - el botón «Cerrar sesión»;
  - recibe `onNavegar` del `Sidebar` solo para cerrar el cajón al ir al perfil.
- **`sidebar-por-etapas`** había quitado «Mi perfil» de la lista porque duplicaba ese bloque.

## Goals / Non-Goals

**Goals:** que el perfil se vea como un botón más del menú y que siga habiendo un solo camino a él.

**Non-Goals:**
- rediseñar el pie o la página «Mi perfil»;
- mover «Cerrar sesión»;
- tocar rutas o títulos.

## Decisions

- **Grupo «Tu cuenta».** Va como tercera entrada de `GRUPOS_DE_DESTINOS`: `{ titulo: 'Tu cuenta', destinos: [{ ruta: '/perfil', etiqueta: 'Mi perfil', icono: 'usuario' }] }`. Sin `prefijo`, porque `/perfil` no tiene subrutas. Al reutilizar `SidebarNavItem`, el destino queda igual que los demás en las tres anchuras sin código nuevo: estado actual, tooltip, 44 px de área táctil plegado y cierre del cajón.
- **El pie pasa de `NavLink` a `div`.**
  - Dentro van `Avatar`, el nombre (`text-sm font-medium text-white`) y el correo (`text-xs text-vidrio-sidebar-muted`), con el mismo relleno que tenía.
  - Se quitan el chevron, `clasesDeEnlace` y el `sr-only` «(sección actual)».
  - Plegado queda solo el avatar dentro de `Tooltip` con el nombre. El envoltorio no recibe foco (sin `tabIndex`), así que el tooltip aparece al pasar el cursor. Al aplicar se vio que `Tooltip` deja su texto en el DOM: el lector de pantalla ya lee el nombre, y un `sr-only` aparte lo leería dos veces, así que no se agrega.
- **`onNavegar` de `SidebarPerfil`.** Ya no hay navegación en el pie, así que se quita la prop y su paso en `Sidebar.tsx`. El cajón ya se cierra por el `onNavegar` de `SidebarNavItem`.
- **Comentarios.** Se reescriben el docstring de `GRUPOS_DE_DESTINOS` (hoy dice que «al perfil desde el bloque de usuario») y el de `SidebarPerfil`.

## Risks / Trade-offs

- **[Un grupo más alarga el sidebar en pantallas bajas]** → Son unos 70 px (rótulo + destino). Al aplicar hay que comprobar en 1366×768 y en el cajón que el pie y «Cerrar sesión» siguen a la vista. Si no entran, se le da scroll propio a la lista de destinos, en vez de recortar el pie.
- **[Hay usuarios acostumbrados a pulsar su nombre]** → El nombre ya no responde, pero «Mi perfil» queda justo encima, en el mismo panel.

## Migration Plan

Sin migración de datos. Para revertir se restaura el `NavLink` del pie y se quita el grupo.
