## 1. Ruta

- [x] 1.1 En `router/index.tsx`, la `Route` `/nueva-entrevista` pasa a `/simular-entrevista`, sin redirección para la antigua.
- [x] 1.2 Cambiar el destino en:
  - `EntradaRaiz.tsx`;
  - `SidebarMarca.tsx` y `SidebarAccionPrincipal.tsx`;
  - `titulosDeRuta.ts` (el patrón);
  - `PlanDeMejora.tsx` (el «Practicar» con `?puesto=&nivel=`);
  - `features/curriculum/practica.ts` (con y sin puesto);
  - `HistorialPage.tsx` (estado vacío).

## 2. Nombre visible y comentarios

- [x] 2.1 En `SidebarAccionPrincipal.tsx`, el texto, el `title` y el `Tooltip` dicen «Simular entrevista». `botonNuevaEntrevista` pasa a `botonSimularEntrevista`.
- [x] 2.2 En `titulosDeRuta.ts`, el título pasa a «Simular entrevista» y el subtítulo no cambia.
- [x] 2.3 Comentarios del frontend:
  - `api/catalogos.ts` (2);
  - `features/seleccion/seleccion.ts`;
  - `SeleccionPuestoPage.tsx`;
  - `components/ui/EtiquetaConvocatoria.tsx`;
  - `features/curriculum/components/EntradaDelAnalisis.tsx`.
- [x] 2.4 Docstrings del backend: `apps/catalogos/views.py`, `apps/catalogos/tests/test_puestos.py` y `apps/common/archivos.py`. No se toca `datos.py`, que cita el archivo `nueva-entrevista.html`.

## 3. Documentación y verificación

- [x] 3.1 Actualizar al nombre y la ruta nuevos:
  - `CLAUDE.md` (todas sus menciones);
  - `DESIGN.md` (la barra lateral);
  - el título del escenario de `openspec/specs/catalogo-de-puestos/spec.md`.
- [x] 3.2 `grep` de `nueva-entrevista|Nueva entrevista|NuevaEntrevista` (sin distinguir mayúsculas) en `frontend/src` y `backend`. Solo debe quedar la cita de `datos.py`.
- [x] 3.3 Ejecutar `pnpm exec tsc --noEmit`, `pnpm test`, `pnpm run lint` (deben quedar 5 advertencias) y `pnpm run build`.
- [x] 3.4 Ejecutar la suite del backend (`manage.py test --noinput`).
- [x] 3.5 Ejecutar `openspec validate simular-entrevista`.

## 4. Cierre (lo hace Jorge)

- [ ] 4.1 Pruebas manuales:
  - entrar con sesión desde `/`;
  - el botón del sidebar desplegado, plegado y en el riel de tablet;
  - «Practicar» desde el reporte y desde el CV, con el puesto y el nivel preseleccionados;
  - «Empieza la primera» con el historial vacío;
  - abrir `/nueva-entrevista` y llegar a `/simular-entrevista`.
- [ ] 4.2 Tesis: cambiar «Nueva Entrevista» en las líneas 168, 170, 218, 220, 994, 998, 1006, 1008, 1012, 1019 y 1046.
- [ ] 4.3 No hacer commit; lo hace Jorge.
