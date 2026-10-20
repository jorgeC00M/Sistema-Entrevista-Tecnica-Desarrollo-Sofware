## Context

- **`destinos.ts`** exporta `DESTINOS` (CV, Historial, Retroalimentación, Perfil) y dos constructores de destinos condicionales: `destinoEntrevistaEnCurso(id)` y `destinoResultados(id)`.
- **`Sidebar.tsx`** concatena los condicionales con `DESTINOS` en una sola `ul`.
- **`useDestinosDisponibles`** pide el historial (clave `historial`, compartida con la pantalla) y deriva:
  - `enCurso`, con una segunda petición de estado para el número de pregunta;
  - `ultimaFinalizada`.
- **`useSidebar`** reexporta ambos y **`RutaProtegida`** los pasa a los dos `Sidebar` (barra y cajón).
- **`SidebarAccionPrincipal`** pinta "Continuar · n/total" con `enCurso`.
- **`SidebarPerfil`** pinta el avatar, el nombre y el correo (solo desplegado, sin enlace) y "Cerrar sesión".
- **`SidebarNavItem`** define el estilo de los ítems: `bg-white/[0.12]` en el activo, `p-3` plegado y `Tooltip`.

Ver proposal.md.

## Goals / Non-Goals

**Goals:**
- Tres destinos en dos grupos.
- El perfil desde el bloque de usuario.
- Eliminar el código de los destinos condicionales.

**Non-Goals:**
- Cambiar las rutas, el botón principal, los tamaños (cajón, iconos, plegable), los títulos de la cabecera o añadir destinos.

## Decisions

### D1. Grupos como datos en `destinos.ts`
```ts
export interface GrupoDeDestinos { titulo: string; destinos: Destino[] }
export const GRUPOS_DE_DESTINOS: GrupoDeDestinos[] = [
  { titulo: 'Prepararte', destinos: [{ ruta: '/mi-cv', … }] },
  { titulo: 'Tu progreso', destinos: [historial, retroalimentacion] },
]
```
Sigue siendo la única lista que pintan la barra y el cajón. Se eliminan `DESTINOS`, `destinoEntrevistaEnCurso` y `destinoResultados`. El título se guarda en tipo oración y se muestra en mayúsculas con CSS (`uppercase`), para que un lector de pantalla no lo deletree.

### D2. Marcado de cada grupo
Dentro del `nav aria-label="Secciones"`, cada grupo es un `div` con:
- **el rótulo**, un `h2` con `id`, en `text-label-mono uppercase text-vidrio-sidebar-muted px-3`; plegado lleva `sr-only` y antes de él va un `Divisor tono="oscuro"`;
- **la lista**, una `ul aria-labelledby={id}` con los `SidebarNavItem`.

Los grupos se separan con `gap-5`.
- **Por qué `h2`:** da navegación por encabezados dentro del `nav`. No compite con el `h1` de la página, porque el sidebar va antes en el DOM y el `h1` de cada página es el único `h1`.

### D3. El bloque de usuario como `NavLink`
`SidebarPerfil` recibe `onNavegar` y envuelve el avatar, el nombre y el correo en un `NavLink to="/perfil" end`, con las mismas clases de estado que `SidebarNavItem`:
- **activo:** `bg-white/[0.12]`;
- **hover:** `bg-white/[0.08]`;
- **foco:** `foco-claro`.

Desplegado, a la derecha va un chevron `Icono nombre="abajo"` rotado `-rotate-90`, decorativo, para no añadir un trazo nuevo.

Plegado, solo el `Avatar` con `p-1.5` (área táctil de 44 px o más), dentro de `Tooltip texto="Mi perfil"`, con `aria-label="Mi perfil"` en el enlace. `Sidebar` le pasa `onNavegar` para que el cajón móvil se cierre.

### D4. Limpieza de los condicionales
- **`useDestinosDisponibles`:** se borran `EntrevistaFinalizada`, `ultimaFinalizada` y el cálculo de `finalizada`. Se queda `enCurso`, que sigue compartiendo la caché `historial`.
- **`useSidebar` y `RutaProtegida`:** dejan de propagar `ultimaFinalizada`.
- **`Sidebar`:** pierde la prop `ultimaFinalizada` y deja de importar los constructores.
- Si el nombre del hook deja de describir lo que devuelve, se valora renombrarlo a `useEntrevistaEnCurso` en la misma tarea. Es solo un renombre, sin cambio de comportamiento.

## Risks / Trade-offs

- [Quien usaba "Resultados" para ver el último reporte necesita un clic más (Historial → reporte)] → Historial lista primero la más reciente, y al terminar una entrevista se llega a su reporte directamente.
- [En `/entrevista/:id` ningún ítem de la lista queda activo] → el botón "Continuar" ya es un `NavLink` y la cabecera nombra la sección.
- [Un grupo de un solo ítem (PREPARARTE)] → aceptado: el rótulo dice para qué sirve, y deja sitio a futuras herramientas de preparación sin reordenar.

## Ajustes al implementar

- **El hook se renombró:** `useDestinosDisponibles` pasó a ser `useEntrevistaEnCurso` (en el nuevo `components/layout/useEntrevistaEnCurso.ts`) y devuelve `EntrevistaEnCurso | null` directamente. Sin "Resultados", su nombre ya no describía lo que hacía.
- **Clases compartidas:** las de estado de los enlaces del sidebar (activo, hover y foco) se extrajeron a `Sidebar/clasesDeEnlace.ts`, que usan `SidebarNavItem` y el bloque de usuario. Así "estoy aquí" no se define dos veces.
