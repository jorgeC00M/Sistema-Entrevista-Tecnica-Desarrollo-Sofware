## 1. Shell y sidebar

- [x] 1.1 Crear `frontend/src/hooks/useMediaQuery.ts` con `useSyncExternalStore` sobre `matchMedia` (D3). Se verifica con `tsc` sin errores.
- [x] 1.2 En `router/RutaProtegida.tsx` (D1, D3):
  - el contenedor `max-w-7xl` sin `mx-auto` alrededor del `Outlet`;
  - el `aside` en `hidden md:block` con `plegadoEfectivo`;
  - el padding `md:pl-[72px]` / `lg:pl-64`;
  - el cajón y el velo en `md:hidden`, cerrándose al pasar a `md`;
  - `onAlternarPlegado` solo en escritorio;
  - actualizar el comentario "Sin max-w aquí".
- [x] 1.3 En `Header.tsx`: ☰ en `md:hidden`. En `SidebarMarca.tsx`, sin botón de plegar cuando no recibe `onAlternarPlegado`. Revisar que los ítems plegados midan 44 px o más. Se verifica con `tsc` sin errores.

## 2. Pantallas

- [x] 2.1 Quitar `mx-auto max-w-*` de las 7 páginas y aplicar los límites de lectura de D2: la tarjeta de selección y el chat en `max-w-3xl`, las introducciones en `max-w-prose`. Se verifica con `grep -rn "mx-auto max-w-" frontend/src/features/*/pages`, que no debe dar resultados fuera de `landing` y `auth`.
- [x] 2.2 Aplicar la distribución de D4:
  - Perfil en 2 columnas;
  - la entrada del CV en 2 columnas;
  - Retroalimentación 1 + 2;
  - los botones finales de Resultados apilados en móvil;
  - el chat con `100dvh`.
- [x] 2.3 Corregir los desbordes de texto de D5: `ListaEntrevistas`, `HistorialDeAnalisis`, `ZonaDeArchivo`, el correo en Perfil y el pie de `ModalDeConfirmacion`. Revisar con `grep` cada `justify-between` sin `min-w-0` de las pantallas del shell.

## 3. Verificación y documentación

- [x] 3.1 Ejecutar `pnpm exec tsc --noEmit`, `pnpm test` (incluida la guarda de estilos), `pnpm run lint` (sin avisos nuevos) y `pnpm run build`, todos en verde.
- [x] 3.2 Actualizar en `CLAUDE.md` la sección del shell autenticado: el contenedor único alineado a la izquierda, los tres tamaños del sidebar y la regla del ancho de lectura. Se verifica con `grep -n "max-w-7xl" CLAUDE.md`.
- [ ] 3.3 Prueba manual con DevTools a 320, 375, 768, 1024 y 1440 px en Nueva entrevista, Revisar mi CV, Historial, Retroalimentación, Mi perfil, Entrevista en curso y Resultados. Debe cubrir:
  - sin scroll horizontal;
  - el sidebar correcto por tamaño;
  - el cajón se cierra al ensanchar;
  - tooltips y navegación con teclado en la barra de iconos;
  - el modal de inicio a 320 px;
  - responder en móvil con el campo visible;
  - todas las funciones operables.

  Si no se puede ejecutar, queda **sin marcar**.
