## Why

El sidebar muestra los destinos en una lista plana con tres duplicados:
- **"Entrevista en curso"** lleva al mismo sitio que el botón "Continuar · 3/5".
- **"Resultados"** abre solo el último reporte, que ya se encuentra en "Historial y progreso".
- **"Mi perfil"** aparece como ítem mientras el bloque de usuario de abajo (avatar, nombre y correo) no enlaza a nada.

Además, el orden no sigue el recorrido del estudiante: preparar el CV, practicar y revisar el progreso. Más opciones que no aportan hacen más lento encontrar las que sí.

## What Changes

- **Destinos agrupados por etapa**, cada grupo con un rótulo pequeño:
  - **PREPARARTE:** "Revisar mi CV".
  - **TU PROGRESO:** "Historial y progreso" y "Retroalimentación".

  El botón principal ("Nueva entrevista", más "Continuar · n/5" si hay una entrevista a medias) sigue arriba como la acción de practicar. Con el sidebar plegado, cada rótulo se reemplaza por una línea separadora.
- **Se quitan "Entrevista en curso" y "Resultados"** (**BREAKING** para la navegación). Se llega a esas pantallas desde "Continuar" y desde "Historial y progreso"; las rutas siguen existiendo.
- **Se quita el ítem "Mi perfil".** El bloque de usuario pasa a ser el enlace a Mi perfil y se marca como activo en esa pantalla. Plegado, es el avatar con el tooltip "Mi perfil".
- **Código muerto:** `destinoEntrevistaEnCurso`, `destinoResultados`, `ultimaFinalizada` y `EntrevistaFinalizada`.

## Capabilities

### New Capabilities
- `sidebar-por-etapas`: qué destinos ofrece el sidebar, cómo se agrupan y cómo se llega al perfil.

### Modified Capabilities
- Ninguna con spec archivado.

## Impact

- **Frontend:**
  - `components/layout/destinos.ts` y `components/layout/useDestinosDisponibles.ts`;
  - `components/layout/Sidebar/{Sidebar.tsx, SidebarPerfil.tsx, useSidebar.ts}`;
  - `router/RutaProtegida.tsx`.
- **Documentación:** `CLAUDE.md`, en la sección del shell autenticado.
- **Sin cambios:** backend, rutas, títulos de la cabecera y el comportamiento por tamaño de pantalla.
