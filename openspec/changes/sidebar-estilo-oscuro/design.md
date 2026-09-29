## Context

Ver `proposal.md` — Why. Estado actual relevante:

- `Sidebar.tsx`, `Header.tsx`, `ContinuarEntrevista.tsx` y el shell de `RutaProtegida.tsx` los construyó `agregar-sidebar-estudiante` (40/52, sin archivar): fondo blanco, destino activo marcado con fondo `indigo-50` + barra vertical `before:`, header que solo repite "Entrevistas Técnicas".
- La decisión de paleta tomada en `agregar-landing-page/design.md` fue explícita: un solo color de marca (`indigo-600`), sin acento secundario, porque introducir un segundo color de marca generaría dos productos visuales distintos entre la landing y la aplicación.
- `IconoNav.tsx` ya tiene el patrón de trazos SVG en línea sin librería, que sigue este cambio para el nuevo icono de logomarca.
- El cajón móvil y la barra fija comparten el mismo componente `Sidebar`, así que un cambio de tema los afecta a ambos automáticamente.

## Goals / Non-Goals

**Goals:**

- Adoptar el lenguaje visual de la referencia (sidebar oscuro, píldora de navegación, bloque de marca, header con título de sección) sin introducir un segundo color de marca.
- Que el destino activo se siga distinguiendo por algo más que el color, como ya exige el comportamiento existente.
- Que el header identifique la sección sin necesitar que cada página declare su propio título de forma imperativa.

**Non-Goals:**

- No se adoptan la campana de notificaciones, el avatar de foto, ni las tarjetas de estadística o de dispositivo de la referencia — decidido explícitamente con Jorge.
- No se cambia el tema de la landing pública.
- No se añade modo claro/oscuro conmutable: el sidebar es oscuro siempre, no es un "dark mode" del producto.
- No se crean tests.

## Decisions

### El azul marino no es un segundo color de marca, es el extremo oscuro de la escala neutra

`slate-900` para el fondo del sidebar, `slate-800` para bordes y estados de reposo, `slate-300`/`slate-400` para texto e iconos inactivos. Son los mismos tokens `slate` que el resto de la aplicación ya usa para texto y bordes — solo se usa el extremo oscuro de esa escala, que hasta ahora no se tocaba.

El acento sigue siendo únicamente `indigo-600`, el mismo de los botones primarios en toda la aplicación, reutilizado aquí como relleno de la píldora activa. No se introduce ningún azul nuevo. Esto mantiene intacta la decisión de "un solo color de marca" de `agregar-landing-page/design.md`: esa decisión hablaba de no añadir un segundo *acento*, no de mantener todo el producto en fondo claro.

### El destino activo es una píldora sólida, no una barra lateral

El diseño anterior marcaba el activo con `bg-indigo-50` (fondo muy sutil) más una barra vertical `before:` a la izquierda, necesaria porque un cambio de fondo tan sutil sobre blanco no bastaba por sí solo. Sobre `slate-900`, un relleno sólido de `indigo-600` con texto blanco ya es un contraste fuerte por sí mismo — la barra lateral pasa a ser redundante y no aparece en la referencia.

Se retira la barra `before:`. La distinción "no solo por color" que exige el requisito de accesibilidad se mantiene por otros dos medios independientes del color: la *presencia de relleno* (los inactivos no tienen fondo; el activo sí) y `aria-current="page"`, que ya existía y no cambia.

### El bloque de marca reutiliza el icono de la landing, no inventa uno nuevo

La referencia tiene un icono en caja + nombre a dos líneas (nombre del producto / eslogan). Se reutiliza el mismo trazo de `features/landing/components/Icono.tsx::marca` — ya usado en `HeaderLanding` y `FooterLanding` — en vez de diseñar un logo nuevo, para que la marca se vea igual en la landing y en la aplicación.

Composición: caja `indigo-600` de 36×36 con el icono en blanco, más "Entrevistas Técnicas" en `text-white` y "Simulador con IA" en `text-slate-400` como segunda línea. Se oculta la segunda línea (y el texto entero) al plegar, con el mismo patrón que ya usa `DESTINO_PRINCIPAL`.

### El título del header sale de un mapa de rutas, no de que cada página lo declare

