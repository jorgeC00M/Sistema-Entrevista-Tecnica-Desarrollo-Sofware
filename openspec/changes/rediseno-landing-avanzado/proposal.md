## Why

La landing pública ya adoptó la paleta y tipografía del sistema "vidrio"
(acento `#2b55a3`, Fraunces/Figtree, tarjetas translúcidas) en una ronda
anterior, pero sigue siendo una página estática de secciones apiladas: sin
navegación flotante, sin animaciones más allá de un fundido al hacer scroll,
con una cuadrícula fija de áreas y un footer de tres columnas. El usuario
proporcionó un mockup de referencia (`landing.html`, en la raíz del repo)
con una experiencia bastante más elaborada — navbar de vidrio con scroll-spy,
un hero a pantalla completa con una vista previa animada de una entrevista,
contadores animados, un layout "bento" para la sección de resultados y un
carrusel interactivo de áreas — y pide igualar esa experiencia en la landing
real, adaptada al stack del proyecto (React 19 + TypeScript + Tailwind CSS
v4), sin pegar el HTML tal cual y sin duplicar los tokens de color que ya
existen.

## What Changes

- Navbar flotante de vidrio (`HeaderLanding.tsx`): recuadro separado de los
  bordes, cambia de "oscura sobre el hero" a "clara al hacer scroll"
  (`IntersectionObserver`), enlace activo según la sección visible, enlace
  "Inicio" nuevo.
- Hero a pantalla completa (`min-height: 100svh`) con fondo degradado azul,
  cuadrícula tenue y resplandor animado, más una tarjeta de vista previa de
  entrevista (pregunta de la IA, respuesta que se escribe sola, anillo de
  puntuación) que se reproduce en bucle — contenido ilustrativo, no datos
  reales de ninguna entrevista.
- Franja de datos nueva: tarjeta de vidrio con 4 contadores que animan desde
  0 al entrar en pantalla (preguntas, áreas y niveles se leen del catálogo
  público ya cargado; "100 puntos" es la escala fija de la rúbrica).
- Encabezados de sección más compactos (número de fase en píldora + título
  Fraunces + línea inferior), reutilizando el patrón `EtiquetaMono` que ya
  existe.
- "Cómo funciona": tarjetas con una línea de progreso que se llena al entrar
  en pantalla.
- "Qué recibes al terminar": layout bento con medidor circular animado y
  barras de rúbrica (datos ilustrativos, misma naturaleza que la vista
  previa del hero), más tarjetas de fortalezas/debilidades/sugerencias.
- **BREAKING (para el propio contenido de la landing, no para la API ni la
  autenticación)**: la cuadrícula fija de tarjetas de área se reemplaza por
  un carrusel interactivo (3/2/1 tarjetas visibles según ancho, avance
  automático cada 3.5s, flechas, indicadores, pausa al pasar el mouse,
  deslizamiento táctil) que sigue leyendo las áreas y niveles reales del
  catálogo público — nunca se agregan las áreas de ejemplo del mockup
  ("Redes y Seguridad", "Ingeniería de Software").
- El footer grande de tres columnas se reemplaza por un footer compacto de
  dos filas.
- Se elimina la etiqueta "Para egresados de Ingeniería de Sistemas · UMSS"
  bajo el header.
- Todas las animaciones (contadores, barras, carrusel, scroll-reveal,
  parpadeo del cursor de la demo) respetan `prefers-reduced-motion`.
- Los botones "Crear cuenta", "Crear cuenta gratis", "Iniciar sesión" y "Ya
  tengo cuenta" conservan exactamente sus destinos actuales (`/registro`,
  `/login`) — solo cambia su estilo.

## Capabilities

### New Capabilities

(ninguna — es una evolución de la landing ya existente, no una pantalla
nueva)

### Modified Capabilities

- `landing-publica`: se agregan requisitos de comportamiento nuevos que no
  estaban cubiertos por la spec original (que solo hablaba de contenido
  estático): la exploración de áreas pasa a ser un carrusel navegable con
  varias formas de interacción (flechas, indicadores, teclado táctil), y se
  agrega el requisito de que toda animación introducida respete
  `prefers-reduced-motion`. Los requisitos existentes (ruta pública, origen
  de datos del backend, vías de registro/login, identificación académica,
  usabilidad en pantallas pequeñas) no cambian de fondo, solo se satisfacen
  con una implementación visual distinta.

## Impact

- Frontend únicamente — no toca `backend/`, rutas, autenticación, ni el
  catálogo público (`useCatalogosPublicos`, ya usado hoy).
- Archivos de `frontend/src/features/landing/**` (componentes y secciones),
  más el hook `useRevelarAlEntrar` (se reutiliza/extiende, no se duplica) y
  posibles hooks nuevos exclusivos de la landing (contador animado, carrusel,
  scroll-spy del navbar) — ver `design.md` para el detalle de dónde vive
  cada pieza.
- No se agregan dependencias nuevas de npm: el mockup de referencia no usa
  ninguna librería (todo es CSS + `IntersectionObserver`/`setInterval` a
  mano), y el proyecto ya evita dependencias de UI/animación por decisión
  previa documentada en `docs/arquitectura.md`.
- No se duplican tokens de color: se reutilizan los `--color-vidrio-*` ya
  definidos en `styles/index.css` (ver `design.md` para el mapeo exacto
  mockup → tokens existentes, incluyendo los casos donde el mockup usa un
  tono nuevo que en realidad ya existe con otro nombre en el proyecto).
