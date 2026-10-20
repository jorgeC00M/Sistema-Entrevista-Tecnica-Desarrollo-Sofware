## Context

`RutaProtegida` renderiza:
- el `aside` fijo (`hidden lg:block`, `w-64` o `w-[72px]` según `plegado`);
- el cajón (`role="dialog"`, solo mientras está abierto, `lg:hidden`);
- un contenedor con `lg:pl-64` / `lg:pl-[72px]`, que lleva `Header` y `main px-4 py-6 sm:px-6 lg:px-8`. Un comentario explica que cada página elige su ancho.

Hoy cada página se envuelve en `mx-auto max-w-{2xl,3xl,4xl,5xl}`. `Sidebar` ya sabe plegarse:
- `SidebarNavItem` y `SidebarAccionPrincipal` usan `Tooltip` cuando `plegado`;
- `SidebarMarca` tiene el botón de plegar;
- `useSidebar` guarda `plegado` y el estado del cajón.

`Header` muestra ☰ con `lg:hidden`. `EntrevistaPage` usa `h-[calc(100vh-8rem)]`. No hay `<table>` en la app. Ver proposal.md.

## Goals / Non-Goals

**Goals:**
- Un solo lugar que decide el ancho del contenido.
- Un sidebar con tres comportamientos según el tamaño.
- Cero scroll horizontal entre 320 y 1440 px.
- Las funciones intactas.

**Non-Goals:**
- Rediseñar el contenido de cada pantalla, cambiar textos o tokens, o tocar la landing, el login o el backend.
- Añadir pruebas de componentes. El proyecto no las tiene; la verificación visual es manual.

## Decisions

### D1. El contenedor vive en el shell, no en cada página
`main` envuelve el `Outlet` en `<div className="max-w-7xl">` (1280 px, **sin** `mx-auto`). Las páginas quitan su `mx-auto max-w-*` y conservan solo su espaciado vertical (`space-y-6`, etc.).
- **Por qué en el shell:** una sola regla en vez de siete anchos distintos; cada página nueva la hereda.
- **Por qué sin `mx-auto`:** el usuario aprobó "pegado al sidebar". En monitores de más de 1280 px + sidebar, el espacio sobrante queda a la derecha, no repartido a ambos lados.

### D2. Ancho de lectura dentro del contenedor
Lo que no debe estirarse lleva su propio límite, sin centrar:
- la tarjeta del formulario de selección: `max-w-3xl`;
- el chat: `max-w-3xl`;
- los párrafos de introducción: `max-w-prose`.

Todo queda alineado a la izquierda con el título.

### D3. Sidebar por tamaño, con un hook de media query
- **`hooks/useMediaQuery.ts`:** `useSyncExternalStore` sobre `window.matchMedia(q)`. Se suscribe a `change`, y devuelve `false` en el snapshot de servidor, que no se usa pero cumple la firma.
- **En `RutaProtegida`:**
  - `esEscritorio = useMediaQuery('(min-width: 1024px)')` y `plegadoEfectivo = plegado || !esEscritorio`;
  - el `aside` pasa a `hidden md:block`, con ancho `w-[72px]` si `plegadoEfectivo`, si no `w-64`;
  - el padding del contenido pasa a `md:pl-[72px]`, más `lg:pl-64` cuando no está plegado.
- **Sin botón de plegar fuera de escritorio:** `Sidebar` recibe `onAlternarPlegado` solo si `esEscritorio`, y `SidebarMarca` no lo renderiza sin él (se verifica; si hoy lo exige, la prop pasa a opcional).
- **El cajón se cierra al pasar a `md`:**
  - un `useMediaQuery('(min-width: 768px)')` cierra el cajón con `cerrar()` cuando cambia a `true`, desde el handler del `change` o un efecto mínimo;
  - las clases del cajón y del velo pasan de `lg:hidden` a `md:hidden`;
  - el botón ☰ de `Header` pasa a `md:hidden`.
- **Por qué no solo CSS:** el contenido del sidebar (etiquetas o tooltips) depende de la prop `plegado`, no de clases.
- **Por qué siempre plegado en tablet:** a 768 px, un sidebar de 256 px dejaría 512 px de contenido.

### D4. Distribución por pantalla
- **Perfil:** `dl` en `grid sm:grid-cols-2 gap-3`, con cada dato en su propia `Tarjeta` y la etiqueta sobre el valor.
- **CV:** `CampoConvocatoria` y `SubirArchivo` dentro de `grid gap-6 lg:grid-cols-2 lg:items-start`; el resto queda a todo el ancho.
- **Retroalimentación:** `grid gap-6 lg:grid-cols-3`, con `RepartoPorBandas` en una columna y `ListaObservaciones` en `lg:col-span-2`.
- **Historial:** sin cambios de rejilla.
- **Resultados:**
  - la cabecera ya hace `flex-wrap`;
  - los botones finales pasan a `flex flex-col gap-3 sm:flex-row sm:justify-end`, y cada `Link` es `w-full sm:w-auto` (sumado a `clasesDeBoton` con `className`).
- **Selección:** la cabecera (título + "Repetir última") a todo el ancho; la tarjeta del formulario en `max-w-3xl`.
- **Entrevista:** `max-w-3xl` y `h-[calc(100dvh-8rem)]`.

### D5. Desbordes de texto
- **`ListaEntrevistas`:** la fila pasa a `flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between`, el bloque de texto a `min-w-0` y el título a `break-words`.
- **`HistorialDeAnalisis` y `ZonaDeArchivo`:** el nombre de archivo lleva `min-w-0 truncate`, con `title` para verlo completo.
- **Perfil:** el correo usa `break-all`.
- **`ModalDeConfirmacion`:** el pie usa `flex flex-col-reverse gap-2 sm:flex-row sm:justify-end` (en móvil la acción principal queda arriba) y cada botón ocupa todo el ancho en móvil.
- **Auditoría:** durante la tarea se buscan con `grep` los `flex … justify-between` sin `min-w-0` en las pantallas del shell, y se corrige cada uno que pueda contener texto variable.

## Risks / Trade-offs

- [El sidebar se adelanta a 768 px y algunas pantallas quedan con menos ancho en tablet] → son 72 px; el contenido de 696 px a 768 px sigue en una columna, como en móvil.
- [`useMediaQuery` añade estado de layout en JS] → se usa `useSyncExternalStore`, sin `setState` en efectos, para no sumar avisos de lint.
- [Monitores muy anchos dejan espacio a la derecha] → aceptado al elegir alinear a la izquierda; el contenido no se estira más allá de lo legible.
- [Sin pruebas automáticas de layout] → la prueba manual en 5 anchos y 7 pantallas queda como tarea explícita y se marca solo si se ejecuta.

## Ajustes al implementar

- **Selección:** la cabecera ("Configura tu entrevista" y "Repetir última") también queda en `max-w-3xl`, no a todo el ancho. Con el título a 1280 px, "Repetir última" quedaba lejos del formulario al que rellena; así ambos se alinean con el borde derecho de la tarjeta.
- **`ModalDeConfirmacion`:** no hubo que tocarlo; el pie de `Modal` ya hacía `flex-col-reverse … sm:flex-row`. En cambio, `.modal` ganó `max-height: calc(100dvh - 2rem)` y desplazamiento interno, porque con `overflow: hidden` un móvil apaisado cortaba los botones.
