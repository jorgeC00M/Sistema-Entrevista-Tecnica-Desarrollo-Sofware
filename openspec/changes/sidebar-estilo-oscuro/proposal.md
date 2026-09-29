## Why

Jorge compartió una referencia visual (panel de InfinityFlow, un SaaS de gestión de impresión 3D) y pidió adoptar ese diseño para la zona autenticada. El sidebar y el header que se acaban de construir en `agregar-sidebar-estudiante` son funcionalmente completos pero visualmente austeros: fondo blanco liso, sin bloque de marca propio, y un encabezado que solo repite el nombre de la aplicación en cada pantalla sin decir en cuál está el estudiante.

## What Changes

**Frontend — restyle del shell autenticado**

- El sidebar pasa a fondo azul marino oscuro (`slate-900`), con el destino activo marcado por una píldora sólida indigo — el mismo indigo-600 que ya es el único color de marca del proyecto, reutilizado como acento sobre la nueva superficie oscura en vez de introducir un segundo color.
- Se añade un bloque de marca en la cabecera del sidebar: logomarca en caja indigo + nombre del sistema, con una segunda línea de descripción corta. Se oculta al plegar, igual que ya ocurre con las etiquetas de los destinos.
- El encabezado deja de mostrar el nombre genérico de la aplicación y pasa a mostrar el nombre de la sección en la que está el estudiante, con un subtítulo breve por sección.
- **Fuera de alcance, decidido explícitamente**: no se añade campana de notificaciones ni avatar de foto en el encabezado — no hay sistema de notificaciones que respaldarlo, y un icono sin función real sería engañoso. El usuario y el cierre de sesión siguen viviendo solo en el pie del sidebar.
- No se adoptan las tarjetas de estadísticas ni las tarjetas de dispositivo de la referencia: son específicas de un panel de impresoras 3D y no tienen equivalente en este dominio.
- El cajón de navegación en móvil hereda el mismo tema oscuro que la barra fija, para que ambos se vean como el mismo componente.

**Fuera de alcance**

- No se toca el header de la landing pública (`HeaderLanding`), que es un componente distinto y no forma parte de la zona autenticada.
- No se crean tests.
- No cambia ningún endpoint del backend.

## Capabilities

### New Capabilities

- `identificacion-de-seccion`: el encabezado le dice al estudiante en qué sección de su zona autenticada está, en lugar de repetir el nombre genérico de la aplicación en cada pantalla.

### Modified Capabilities

<!-- Ninguna. `navegacion-estudiante` (definida en el change `agregar-sidebar-estudiante`,
     todavía sin archivar) no existe como spec publicada en openspec/specs/, así que no
     puede modificarse aquí como capacidad existente. El restyle de color y forma que
     hace este cambio no altera ninguno de sus requisitos ni escenarios — la barra
     lateral sigue siendo el único lugar de navegación, el destino activo sigue
     distinguiéndose sin depender solo del color (ahora por relleno sólido de la píldora,
     antes por una barra lateral), y el resto del comportamiento (cajón, plegado, aviso
     de entrevista en curso, perfil) no cambia. Es una nueva capa de estilo sobre
     comportamiento ya especificado, no una revisión de ese comportamiento. -->

## Impact

**Código afectado**

- `frontend/src/components/layout/Sidebar.tsx` — paleta, bloque de marca, y el destino activo pasa de "fondo claro + barra lateral" a "píldora sólida indigo".
- `frontend/src/components/layout/Header.tsx` — deja de mostrar la marca y pasa a mostrar título y subtítulo de sección.
- `frontend/src/components/layout/ContinuarEntrevista.tsx` — su paleta ámbar se ajusta para leerse sobre fondo oscuro.
- `frontend/src/components/layout/titulosDeRuta.ts` — nuevo, mapa de ruta a título/subtítulo que consume el header.
- `frontend/src/router/RutaProtegida.tsx` — fondo del `<aside>` fijo y del cajón pasan a oscuro.
- `frontend/src/components/ui/IconoNav.tsx` — se añade el trazo de la logomarca del sidebar.

**Coordinación con changes abiertos**

Este change modifica archivos que `agregar-sidebar-estudiante` (40/52, sin archivar) acaba de crear. Se construye sobre ese trabajo sin invalidar ninguna de sus tareas: todas las verificaciones de teclado, foco y responsive pendientes ahí siguen aplicando igual sobre la versión oscura. Conviene aplicar este change después de cerrar las verificaciones de navegador de `agregar-sidebar-estudiante`, para no verificar dos capas de cambios visuales a la vez sobre las mismas pantallas.

**Sin impacto**

- Ningún endpoint del backend cambia.
- El contrato de datos entre frontend y backend no se toca.
- Los 94 tests del backend no se ven afectados.
