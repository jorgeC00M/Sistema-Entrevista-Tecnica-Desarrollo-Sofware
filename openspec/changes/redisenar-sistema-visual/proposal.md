## Why

El frontend creció feature por feature durante varios changes seguidos (landing, sidebar, retroalimentación) y acumuló estilo ad-hoc: 40 de sus 70 archivos usan clases Tailwind crudas (`slate-*`, `indigo-*`, `amber-*`, `emerald-*`, `sky-*`, `pink-*`, `red-*`) sin pasar por un token compartido, la mayoría de las "tarjetas blancas" repiten a mano los mismos estilos en vez de envolver con `Card`, y hay dos módulos de iconos paralelos (`IconoNav.tsx` para el sidebar, `Icono.tsx` para la landing) con trazos distintos. Nada de esto es incorrecto por sí solo, pero el conjunto ya no se lee como un solo sistema.

Jorge trajo una especificación de diseño completa y detallada — paleta, tipografía, radios, catálogo de componentes y una reestructuración del sidebar — para resolverlo de una vez, como refactor visual puro: sin tocar rutas, lógica de negocio ni llamadas a la API.

## What Changes

**Tokens de diseño**

- Paleta nueva (`tinta`, `iris`, más los semánticos `exito`/`progreso`/`error`) declarada en `@theme` dentro de `styles/index.css` — este proyecto usa Tailwind v4 sin `tailwind.config.js`, así que los tokens se traducen a variables CSS, no a un archivo de configuración.
- Radios `superficie` (16px) y `control` (8px), reemplazando el `rounded-lg` genérico usado hoy para ambos casos.
- Regla dura: `iris` es el único color de acción; los semánticos (`exito`/`progreso`/`error`) solo expresan estado o puntaje, nunca aparecen en un botón.

**Tipografía**

- IBM Plex Sans (400/500/600) + IBM Plex Mono (400/500), cargadas desde Google Fonts con `display=swap`. **Reemplaza** Plus Jakarta Sans, añadida hace apenas unos días en `sidebar-estilo-oscuro`.
- Mono para puntajes destacados, contador de preguntas ("03 / 05") y puntaje ("76 / 100"). No se interpreta como resaltado de sintaxis de código dentro del chat de la entrevista — las preguntas y respuestas siguen siendo texto plano; "código dentro de preguntas y respuestas" se entiende como que si alguna vez aparece un fragmento con formato de código, usaría mono, pero no se construye detección de bloques de código como funcionalidad nueva.

**Componentes base (`components/ui/`)**

- Nuevos: `BotonIcono`, `Textarea`, `ControlSegmentado`, `ChipPuntaje`, `Badge`, `Divisor`, `Avatar`, `Tooltip`, `Modal`, `EstadoVacio`.
- Consolidados: `Boton`, `Input`, `Card`, `Spinner` se ajustan a los tokens nuevos, sin cambiar su API donde ya es correcta.
- `lib/puntajes.ts` centraliza `obtenerNivel()`. **Decisión, ya validada con Jorge:** no reinventa los cortes numéricos de la rúbrica — traduce la `banda` de 4 valores que ya calcula `apps/evaluaciones/rubricas.py` en el backend a 3 colores visuales (`insuficiente`+`en_desarrollo` → `error`, `aceptable` → `progreso`, `solido` → `exito`). El backend sigue siendo la única fuente de verdad sobre dónde caen los cortes 40/60/80; el frontend solo agrupa para pintar.
- Iconos: se consolidan `IconoNav.tsx` e `Icono.tsx` en un solo módulo con trazos de Tabler, copiados en línea con el mismo patrón que ya usa el proyecto — **sin instalar `@tabler/icons-react`**, consistente con el resto de decisiones de este proyecto (sin GSAP, sin librería de gráficos, sin Radix, sin `focus-trap`).

**Sidebar**

- Se divide en `Sidebar/{Sidebar,SidebarMarca,SidebarAccionPrincipal,SidebarNavItem,SidebarPerfil}.tsx` + `useSidebar.ts`.
- Pasa de barra fija a flotante (margen 12px, radio `superficie`, fondo `tinta-950`).
- El foco atrapado se extrae a `hooks/useFocusTrap.ts`, reutilizado por el cajón móvil y por el nuevo `Modal` — conservando exactamente el comportamiento actual (Escape, clic fuera, devolución de foco).
- **Modo enfoque, decisión ya validada con Jorge:** el sidebar se colapsa solo al entrar a `/entrevista/:id`. El control de plegado sigue disponible para volver a abrirlo durante la entrevista si el estudiante quiere. Al salir de la ruta no se fuerza ningún estado — queda como el estudiante lo haya dejado.

**Resto del sistema**

- Los tokens y componentes nuevos se aplican en landing, auth, selección de área, entrevista, resultados e historial/progreso/retroalimentación.
- Fortalezas, debilidades y sugerencias se unifican en un `ListaRetroalimentacion` con prop `variante`, reemplazando el marcado repetido de `PanelCualitativo.tsx`.
- El badge de estado de entrevista (`ListaEntrevistas.tsx`) pasa a usar el nuevo `Badge`.

**Fuera de alcance, explícito**

- No se cambian rutas, lógica de negocio ni llamadas a la API.
- No se instala ninguna dependencia nueva de npm.
- No se agrega modo claro/oscuro conmutable — el sidebar sigue siendo oscuro siempre.
- No se permite editar el perfil.
- No se crean tests.

## Capabilities

### New Capabilities

- `modo-enfoque-entrevista`: el sidebar se colapsa automáticamente al entrar a una entrevista activa, sin impedir que el estudiante lo vuelva a abrir si lo necesita.

### Modified Capabilities

<!-- Ninguna. `openspec/specs/` sigue vacío — `navegacion-estudiana`, `identificacion-de-seccion`,
     `landing-publica` y `retroalimentacion-acumulada` existen solo como deltas en changes sin
     archivar. Este cambio no modifica ninguno de sus requisitos: la barra lateral sigue siendo
     el único lugar de navegación, el destino activo se sigue distinguiendo sin depender solo del
     color, el encabezado sigue nombrando la sección, el catálogo público sigue funcionando igual.
     Es una nueva capa visual sobre comportamiento ya especificado. -->

## Impact

**Código afectado** — prácticamente todo `frontend/src/`: `styles/index.css`, `index.html` (fuentes), `components/ui/*`, `components/layout/*` (reestructurado a `Sidebar/`), y cada feature (`landing`, `auth`, `seleccion`, `entrevista`, `resultados`, `historial`, `retroalimentacion`, `perfil`).

**Coordinación con changes abiertos**

- `sidebar-estilo-oscuro` (17/19, sin archivar): sus tokens `slate-900`/`indigo-600` quedan reemplazados por `tinta-950`/`iris-600`. Las 2 tareas de verificación de navegador que le quedaban pendientes quedan obsoletas — el componente que verificaban ya no existe en esa forma.
- `agregar-sidebar-estudiante` (40/52, sin archivar): sus tareas de verificación de teclado/responsive pendientes se reemplazan por las de este change, que cubren el mismo sidebar ya reestructurado.
- `agregar-landing-page` (30/41) y `completar-migracion-arquitectura` (70/84): no se tocan sus pendientes (verificación de la landing, despliegue) — este change no tiene relación directa con esos puntos, salvo que la landing recibe los tokens nuevos.

**Sin impacto**

- Ningún endpoint del backend cambia. Los 94 tests del backend no se ven afectados.
- El contrato de datos entre frontend y backend no se toca — el frontend sigue leyendo el mismo campo `banda`, solo lo pinta distinto.
