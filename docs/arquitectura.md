# Guía de estilo del frontend

Sistema de diseño resultante del rediseño visual del frontend (rama
`rediseno-sistema-visual`). Cubre paleta, tipografía, radios, componentes base
y las reglas de accesibilidad que rigen su uso. Los tokens viven como
variables CSS dentro de `@theme` en `frontend/src/styles/index.css` (Tailwind
CSS v4 no usa `tailwind.config.js`); cada variable genera automáticamente sus
utilidades (`--color-iris-600` → `bg-iris-600`, `text-iris-600`, etc.).

## Paleta

### `tinta` — escala neutra

| Token | Hex | Uso típico |
|---|---|---|
| `tinta-50` | `#F6F7FB` | Fondo de página |
| `tinta-100` | `#E9ECF3` | Bordes y divisores sobre superficies claras |
| `tinta-300` | `#A4AAC0` | Solo sobre fondos oscuros (`tinta-900`/`950`); en fondos claros no cumple AA — ver [Accesibilidad](#accesibilidad) |
| `tinta-500` | `#5B6380` | Texto secundario/metadatos sobre fondos claros |
| `tinta-700` | `#2E3657` | Texto de énfasis medio, bordes del botón secundario |
| `tinta-800` | `#1E2542` | Fondo hover del sidebar, divisores del sidebar |
| `tinta-900` | `#131A33` | Fondo hover de ítems del sidebar |
| `tinta-950` | `#0B1020` | Fondo del sidebar, texto principal sobre blanco |

### `iris` — único color de acción

| Token | Hex | Uso típico |
|---|---|---|
| `iris-50` | `#EEF0FF` | Fondos suaves (chips, íconos destacados) |
| `iris-400` | `#7C83F0` | Ícono activo en el sidebar |
| `iris-600` | `#4B4FD1` | Relleno de botón primario, enlaces, foco |
| `iris-700` | `#3C3FAE` | Hover del botón primario |

**Regla:** `iris` es el único color de acción de la landing pública. El
dashboard autenticado y login/registro tienen su propio color de acción,
`vidrio-acento` — ver más abajo. Ningún semántico se usa como fondo de un
botón o enlace de acción en ninguno de los dos sistemas.

### `vidrio` — paleta del dashboard autenticado

Introducida al extender a todo el dashboard el lenguaje visual que login y
registro ya tenían como réplica de mockup con valores literales (ver
[Autenticación](#autenticación--sistema-de-diseño-aislado)). Es una familia
de tokens nueva y autocontenida, no un reemplazo de `tinta`/`iris` — esos
siguen siendo la paleta real de la landing pública, que no usa `vidrio`.

| Token | Valor | Uso típico |
|---|---|---|
| `vidrio-acento` | `#2b55a3` | Color de acción del dashboard: botones primarios, enlaces, foco |
| `vidrio-acento-hover` | `#234889` | Hover de `vidrio-acento` |
| `vidrio-acento-suave` | `rgba(43,85,163,.10)` | Fondos suaves (chips, íconos destacados, halo de selección) |
| `vidrio-ink` | `#1c2f5e` | Texto principal, fondo del sidebar |
| `vidrio-texto` | `#4a5572` | Texto secundario |
| `vidrio-muted` | `#8a93a8` | Texto terciario/metadatos |
| `vidrio-bg` | `#e8edf5` | Fondo de página |
| `vidrio-card` | `rgba(255,255,255,.55)` | Fondo de tarjetas/paneles (efecto vidrio, con `backdrop-blur`) |
| `vidrio-field` | `rgba(255,255,255,.72)` | Fondo de campos e inputs |
| `vidrio-linea` | `rgba(28,47,94,.12)` | Bordes y divisores |
| `vidrio-borde` | `rgba(255,255,255,.8)` | Borde de tarjetas de vidrio |
| `vidrio-sidebar-muted` | `#9fb0cf` | Texto atenuado solo sobre el sidebar oscuro (`vidrio-ink`) — no usar sobre superficies claras |

`--font-serif` (Fraunces, títulos) y `--font-mono-vidrio` (JetBrains Mono,
datos exactos: puntajes, contadores, cronómetro) acompañan a esta paleta —
ver [Tipografía](#tipografía). `--radius-vidrio: 18px` es su radio de
tarjetas/paneles, distinto de `--radius-superficie` (8px, landing).

### Semánticos — solo estado o puntaje, nunca botones

| Grupo | Texto | Fondo |
|---|---|---|
| `exito` | `#15803D` | `#DCFCE7` |
| `progreso` | `#B45309` | `#FEF3C7` |
| `error` | `#B91C1C` | `#FEE2E2` |

Un puntaje (0-100) se traduce a uno de estos tres colores a través de la
banda que ya calculó el backend (`apps/evaluaciones/rubricas.py`), nunca
recalculando el corte en el cliente — ver [`lib/puntajes.ts`](#librería-de-puntajes).

## Tipografía

- **Sans:** IBM Plex Sans (400, 500, 600), cargada desde Google Fonts con
  `display=swap`. `--font-sans`. Es la de la landing pública.
- **Mono:** IBM Plex Mono (400, 500), misma carga. `--font-mono`. Landing.
- Ambas con fallback del sistema.
- **Dashboard autenticado y login/registro:** Fraunces (500, 600, títulos,
  `--font-serif`/`font-serif`), Figtree (400/500/600, todo lo demás, sin
  token — se fija una sola vez en `RutaProtegida.tsx`/`TarjetaAuth.tsx` y
  hereda por cascada) y JetBrains Mono (500, datos exactos — puntajes,
  contadores, cronómetro — `--font-mono-vidrio`/`font-mono-vidrio`),
  cargadas en `index.html`, no en `styles/index.css`, para no volverlas
  parte del sistema global de la landing.

| Uso | Tamaño / peso | Interlineado |
|---|---|---|
| Título de página | 24px / 600 (`text-2xl font-semibold`) | 1.2 |
| Título de sección | 18px / 600 (`text-lg font-semibold`) | 1.2 |
| Texto base | 16px / 400 (`text-base`) | 1.5 |
| Navegación y botones | 14px / 500 (`text-sm font-medium`) | 1.5 |
| Metadatos | 12px / 400 (`text-xs`) | 1.5 |
| Puntaje destacado | 36px / 500 mono (`text-4xl font-medium font-mono`) | 1.2 |

`font-mono` se usa en: código dentro de preguntas/respuestas, el contador de
pregunta ("03 / 05"), y cualquier puntaje ("76", "76/100").

### Escala nominal (consola técnica)

Añadida en la adopción del lenguaje de "consola técnica" (rama
`adoptar-consola-tecnica`), tomada del sistema de diseño "Calm Engineering
Terminal". Convive con la escala numérica de arriba en vez de reemplazarla:
**en código nuevo o tocado, preferir la escala nominal** por lo que ya
resuelve sola (tamaño + interlineado + tracking + a veces peso, en un solo
nombre); no hace falta migrar código sin tocar solo para renombrar clases.

| Token | Tamaño / peso | Uso |
|---|---|---|
| `text-headline-xl` | 32px / 600 | Título de página dentro de la consola |
| `text-headline-lg` | 24px / 600 | Equivalente a "título de página" de arriba |
| `text-headline-md` | 20px / 600 | Nombre de tarjeta destacada (p. ej. área técnica) |
| `text-headline-sm` | 16px / 600 | Título de tarjeta/sección |
| `text-body-lg` / `-md` / `-sm` | 16 / 14 / 12px / 400 | Prosa, según énfasis |
| `text-label-sans` | 12px / 500 | Etiqueta corta en sans |
| `text-label-mono` | 11px / 500, mayúsculas, tracking amplio | Metadato en mono — ver `EtiquetaMono` |
| `text-metric-counter` | 18px / 600 mono | Contador en vivo (p. ej. "03 / 05") |
| `text-code-inline` / `text-code-block` | 13px mono | Fragmentos de código |

## Radios

- `--radius-superficie: 8px` (`rounded-superficie`) — tarjetas, paneles,
  el sidebar.
- `--radius-control: 8px` (`rounded-control`) — botones, inputs, campos.
- `--radius-chip: 4px` (`rounded-chip`) — chips de puntaje, badges,
  etiquetas mono.
- `--radius-vidrio: 18px` (`rounded-vidrio`) — tarjetas y paneles del
  dashboard autenticado (ver `vidrio` más arriba).

`superficie` y `control` coinciden hoy en 8px pero se mantienen como tokens
separados a propósito: expresan intenciones distintas (contenedor pasivo vs.
elemento interactivo) y pueden volver a divergir si el diseño cambia — no
sustituir por un único token `--radius`.

## Componentes base (`components/ui/`)

La mayoría de estos componentes son compartidos entre la landing (`iris`) y
el dashboard (`vidrio`): donde un mismo componente tiene consumidores en
ambos sistemas, expone una variante/tono adicional en vez de cambiar su
color por defecto — así ninguno de los dos lados cambia sin que alguien lo
pida. Donde todos sus consumidores caían ya dentro del dashboard, se
recoloreó su apariencia por defecto directamente, sin variante nueva.

| Componente | Responsabilidad |
|---|---|
| `Boton` | Variantes `primario` (iris sólido, landing) / `secundario` (borde tinta-700, landing) / `fantasma` (neutro sobre sidebar oscuro) / `vidrio` (acento vidrio sólido, dashboard) / `vidrio-secundario` (blanco + borde vidrio-linea, dashboard) — cada una es su propia rama, nunca una superpuesta por `className`, para no depender de un empate de especificidad de Tailwind; tamaños, estado `cargando`, ícono opcional; `forma?: 'control' \| 'pildora'` (default `control`, 8px) — `pildora` (`rounded-full`) se usa en login/registro y en los CTA del dashboard |
| `BotonIcono` | Botón solo-ícono; `aria-label` obligatorio en el tipo; `oscuro` (sobre el sidebar `vidrio-ink`) |
| `Input` / `Textarea` | Campos de formulario; `Textarea` con contador opcional (en `font-mono-vidrio`) y, tras este cambio, estilo `vidrio` por defecto (único consumidor: `CampoRespuesta` en la entrevista). `Input` acepta `icono?: NombreDeIcono`, `conAlternarPassword?: boolean` y `variante?: 'linea' \| 'relleno'` — sin uso hoy (ver nota más abajo) |
| `ControlSegmentado` | Grupo de 2-4 opciones excluyentes; estilo `vidrio` por defecto (único consumidor: `SelectorNivel`), pill segmentada con la opción activa en `vidrio-acento` |
| `Card` | Contenedor pasivo: `rounded-superficie` + `border-tinta-100` — sin uso hoy (ver nota más abajo) |
| `ChipPuntaje` | Recibe `puntuacion` + `banda` (obligatoria); el color sale de la banda, nunca de un umbral recalculado; `rounded-full` (antes `rounded-chip`) |
| `Badge` | Etiqueta de estado corta, 4 tonos (`exito`/`progreso`/`error`/`neutro`); `neutro` es `vidrio-field`/`vidrio-muted` (único consumidor: el dashboard) |
| `Divisor` | Línea de 1px; `claro` (`vidrio-linea`) u `oscuro` (`white/10`, sidebar) |
| `Avatar` | Iniciales del usuario; `oscuro` (sobre el sidebar) usa `white/15` + texto blanco |
| `Tooltip` | Accesible por hover y por foco (CSS puro, sin JS); fondo `vidrio-ink` (único consumidor: el sidebar colapsado) |
| `Spinner` | Indicador de carga; `tono?: 'claro' \| 'vidrio'` (default `claro`, landing/entrada raíz) — `vidrio` se usa en todo estado de carga del dashboard autenticado |
| `Modal` | Usa `hooks/useFocusTrap` — sin uso hoy (ver nota más abajo) |
| `EstadoVacio` | Mensaje + ícono opcional para listas vacías; recoloreado a `vidrio` (único consumidor: el dashboard) |
| `Icono` | Módulo consolidado de íconos de línea (trazos reales de Tabler Icons, copiados inline — sin dependencia npm) |
| `EtiquetaMono` | Metadato en `text-label-mono`, ahora en `font-mono-vidrio`; tonos `neutro`/`marca`/`oscuro`/`suelto`, todos recoloreados a `vidrio` (único consumidor: el dashboard) |
| `Cronometro` | Cronómetro ascendente de sesión, informativo — sin límite ni consecuencia; recoloreado a `vidrio-ink`/pill (único consumidor: `EntrevistaPage`) |
| `ListaRetroalimentacion` | Tarjeta con acento superior de color semántico para fortalezas/debilidades/sugerencias; variante controla etiqueta y color; `sugerencias` usa `vidrio-acento` en vez de `iris` |

### Librería de puntajes

`lib/puntajes.ts` es la única fuente de verdad para traducir una banda del
backend (`insuficiente` / `en_desarrollo` / `aceptable` / `solido`) a un color
visual. Agrupa las 4 bandas en 3 niveles (`error` / `progreso` / `exito`):
`insuficiente` y `en_desarrollo` comparten `error`. Los umbrales numéricos
(40/60/80) siguen viviendo solo en `apps/evaluaciones/rubricas.py`.

## Sidebar

`components/layout/Sidebar/` — panel de borde completo: toca los 3 bordes de
la ventana (arriba, izquierda, abajo) sin margen ni radio, fondo `vidrio-ink`,
altura completa. El header arranca exactamente en su esquina superior
derecha, sin hueco de por medio — el color es lo único que marca la costura
entre ambos, sin línea divisoria ni esquina redondeada (ver
`router/RutaProtegida.tsx`). Se compone de `SidebarMarca`,
`SidebarAccionPrincipal`, `SidebarNavItem`, `SidebarPerfil` y el hook
`useSidebar`. Colapsa a una franja de 72px con tooltips por hover/foco, y
entra en "modo enfoque" (auto-colapso) al entrar a `/entrevista/:id`, sin
bloquear la reapertura manual. Los ítems de navegación no llevan divisor ni
barra izquierda de acento — el activo se marca solo con
`bg-white/[0.12]` + texto blanco.

## Autenticación — sistema de diseño aislado (de componentes, no de paleta)

Login y registro **no usan los tokens `tinta`/`iris` ni IBM Plex**. Son una
réplica valor por valor de un mockup de referencia
(`design/login-card.html`), con su propia paleta y tipografía. Ese mismo
lenguaje visual se extendió después a todo el dashboard autenticado como la
familia de tokens `vidrio` (ver [arriba](#vidrio--paleta-del-dashboard-autenticado)) —
los *valores* de color y tipografía son hoy los mismos en ambos, pero login y
registro siguen sin tocar `components/ui/` ni los tokens `vidrio`: usan sus
propios componentes y colores literales, por las razones que siguen.

- **Tipografía:** Fraunces (600, títulos) + Figtree (400/500/600, todo lo
  demás), cargadas en `index.html` — no en `styles/index.css`, para no
  volverlas parte del sistema global. Mismas familias que `--font-serif`
  del dashboard, cargadas en el mismo `<link>`.
- **Colores:** literales, no tokens — `#2b55a3` (acento/acción),
  `#234889` (hover), `#1c2f5e` (texto principal/ink), `#4a5572` (texto
  secundario), `#8a93a8` (muted/placeholder), fondo de página `#e8edf5`. Son
  los mismos valores que `vidrio-acento`/`vidrio-acento-hover`/`vidrio-ink`/
  `vidrio-texto`/`vidrio-muted`/`vidrio-bg`, pero referenciados como
  literales aquí — no se migraron a los tokens en este cambio, para no
  tocar login/registro fuera del alcance pedido. Ningún color de
  `tinta`/`iris` aparece en estas dos pantallas.
- **Componentes propios, no los de `components/ui/`:** `CampoAuth.tsx`
  (campo sin etiqueta visible, ícono + `aria-label`, fondo
  `rgba(255,255,255,.72)`, 52px de alto, radio 10px) e `iconosAuth.tsx`
  (trazos con `stroke-width` 1.6, distinto del resto del sistema). El botón
  principal y el de Google se escriben a mano en cada formulario/en
  `BotonGoogle.tsx` en vez de usar `Boton.tsx`, para no heredar sus colores
  `iris` ni arriesgar que una clase de Tailwind pierda un empate de
  especificidad contra el estilo del componente compartido.
- `TarjetaAuth.tsx` sigue siendo el chrome compartido entre `LoginPage` y
  `RegistroPage` (tarjeta de vidrio `rgba(255,255,255,.55)` + `blur(18px)`,
  logo, título, formulario, divisor, Google, enlace de cambio de vista) —
  ninguna de las dos pantallas puede divergir visualmente por accidente,
  porque comparten una única implementación.

`components/ui/Input.tsx`, `Card.tsx` y `Modal.tsx` quedan sin usar en ningún
lugar del código — no se eliminaron porque siguen siendo componentes
genéricos razonables para un futuro formulario/superficie/diálogo fuera de
auth y del dashboard, pero hoy no los consume nadie, así que no se
recolorearon a `vidrio`: no hay pantalla real donde verificar el resultado.

## Accesibilidad

- Contraste mínimo AA (4.5:1) verificado en cada superficie tocada, incluidos
  los tres pares semánticos (`exito`/`progreso`/`error`, texto sobre fondo),
  el texto sobre `tinta-50`/`tinta-950` (landing) y el texto sobre
  `vidrio-bg`/`vidrio-ink` (dashboard).
- **`tinta-300` solo sobre fondos oscuros** (landing). Sobre blanco o
  `tinta-50` cae a ~2.3:1 (falla AA incluso para texto grande). El texto
  secundario sobre fondos claros usa `tinta-500` (~5.9:1).
- **`vidrio-sidebar-muted` solo sobre el sidebar oscuro** (`vidrio-ink`),
  por la misma razón — no usar sobre superficies claras del dashboard, que
  usan `vidrio-muted`. La variante `fantasma` de `Boton` hereda esta misma
  restricción — hoy solo se usa dentro del sidebar oscuro.
- Anillo de foco visible con `iris-600` (landing) o `vidrio-acento`
  (dashboard) en todo elemento interactivo
  (`focus-visible:outline-iris-600` / `focus-visible:outline-vidrio-acento`).
- Estados que no dependen solo del color: `ChipPuntaje`/`Badge` siempre
  acompañan el color con texto (el número, la etiqueta de la banda).
- Navegación completa por teclado; `aria-label` obligatorio en botones de
  solo ícono; `aria-pressed`/`aria-current` en controles de selección y
  navegación activa.

## Pendiente para la fase de backend

La maqueta de "consola técnica" (`adoptar-consola-tecnica`) pide piezas que
hoy no tienen dato que las respalde. Se omitieron en vez de maquetarse con
datos inventados. Tabla de referencia para cuando se aborde el backend:

| Elemento de la maqueta | Dato que haría falta |
|---|---|
| Tag de tema por pregunta (`SCOPE & HOISTING`) | Campo `tema` en la pregunta generada; hoy `Pregunta` es `{ texto, numero }` |
| Título corto por pregunta | Campo `titulo` en la pregunta, o derivarlo en el evaluador |
| Sub-puntajes Precisión / Claridad / Eficiencia | Tres enteros en `ESQUEMA_EVALUACION` + columnas en `Evaluacion` + migración. La rúbrica real evalúa *corrección técnica, completitud y claridad* — no coincide con los tres nombres de la maqueta; hay que decidir cuál de las dos gana |
| "Diagnóstico de la IA" (párrafo global) | Síntesis a nivel entrevista: una llamada más al cerrar, o un campo en `Entrevista` |
| "Criterios esperados de evaluación" | Lista de criterios emitida junto a la pregunta |
| Banda de la nota promedio (`COMPETENTE · NIVEL BÁSICO`) | `banda_de(promedio)` expuesto en el serializer de `Entrevista` |
| "Corte estándar de contratación: 75 pts" | Umbral de negocio; no existe el concepto |
| Metadatos por área (`Python, JS, Go`) | Campo nuevo en `Area`; hoy solo hay `descripcion` |
| Exportar a PDF | Generación de informe |

## Reglas generales

1. `iris` es el único color de acción de la landing; `vidrio-acento` lo es
   del dashboard autenticado y de login/registro. Los semánticos solo
   expresan estado o puntaje, nunca acción, en ninguno de los dos sistemas.
2. Ningún componente usa colores fuera de estos tokens (o, en login/registro,
   fuera de sus literales documentados arriba).
3. El color o nivel de un puntaje se calcula en un solo lugar
   (`lib/puntajes.ts`), nunca de forma dispersa por archivo.
4. Los íconos de línea son un solo módulo consolidado (`components/ui/Icono.tsx`),
   mismo trazo y grosor en todo el sistema.
