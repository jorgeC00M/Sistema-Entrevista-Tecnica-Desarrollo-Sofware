## Context

Motivación en `proposal.md`; comportamiento en `specs/landing-publica/spec.md`.

Estado actual (`frontend/src/features/landing/`):

- `LandingPage.tsx` carga el catálogo público (`useCatalogos({ publico: true })`)
  y omite las secciones que dependen de él si falla.
- `sections/AreasTecnicas.tsx` + `components/CarruselAreas.tsx`: carrusel atado
  al tipo `Area` (icono por área, niveles como chips). La mecánica vive en
  `hooks/useCarrusel.ts` y en el propio componente (ancho medido con
  `ResizeObserver`, gesto táctil).
- `/api/catalogos/publico/` ya devuelve `puestos[]` con `areas: string[]`
  (códigos); los nombres salen de `areas[]` del mismo payload, igual que en
  `SeleccionPuestoPage.tsx`.
- Iconos: `lib/iconosPorArea.ts` ya tiene `ICONO_POR_PUESTO`.

## Goals / Non-Goals

**Goals:**
- Que cada afirmación de la landing se pueda señalar en el sistema.
- Reutilizar la mecánica del carrusel en lugar de duplicarla para puestos.

**Non-Goals:**
- Rediseño visual: se mantiene el sistema "vidrio", tipografías y animaciones.
- Mostrar datos reales de usuarios en la landing (cifras de uso, testimonios).
- Cambios de backend.

## Decisions

### D1. Carrusel genérico en vez de copiar uno para puestos

`CarruselAreas` se convierte en `CarruselDeTarjetas<T>` con
`elementos: T[]`, `clave: (t) => string`, `etiqueta` (aria-label) y
`renderTarjeta: (t, actual) => ReactNode`. Conserva la medición en píxeles, el
gesto táctil, las flechas, los indicadores y `useCarrusel`. La sección de puestos
le pasa su tarjeta. Se elimina `CarruselAreas`: con dos carruseles casi iguales
el primer arreglo se haría en uno solo.

*Alternativa descartada*: renombrar `CarruselAreas` y cambiarle el tipo a
`Puesto`. Funciona, pero la próxima sección con tarjetas volvería a copiarlo.

### D2. Nombres de áreas desde el mismo payload

La tarjeta de puesto traduce `puesto.areas` (códigos) con un `Map` construido de
`catalogos.areas`, el mismo patrón que `SeleccionPuestoPage.tsx`. Un código sin
nombre se muestra tal cual en vez de ocultarse: así un desajuste del catálogo se
nota.

### D3. Sección de CV estática

`sections/RevisaTuCV.tsx` es contenido fijo (no depende del catálogo): tres
tarjetas con `CLASES_TARJETA_ELEVADA` y la nota de "sin puntaje" con el mismo
formato que la nota de IA de `QueRecibes`. Se renderiza siempre, incluso sin
catálogo.

### D4. Orden y numeración de secciones

Inicio → Cómo funciona (01) → Qué recibes (02) → Revisa tu CV (03) → Puestos
(04) → Cierre. Anclas: `#como-funciona`, `#que-recibes`, `#cv`, `#puestos`. La
lista de secciones del encabezado (`SECCIONES`) y la del pie se actualizan a la
vez; el encabezado observa los ids para marcar el activo, así que solo hay que
cambiar los ids.

### D5. Textos veraces, sin cifras inventadas

- Hero, rastros: "N preguntas por entrevista" (catálogo), "Respuestas
  escritas", "Nota al terminar".
- `FranjaDatos` recibe `puestos`, `preguntas`, `areas`, `niveles`; se elimina
  `PUNTOS_MAXIMOS` (no venía del catálogo).
- `VistaPreviaEntrevista`: encabezado "Entrevista · Desarrollador Backend" y el
  bloque de resultado rotulado "Al terminar la entrevista". Sigue siendo una
  animación ilustrativa; se mantiene el comentario que lo dice.

## Risks / Trade-offs

- [Con 3 puestos, en escritorio el carrusel no se mueve] → es correcto: caben
  todos y la navegación se oculta (comportamiento ya existente). En tableta y
  teléfono sí navega.
- [Textos que vuelvan a quedar desfasados con cambios futuros] → las cifras
  vienen del catálogo; los textos de comportamiento quedan anotados con un
  comentario que señala qué parte del sistema describen.
- [Generalizar el carrusel con un genérico de TS] → el componente se mantiene
  pequeño; la API (`renderTarjeta`) es la única novedad.
