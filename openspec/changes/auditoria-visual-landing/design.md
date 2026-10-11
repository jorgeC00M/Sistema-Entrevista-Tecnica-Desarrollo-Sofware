## Context

Motivación en `proposal.md`; requisitos en `specs/landing-publica/spec.md`.

**Método.** Auditoría de lectura de código de `frontend/src/features/landing/`,
`src/styles/index.css` e `index.html`, con:
- la lista de auditoría de la skill `redesign-existing-projects` (taste skills);
- las reglas de `DESIGN.md` ("El cuaderno del evaluador") y `PRODUCT.md`;
- contraste calculado con la fórmula WCAG sobre los colores reales;
- principios del diseño de producto tipo Linear o Stripe como referencia de
  oficio: titulares de tracking negativo, una sola tinta, bordes finos en lugar
  de sombras, composición asimétrica, el producto real como imagen principal, y
  cifras en mono o tabulares.

**Límites honestos.**
- El detector de Impeccable (`impeccable detect`) no reportó hallazgos: lee
  HTML/CSS y la landing es JSX que se arma en tiempo de ejecución, así que no la
  cubre. Para una pasada automática hace falta el sitio corriendo
  (`impeccable detect http://localhost:5173`).
- `awesome-design-md` no está instalado en el proyecto. Las referencias a Linear
  y Stripe son principios generales de oficio, no la lectura de sus archivos.
- No se tomaron capturas: el diagnóstico es de código.

**Lo que ya está bien y se conserva:**
- la pareja Fraunces + Figtree, que no es la Inter genérica;
- la idea de una sola tinta azul;
- la vista previa animada del producto en el hero, que es la mejor pieza de la
  landing porque muestra el producto real;
- el enlace "saltar al contenido", `scroll-behavior: smooth` y el respeto a
  "reducir movimiento";
- `min-h-[100svh]` en lugar de `100vh`, y los contenidos verídicos.

## Diagnóstico

### 1. Lo que se ve genérico ("slop")

| # | Elemento | Dónde | Por qué es genérico | Propuesta |
|---|---|---|---|---|
| S1 | Hero centrado sobre degradado azul marino → azul, con cuadrícula enmascarada y un resplandor que "respira" | `sections/Hero.tsx` | Es la firma más reconocible de una landing hecha por IA: todo centrado, degradado azul y efectos de ambiente que no dicen nada del producto | Hero **asimétrico**: titular y CTA alineados a la izquierda en una columna, y la vista previa del producto grande a la derecha, sobresaliendo del pliegue. Se quitan la cuadrícula y el resplandor; el degradado pasa a un fondo casi plano (ver paleta) |
| S2 | Fila de "rastros" con tres checks bajo los botones | `Hero.tsx` | Fila de confianza de plantilla; los checks no aportan información | Una sola línea de texto en mono, sin iconos: "5 preguntas · nota al terminar · sin agendar" |
| S3 | Botón lleno + botón fantasma, repetido idéntico en el hero y en el cierre | `AccionesDeRegistro.tsx` | Par de botones por defecto de toda landing generada | El principal se mantiene; "Ya tengo cuenta" pasa a un **enlace de texto** con flecha, no a un segundo botón |
| S4 | Títulos de sección con píldora numerada "01 / 02 / 03 / 04" | `components/EncabezadoSeccion.tsx` | La numeración es decoración sin significado: las secciones no son pasos | Se quita el número. El título se apoya en un rótulo corto en mono ("La entrevista", "Tu CV") o directamente en el titular |
| S5 | "Cómo funciona": tres tarjetas iguales con un círculo numerado y una línea que se llena | `sections/ComoFunciona.tsx` | El "3 pasos" con tres columnas iguales es el patrón más repetido | Lista vertical de pasos en el margen izquierdo, junto a una sola captura grande del paso actual. O bien dos columnas: pasos a la izquierda y la vista previa del chat a la derecha |
| S6 | "Revisa tu CV": otra fila de tres tarjetas iguales | `sections/RevisaTuCV.tsx` | Repite la misma composición que S5 y que "Qué recibes" | Un **ejemplo real** del espejo del ATS (la ficha de 8 campos con uno marcado como "no detectado") como pieza principal, con los tres puntos como texto al lado |
| S7 | Todas las tarjetas: vidrio + icono en cuadrado de 44 px + título + texto | `TarjetaDeFuncion.tsx`, `ComoFunciona.tsx` | "Icono en cuadrado redondeado sobre el título" es el componente de tarjeta por defecto | Quitar el cuadrado: el icono va en línea con el título, a tamaño de texto, o se elimina. La tarjeta se diferencia por su contenido, no por la caja |
| S8 | Franja de cifras animadas "3 puestos · 5 preguntas · 7 áreas · 3 niveles" | `components/FranjaDatos.tsx` | Barra de estadísticas de plantilla. Con números tan pequeños, el contador animado resta credibilidad en lugar de sumar | Eliminar la franja. Esos datos ya aparecen, con contexto, en "Puestos" y en el hero |
| S9 | Medidor grande y animado "85 de 100" en "Qué recibes" | `sections/QueRecibes.tsx` | Rompe la regla propia **Quiet Score** de `DESIGN.md` (el puntaje es un dato, no un trofeo) y es una cifra inventada para la demo | Sustituir por un fragmento real de un resultado: la pregunta, la respuesta resumida y la retroalimentación en tres líneas, con el puntaje como chip pequeño en mono |
| S10 | Cierre en bloque azul con dos manchas desenfocadas | `sections/CierreCTA.tsx` | Sección de color "pegada" en una página clara, con manchas de relleno (también marcado por la auditoría de las taste skills) | Cierre sobre el mismo fondo claro, con el titular grande, un solo botón y debajo el aviso de honestidad de la IA |
| S11 | Radios muy redondeados y píldoras en todo (12 usos de `rounded-full`, tarjetas de 18 px) | toda la landing | Un mismo radio blando en todo aplana la jerarquía | Radios con papel: 12 px en tarjetas, 8 px en controles, píldora **solo** en el botón principal y los chips de estado |

