## Context

La landing vive en `frontend/src/features/landing/` (`pages/LandingPage.tsx`
ensambla `HeaderLanding`, `Hero`, `ComoFunciona`, `QueRecibes`,
`AreasTecnicas` condicional, `CierreCTA`, `FooterLanding`). Ya usa la
paleta/tipografía "vidrio" (`--color-vidrio-*`, `--font-serif`,
`--font-mono-vidrio`, ya en `styles/index.css`) y el hook
`useRevelarAlEntrar` (fundido + subida al entrar en pantalla, respeta
`prefers-reduced-motion`, usado por `ComoFunciona`/`AreasTecnicas`/
`QueRecibes`/`CierreCTA`). El catálogo público llega por
`useCatalogosPublicos()` (`{ areas, niveles, preguntas_por_entrevista }`),
ya usado hoy por `Hero`/`ComoFunciona`/`AreasTecnicas`. `SeleccionAreaPage.tsx`
ya mapea `codigo` de área → ícono (`ICONO_POR_AREA`), y esos mismos íconos
(`area`, `datos`, `arbol`, `web`) ya existen en el módulo consolidado
`components/ui/Icono.tsx`. Ver `landing.html` (raíz del repo) como
referencia completa de markup/CSS/JS a adaptar — no se pega tal cual, se
traduce a componentes React + clases Tailwind + los tokens ya existentes.

## Goals / Non-Goals

**Goals:**
- Igualar la experiencia visual e interactiva de `landing.html` sección por
  sección, usando solo los tokens de color ya existentes.
- Que el carrusel de áreas, los contadores y las barras lean datos reales
  del catálogo público donde el mockup usa números fijos, y nunca muestren
  las áreas de ejemplo del mockup.
- Que ninguna animación nueva rompa `prefers-reduced-motion`.

**Non-Goals:**
- No se toca `/login`, `/registro` ni nada detrás de `RutaProtegida` (fuera
  del alcance del mockup, que es solo la landing).
- No se persigue paridad al píxel del mockup en cada breakpoint — se sigue
  su estructura e intención, adaptada a los puntos de quiebre que ya usa el
  resto del proyecto.
- La vista previa de entrevista del hero y el medidor/barras de "Qué
  recibes" siguen siendo contenido ilustrativo fijo (igual que en el
  mockup) — no se conectan a una entrevista real ni a datos de un usuario.

## Decisions

**Mapeo de variables del mockup a tokens ya existentes** (ninguna se
duplica; todas ya están en `styles/index.css`):

| Mockup | Token del proyecto |
|---|---|
| `--accent` | `vidrio-acento` |
| `--accent-hover` | `vidrio-acento-hover` |
| `--accent-soft` | `vidrio-acento-suave` |
| `--ink` | `vidrio-ink` |
| `--text` | `vidrio-texto` |
| `--muted` | `vidrio-muted` |
| `--page-bg` | `vidrio-bg` |
| `--card` | `vidrio-card` |
| `--field` | `vidrio-field` |
| `--line` | `vidrio-linea` |
| `--edge` | `vidrio-borde` |

**`--ok`/`--ok-bg` y `--warn`/`--warn-bg` se descartan, no se adoptan.** El
mockup usa un verde/ámbar propios para "fortaleza"/"debilidad". El proyecto
ya tiene semánticos equivalentes con otros valores (`exito-texto`/
`exito-fondo`, `progreso-texto`/`progreso-fondo`), usados en todo
`QueRecibes.tsx`/`ListaRetroalimentacion.tsx` del dashboard. Adoptar los
tonos del mockup crearía dos verdes y dos ámbares distintos en el mismo
sistema — se reutilizan los semánticos existentes en su lugar.

**`--wrap`(1280px)/`--pad`(clamp) se implementan como un componente
compartido, no como tokens globales nuevos.** Es un contenedor exclusivo de
la landing (el dashboard y login/registro tienen sus propios anchos, ya
decididos en rondas anteriores) — se crea
`features/landing/components/Wrap.tsx`, un `<div>` con
`mx-auto w-full max-w-[1280px] px-[clamp(20px,4vw,56px)]`, y cada sección lo
usa en vez de repetir `mx-auto max-w-5xl px-4` como hoy. Reemplaza los
anchos por sección elegidos en la ronda de responsive anterior — ese ancho
angosto (`max-w-3xl`/`max-w-5xl`) queda superado por este contenedor único
de 1280px que pide el mockup.

**Nuevo primitivo de animación: `useProgresoAnimado`.** Contadores,
medidor circular y barras de rúbrica son todos "animar un número de 0 a N
en T ms, con easing, activado al entrar en pantalla, y sin animar si hay
movimiento reducido" — la misma operación con distinta salida (texto,
`stroke-dashoffset`, `width%`). Se implementa un solo hook
`features/landing/hooks/useProgresoAnimado.ts` que devuelve el valor
intermedio 0..destino dado un `activo: boolean` y una duración, y cada
consumidor lo traduce a su propia representación visual. Evita reimplementar
`requestAnimationFrame` cuatro veces.

