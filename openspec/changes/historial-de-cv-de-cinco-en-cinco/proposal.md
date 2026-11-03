## Why

La tabla «Historial de análisis» de «Revisar mi CV» ya se pagina igual que «Historial y progreso», pero de a 10. La paginación solo aparece con más de 10 análisis, así que Jorge no la ve. Además, la tabla está debajo del formulario, y 10 filas la hacen larga. Jorge aprobó pasar a 5 filas por página.

## What Changes

- **5 filas por página.** La tabla del CV muestra 5 filas por página en vez de 10. Con 6 o más análisis aparece «‹ 1 2 ›», con el mismo componente y el mismo comportamiento que en Historial:
  - la página queda en `?pagina=`;
  - al cambiar de página, el foco va a la tabla;
  - con una sola página, la paginación no se muestra.
- **«Historial y progreso» no cambia:** sigue mostrando 10 filas por página.

## Capabilities

### New Capabilities
- `revision-de-cv`: el tamaño de página de la tabla del historial de análisis. La capacidad aún no tiene spec principal, así que esta delta es ADDED, igual que en los cambios anteriores.

### Modified Capabilities

## Impact

- **Frontend:** `features/curriculum/components/HistorialDeAnalisis.tsx` (`POR_PAGINA`). La lógica es la de `hooks/usePaginaEnLaUrl` y `components/ui/Paginacion`, sin cambios.
- **Specs:** la delta de `tipo-de-analisis-e-historial-en-tabla`, todavía sin archivar, dice «de a 10». Hay que ajustarla para que no contradiga este cambio.
- **Documentación:** `CLAUDE.md`.
- **Sin cambios** en el backend ni en el API.
