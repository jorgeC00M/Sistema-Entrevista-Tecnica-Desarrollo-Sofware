## Why

«Nueva entrevista» solo dice que ya hubo otras. «Simular entrevista» es un verbo, dice lo que el usuario va a hacer y coincide con el título de la tesis («sistema web de **simulación** de entrevistas técnicas»). Jorge pidió cambiar también la ruta y todas las partes donde aparece, sin romper nada.

## What Changes

- El botón principal del sidebar y su tooltip (plegado) dicen «Simular entrevista».
- El encabezado de esa pantalla dice «Simular entrevista». El `h1` «Configura tu entrevista» no cambia.
- **BREAKING (solo URL):** la pantalla pasa de `/nueva-entrevista` a `/simular-entrevista`. La ruta antigua se **elimina**, sin redirección: Jorge lo decidió porque queda reemplazada. Un marcador viejo cae en la ruta comodín, que lleva a `/`, y de ahí `EntradaRaiz` manda al usuario con sesión a `/simular-entrevista`. Solo se pierde el `?puesto=&nivel=` de un enlace antiguo.
- Los 7 sitios del frontend que enlazan a la ruta pasan a la nueva:
  - el router;
  - `EntradaRaiz`;
  - `SidebarMarca` y `SidebarAccionPrincipal`;
  - `titulosDeRuta`;
  - el «Practicar» del Plan de mejora;
  - `destinoDePractica` del CV;
  - el estado vacío del historial.
- Los comentarios y docstrings que nombran la pantalla, en el frontend y en el backend, pasan a «Simular entrevista». La variable `botonNuevaEntrevista` pasa a `botonSimularEntrevista`.
- `CLAUDE.md`, `DESIGN.md` y el escenario de la spec principal `catalogo-de-puestos` usan el nombre nuevo.

## Capabilities

### New Capabilities
- `simular-entrevista`: el nombre visible y la ruta de la pantalla donde se configura y empieza una entrevista.

### Modified Capabilities
- (ninguna en requisitos; en `catalogo-de-puestos` solo se renombra el título de un escenario)

## Impact

- **Frontend:** `router/index.tsx`, `features/landing/pages/EntradaRaiz.tsx`, `components/layout/Sidebar/{SidebarMarca,SidebarAccionPrincipal}.tsx`, `components/layout/titulosDeRuta.ts`, `features/resultados/components/PlanDeMejora.tsx`, `features/curriculum/practica.ts`, `features/historial/pages/HistorialPage.tsx`, y comentarios en `api/catalogos.ts`, `features/seleccion/{seleccion.ts,pages/SeleccionPuestoPage.tsx}`, `components/ui/EtiquetaConvocatoria.tsx` y `features/curriculum/components/EntradaDelAnalisis.tsx`.
- **Backend:** solo docstrings (`apps/catalogos/views.py`, `apps/catalogos/tests/test_puestos.py`, `apps/common/archivos.py`). No cambian la API, los modelos ni las migraciones.
- **No cambian:** la carpeta `features/seleccion/`, `SeleccionPuestoPage`, la API ni los cambios OpenSpec ya escritos, que son registro histórico. `datos.py` nombra el archivo del prototipo `nueva-entrevista.html`: es un nombre de archivo real y se deja.
- **Tesis (lo hace Jorge):** líneas 168, 170, 218, 220, 994, 998, 1006, 1008, 1012 y 1019 («Formulario de Nueva Entrevista» → «Formulario de Simular Entrevista»), y la 1046 («Abre una nueva entrevista…»).