### 2. Tipografía, jerarquía y espaciado

| # | Problema | Evidencia | Propuesta |
|---|---|---|---|
| T1 | Salto brusco entre el titular del hero (hasta 3,8 rem) y los títulos de sección (1,5 a 1,9 rem); las secciones no tienen presencia | `Hero.tsx`, `EncabezadoSeccion.tsx` | Escala con proporción ~1,25: display `clamp(2.5rem, 5vw, 4.25rem)`, títulos de sección `clamp(1.75rem, 3vw, 2.5rem)`, títulos de tarjeta 1.125 rem, cuerpo 1 rem, meta 0.8125 rem |
| T2 | 15 tamaños arbitrarios en las secciones (`text-[0.96rem]`, `[1.15rem]`, `[0.86rem]`, `[0.88rem]`…) | grep en `features/landing` | Tokens en `@theme` (`--text-display`, `--text-seccion`, `--text-tarjeta`, `--text-meta`) y ningún valor suelto |
| T3 | El tracking negativo solo existe en el titular del hero | `Hero.tsx` | `-0.02em` en display y `-0.015em` en títulos de sección; positivo solo en las etiquetas mono |
| T4 | JetBrains Mono se usa a 600 (`metric-counter`), pero solo se carga 500: el navegador simula la negrita | `index.html` (pesos cargados), `index.css` | Cargar `JetBrains+Mono:wght@500;600` y `font-variant-numeric: tabular-nums` en cifras |
| T5 | Párrafos con anchos fijos distintos (600 px, 640 px, 560 px, 760 px) | Hero, EncabezadoSeccion, CierreCTA, notas | Un solo ancho de lectura: `max-w-[62ch]` |
| T6 | Espaciado de secciones con `clamp` repetidos a mano y separaciones mezcladas (`gap-5`, `gap-6`, `mb-9`, `mt-[22px]`) | todas las secciones | Escala de 8 px con tres ritmos con nombre: dentro de un bloque (16 px), entre bloques (32 px) y entre secciones (`clamp(80px, 10vw, 128px)`, más aire que hoy) |
| T7 | Todo centrado (hero, cierre, encabezados) | Hero, CierreCTA | Alineación a la izquierda por defecto, con el centrado reservado para el cierre |

### 3. Paleta: corregida y refinada

La identidad se mantiene: una sola **Tinta de Evaluador**, sobre neutros azulados. Las correcciones atacan contraste y cuerpo, no el carácter.

**Contraste medido con los colores reales:**