Alternativas consideradas:

1. **Contexto de React** que cada página establece al montarse (`useTitulo('Historial y progreso')`). Da control total, incluidos títulos dinámicos (por ejemplo, el área de la entrevista en curso), pero exige que cada página nueva recuerde declararlo, y sin esa declaración el header queda vacío — justo lo que el nuevo requisito prohíbe.
2. **Mapa estático de ruta a título**, igual en espíritu a `destinos.ts`. Un título por ruta, resuelto con `useLocation` + `matchPath` de React Router. No permite títulos dinámicos, pero eso no hace falta hoy: ninguna página tiene un dato que deba aparecer en el título (el área de una entrevista ya se ve en el propio contenido y en el aviso "Continuar entrevista").

Se elige la opción 2. Es imposible que quede vacío — si una ruta no está en el mapa, se usa un título por defecto — y no depende de que cada página futura recuerde nada.

`components/layout/titulosDeRuta.ts` cubre las seis rutas protegidas: `/nueva-entrevista`, `/entrevista/:id`, `/entrevista/:id/resultados`, `/historial`, `/retroalimentacion`, `/perfil`. Las dos rutas con parámetro se resuelven con patrones (`/entrevista/:id`, `/entrevista/:id/resultados`), no con coincidencia exacta.

### Sin campana ni avatar: el header queda con un solo bloque de contenido

La decisión ya se tomó con Jorge. El único añadido al header es el bloque de título/subtítulo a la izquierda; no queda ningún hueco vacío a la derecha reservado para elementos futuros — cuando exista una función que lo necesite (notificaciones, una acción por página), se diseñará entonces con datos reales, no con un marcador de posición sin función.

### `ContinuarEntrevista` se reajusta para el fondo oscuro, no se rediseña

Sigue siendo un bloque de acento ámbar — el color que ya distingue "atención, algo pendiente" en el resto de la aplicación — pero con los tokens invertidos para contraste sobre oscuro: `bg-amber-500/10` en vez de `bg-amber-50`, `text-amber-300` en vez de `text-amber-900`, `ring-amber-500/30` en vez de `ring-amber-200`.

## Risks / Trade-offs

**Perder contraste en los tokens con opacidad** (`amber-500/10`, `ring-amber-500/30`) → Un color con opacidad baja puede no llegar a 4.5:1 si el texto también usa opacidad. Mitigación: el texto usa `amber-300` sólido (sin opacidad), solo el fondo y el anillo llevan transparencia; se verifica el contraste igual que el resto del sidebar en el grupo de cierre.

**El mapa estático de títulos se desincroniza si se añade una ruta y se olvida el título** → Mitigación: un título por defecto genérico evita que quede vacío (cumple el requisito), y la lista de rutas protegidas es corta y vive en `router/index.tsx`, fácil de cotejar contra `titulosDeRuta.ts`.

**Retirar la barra `before:` del activo es un cambio de criterio respecto a `agregar-sidebar-estudiante`** → Ese change no archivó todavía su spec, así que no hay contradicción formal, pero conviene que quien lo revise sepa que el mecanismo de distinción cambió de "barra lateral" a "relleno sólido de la píldora". Ambos satisfacen el mismo requisito por caminos distintos.

## Migration Plan

1. **Icono y mapa de rutas** — el trazo de logomarca en `IconoNav.tsx` y `titulosDeRuta.ts`. No dependen de nada más y no rompen nada existente.
2. **Sidebar** — paleta, bloque de marca, destino activo como píldora sólida. `RutaProtegida.tsx` cambia el fondo de sus contenedores `<aside>` en el mismo paso, porque el color del sidebar depende de ambos archivos a la vez.
3. **ContinuarEntrevista** — reajuste de tokens ámbar.
4. **Header** — título y subtítulo de sección, usando el mapa de rutas.
5. **Verificación** de contraste, foco y los cuatro anchos, como paso propio.

**Rollback**

Todo el trabajo es de estilo sobre componentes ya existentes, sin cambios de comportamiento ni de datos. `git revert` del commit lo deja como estaba.

## Open Questions

Ninguna. El alcance quedó cerrado en las tres preguntas resueltas con Jorge antes de escribir este documento.