**`prefiereMovimientoReducido` se exporta desde `useRevelarAlEntrar.ts`.**
Hoy es una función privada del archivo. El carrusel, el contador y la
demo del hero también necesitan la misma comprobación — se exporta en vez
de duplicar el `matchMedia` en cada pieza nueva.

**Carrusel (`CarruselAreas.tsx` + `useCarrusel.ts`) reemplaza la cuadrícula
de `AreasTecnicas.tsx`.** Recibe `areas`/`niveles` ya cargadas (mismo prop
shape que hoy) — nunca agrega ítems de relleno. `useCarrusel(total, porVista,
duracionMs)` centraliza índice, `setInterval` de avance (apagado si
`prefiereMovimientoReducido()`), y expone handlers para flechas, puntos y
touch — el componente solo renderiza.

**Encabezado de sección compartido: `EncabezadoSeccion.tsx`.** El patrón
"número de fase en píldora + título Fraunces + descripción + línea inferior"
se repite en Cómo funciona / Qué recibes / Áreas — se extrae un componente
en vez de repetir el markup tres veces, reutilizando `EtiquetaMono` para la
píldora del índice (ya existe, ya tiene el estilo `marca`/píldora).

**Ícono de marca: blanco + acento en todos los estados del navbar**, no solo
en el footer (que ya lo tiene así). Es la causa concreta de "el ícono no se
ve bien" que reporta el usuario — hoy `HeaderLanding` usa fondo `vidrio-acento`
con ícono blanco (al revés que el mockup y que el propio footer del
proyecto).

**Íconos nuevos, dentro del módulo consolidado.** `components/ui/Icono.tsx`
gana 4 trazos nuevos (flecha diagonal para los CTA, chevron izquierda/derecha
para el carrusel, círculo de información para la nota de la IA) — incorporados
al mismo registro `TRAZOS`, mismo grosor de trazo (`strokeWidth=2`), sin crear
un módulo de íconos aparte para la landing (ver docstring de `Icono.tsx`
sobre por qué existe un solo módulo).

**`scroll-behavior: smooth` en `html`**, en `styles/index.css` — necesario
para que los enlaces `#inicio`/`#como`/`#recibes`/`#areas` del navbar
desplacen suavemente; es una propiedad de documento, no se puede aplicar
solo a un `<div>` de la landing. Se agrega también
`@media (prefers-reduced-motion: reduce){html{scroll-behavior:auto}}` — el
mockup no lo hace explícito, pero es la práctica accesible correcta y barata
de agregar junto al resto de la sección `reduced-motion` ya existente.

**Navbar con estado dark/light: lógica local en `HeaderLanding.tsx`**, sin
hook aparte (un solo consumidor). Un `IntersectionObserver` sobre la sección
`id="inicio"` (el hero) alterna una bandera `sobreHero`; otro observa las
cuatro secciones con ids para marcar el enlace activo — mismo mecanismo que
ya usa `useRevelarAlEntrar`, aplicado aquí directo por ser un caso de un solo
uso.

**Vista previa de la entrevista: componente propio,
`VistaPreviaEntrevista.tsx`**, con su propio efecto de "escritura" y bucle
(igual que el mockup), sin conectarse a `useEntrevista` ni a ninguna API —
es contenido ilustrativo fijo, igual que hoy son ilustrativas las barras de
rúbrica del mockup en "Qué recibes".

## Risks / Trade-offs

- [Duplicar animaciones simultáneas de scroll-reveal + demo del hero +
  contadores podría notarse pesado en equipos modestos] → todas están
  gateadas por `IntersectionObserver` (no corren fuera de pantalla) y por
  `prefers-reduced-motion`; ninguna usa una librería, son transiciones CSS
  y un puñado de `requestAnimationFrame`/`setInterval`, igual costo que el
  mockup de referencia.
- [El carrusel con menos de 3 áreas reales se comporta distinto al mockup
  (que asume 4)] → `useCarrusel` calcula `maxIndex` a partir del total real
  recibido, igual que la lógica del mockup (`Math.max(0, cards.length -
  perView())`) — ya es correcta para cualquier cantidad.
- [Reemplazar los anchos `max-w-3xl`/`max-w-5xl` de la ronda de responsive
  anterior por el `Wrap` de 1280px podría volver a angostar/ensanchar de
  forma distinta a lo ya ajustado] → es un cambio deliberado pedido en este
  mockup (contenedor único de 1280px con `--pad` fluido); no es un
  regreso accidental, se documenta aquí para que quede explícito.

## Open Questions

- El mockup no especifica qué pasa si el catálogo público falla en cargar
  (la landing ya omite hoy la sección de áreas por completo en ese caso,
  vía `hayAreas` en `LandingPage.tsx`) — se mantiene ese mismo
  comportamiento: sin catálogo, no hay carrusel, igual que hoy no hay
  cuadrícula. No cambia nada del contrato ya cubierto por
  `landing-publica`.