| Par | Contraste | Requisito AA | Estado |
|---|---|---|---|
| `vidrio-muted` #8a93a8 sobre fondo #e8edf5 | 2,62 : 1 | 4,5 : 1 | ❌ falla |
| `vidrio-muted` #8a93a8 sobre blanco | 3,08 : 1 | 4,5 : 1 | ❌ falla |
| Blanco al 70 % sobre la parte inferior del hero (#2b55a3) | 4,42 : 1 | 4,5 : 1 | ❌ falla por poco (texto pequeño) |
| `vidrio-texto` #4a5572 sobre fondo | 6,30 : 1 | 4,5 : 1 | ✅ |
| Acento #2b55a3 sobre fondo | 6,09 : 1 | 4,5 : 1 | ✅ |
| Blanco sobre acento | 7,16 : 1 | 4,5 : 1 | ✅ |
| `progreso-texto` sobre `progreso-fondo` | 4,51 : 1 | 4,5 : 1 | ✅ (justo) |

**Paleta propuesta:**

| Token | Hoy | Propuesta | Motivo |
|---|---|---|---|
| `vidrio-muted` (texto secundario) | #8a93a8 | **#5f6984** | 4,65:1 sobre el fondo y 5,47:1 sobre blanco. #8a93a8 queda solo para iconos y bordes decorativos (`vidrio-tenue`) |
| `vidrio-bg` | #e8edf5 | **#eef2f8** | Fondo un punto más claro; mejora la separación con las tarjetas sin perder el tono azulado |
| `vidrio-card` | blanco al 55 % | **blanco al 78 %** + borde `vidrio-linea` | Las tarjetas al 55 % casi no se distinguen del fondo. Con más opacidad y un borde fino de 1 px (el recurso de Linear y Stripe) se leen sin sombra |
| `vidrio-borde` (canto blanco) | blanco al 80 % | se mantiene solo en el vidrio sobre fondos oscuros | Sobre fondo claro, un borde blanco no se ve; ahí manda `vidrio-linea` |
| Degradado del hero | #16254b → #1c2f5e → #2b55a3 | **#132042 → #1c2f5e** (sin bajar al acento) | El fondo se mantiene oscuro y el texto pequeño blanco al 75 % supera 4,5:1. El acento queda para el botón, que vuelve a destacar |
| Acento, ink y semánticos | — | sin cambios | Ya cumplen y son la identidad |

Con esto **ningún color nuevo entra a la paleta**: se ajustan valores y se
separa el gris decorativo del gris de texto.

## Decisions

- **D1. Refinamiento, no rediseño.** Se conservan identidad, contenido y
  componentes: es la regla "refinement preserves" de Impeccable. Lo genérico se
  sustituye pieza a pieza.
- **D2. Por fases, de más impacto y menos riesgo a más**, siguiendo el orden de
  `redesign-existing-projects`: (1) paleta y contraste, (2) escala
  tipográfica, (3) metadatos, (4) composición sección por sección.
- **D3. Los tokens cambian en un solo sitio** (`index.css`) y se reflejan en
  `DESIGN.md` y `.impeccable/design.json`, para que Impeccable y las taste
  skills lean lo mismo.
- **D4. Se descartan los consejos de la skill que chocan con el producto:**
  imágenes de picsum o stock (prohibidas en `DESIGN.md`), ruido o grano y
  efectos 3D (penalizan la carga en conexiones lentas, un requisito de
  `PRODUCT.md`), y cambiar las fuentes (la pareja actual ya tiene carácter).

## Risks / Trade-offs

- [Subir la opacidad del vidrio reduce el efecto "vidrio"] → se conserva el
  desenfoque y el canto en el hero oscuro, donde el efecto sí se ve.
- [Cambiar `vidrio-muted` afecta también a la aplicación] → es una mejora de
  accesibilidad deseada. Se revisa visualmente el dashboard tras el cambio.
- [Quitar la franja de cifras y el medidor deja menos "movimiento"] → la vista
  previa animada del hero sigue siendo el elemento vivo, y el que tiene sentido.

## Open Questions

- ¿Hay capturas reales de la app (chat de entrevista, espejo del ATS) para usar
  en lugar de reconstrucciones en código? Si no, las fases 4 y 5 reconstruyen
  fragmentos con datos de ejemplo verídicos (sin cifras inventadas).
