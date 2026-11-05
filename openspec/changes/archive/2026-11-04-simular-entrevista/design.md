## Context

`/nueva-entrevista` (`SeleccionPuestoPage`) es la pantalla de inicio de quien tiene sesión (`EntradaRaiz`). Un `grep` en `frontend/src` encuentra la ruta en 7 archivos:
- `router/index.tsx` (la `Route`);
- `EntradaRaiz.tsx` (el `Navigate`);
- `SidebarMarca.tsx` y `SidebarAccionPrincipal.tsx` (los `to`);
- `titulosDeRuta.ts` (el patrón);
- `PlanDeMejora.tsx` y `curriculum/practica.ts` (con `?puesto=&nivel=`);
- `HistorialPage.tsx` (el estado vacío).

El texto «Nueva entrevista» aparece además en el botón, su tooltip, el título del encabezado y en comentarios. Ningún test del frontend ni del backend usa la ruta, y el backend no la conoce.

## Goals / Non-Goals

**Goals:** el nombre y la ruta nuevos en todo el código y en la documentación viva, sin dejar un enlace roto.

**Non-Goals:**
- renombrar `features/seleccion/` o `SeleccionPuestoPage` (son nombres internos de dominio, no visibles);
- cambiar el `h1` «Configura tu entrevista» o el subtítulo del encabezado;
- reescribir los cambios OpenSpec anteriores;
- editar la tesis (la actualiza Jorge).

## Decisions

- **Ruta `/simular-entrevista`, sin redirección.** Lo decidió Jorge: la antigua queda reemplazada. No hace falta redirigir para no romper la app:
  - todos los enlaces internos se cambian;
  - un marcador viejo cae en `path="*"` → `/` → `EntradaRaiz` → `/simular-entrevista`.

  Se pierde solo el `?puesto=&nivel=` de un enlace antiguo, y la app todavía no se publicó con esa ruta en enlaces externos.
- **Texto visible:** «Simular entrevista», en tipo oración como el resto del menú («Revisar mi CV», «Historial y progreso»).
- **Nombres internos:** `botonNuevaEntrevista` pasa a `botonSimularEntrevista`. El resto no lleva el nombre de la pantalla.
- **Comentarios y docstrings** que nombran la pantalla («la pantalla de nueva entrevista», «las mismas de «Nueva entrevista»») pasan a «Simular entrevista». `datos.py` cita el prototipo `nueva-entrevista.html`, un archivo real, y se deja.
- **Documentación viva:** `CLAUDE.md` (sus 5 menciones), `DESIGN.md` (la barra lateral) y el título del escenario de `openspec/specs/catalogo-de-puestos/spec.md`.
- **Verificación de que nada se rompe:**
  - un `grep` final de `nueva-entrevista|Nueva entrevista|NuevaEntrevista` en `frontend/src` y `backend`. Solo debe quedar la cita de `datos.py`;
  - `tsc`, `pnpm test` (con `estilos.test.ts`), lint (5 advertencias) y build;
  - la suite del backend, que solo cambia docstrings.

## Risks / Trade-offs

- **[Un marcador viejo pierde el puesto y el nivel preseleccionados]** → Es lo que Jorge eligió. El usuario igual llega a la pantalla.
- **[Un enlace escrito a mano se escapa del `grep`]** → El `grep` cubre las tres variantes del nombre. Además, la ruta comodín evita una pantalla en blanco.
- **[La tesis dice «Nueva Entrevista»]** → En `proposal.md` están listadas las líneas para que Jorge las cambie.

## Migration Plan

No hay migración de datos. Para revertir se recupera la ruta en los 7 archivos.
