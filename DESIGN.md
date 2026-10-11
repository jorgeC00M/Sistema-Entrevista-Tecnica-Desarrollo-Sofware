---
name: Antesala
description: Practica tu próxima entrevista técnica y revisa tu CV antes de la evaluación real.
colors:
  tinta-de-evaluador: "#2b55a3"
  tinta-de-evaluador-hover: "#234889"
  tinta-de-evaluador-suave: "rgba(43, 85, 163, 0.1)"
  azul-pizarra: "#1c2f5e"
  texto-de-cuaderno: "#4a5572"
  nota-al-margen: "#8a93a8"
  papel-azulado: "#e8edf5"
  vidrio-tarjeta: "rgba(255, 255, 255, 0.55)"
  vidrio-campo: "rgba(255, 255, 255, 0.72)"
  renglon: "rgba(28, 47, 94, 0.12)"
  canto-de-vidrio: "rgba(255, 255, 255, 0.8)"
  pizarra-atenuada: "#9fb0cf"
  exito-texto: "#15803d"
  exito-fondo: "#dcfce7"
  progreso-texto: "#b45309"
  progreso-fondo: "#fef3c7"
  error-texto: "#b91c1c"
  error-fondo: "#fee2e2"
typography:
  display:
    fontFamily: "Fraunces, Georgia, serif"
    fontSize: "clamp(2rem, 5vw, 3.8rem)"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Fraunces, Georgia, serif"
    fontSize: "32px"
    fontWeight: 600
    lineHeight: "40px"
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Fraunces, Georgia, serif"
    fontSize: "20px"
    fontWeight: 600
    lineHeight: "28px"
    letterSpacing: "-0.01em"
  title-sm:
    fontFamily: "Figtree, ui-sans-serif, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 600
    lineHeight: "24px"
  body:
    fontFamily: "Figtree, ui-sans-serif, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: "20px"
  body-sm:
    fontFamily: "Figtree, ui-sans-serif, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: "16px"
  label:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "11px"
    fontWeight: 500
    lineHeight: "14px"
    letterSpacing: "0.04em"
  metric:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "18px"
    fontWeight: 600
    lineHeight: "24px"
    letterSpacing: "-0.02em"
rounded:
  chip: "4px"
  control: "8px"
  campo: "10px"
  vidrio: "18px"
  pildora: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "28px"
  seccion: "clamp(64px, 8vw, 100px)"
components:
  button-primary:
    backgroundColor: "{colors.tinta-de-evaluador}"
    textColor: "#ffffff"
    rounded: "{rounded.pildora}"
    padding: "10px 16px"
    typography: "{typography.body}"
  button-primary-hover:
    backgroundColor: "{colors.tinta-de-evaluador-hover}"
  button-secondary:
    backgroundColor: "#ffffff"
    textColor: "{colors.azul-pizarra}"
    rounded: "{rounded.pildora}"
    padding: "10px 16px"
  button-secondary-hover:
    backgroundColor: "{colors.vidrio-campo}"
  button-glass:
    backgroundColor: "rgba(255, 255, 255, 0.1)"
    textColor: "#ffffff"
    rounded: "{rounded.pildora}"
    padding: "10px 16px"
  button-ghost-sidebar:
    textColor: "{colors.pizarra-atenuada}"
    rounded: "{rounded.control}"
    padding: "6px 12px"
  card:
    backgroundColor: "{colors.vidrio-tarjeta}"
    rounded: "{rounded.vidrio}"
    padding: "20px"
  card-elevated:
    backgroundColor: "{colors.vidrio-tarjeta}"
    rounded: "{rounded.vidrio}"
    padding: "28px"
  input:
    backgroundColor: "{colors.vidrio-campo}"
    textColor: "{colors.azul-pizarra}"
    rounded: "{rounded.campo}"
    height: "52px"
    padding: "0 16px"
  chip-metadata:
    backgroundColor: "{colors.papel-azulado}"
    textColor: "{colors.nota-al-margen}"
    rounded: "{rounded.chip}"
    typography: "{typography.label}"
    padding: "2px 8px"
  chip-metadata-marca:
    backgroundColor: "{colors.tinta-de-evaluador-suave}"
    textColor: "{colors.tinta-de-evaluador}"
    rounded: "{rounded.chip}"
    typography: "{typography.label}"
    padding: "2px 8px"
  nav-item-active:
    backgroundColor: "{colors.tinta-de-evaluador}"
    textColor: "#ffffff"
    rounded: "{rounded.pildora}"
---

# Design System: Antesala

## Overview

**Creative North Star: "El cuaderno del evaluador"**

Antesala se ve como el cuaderno de alguien que evalúa con cuidado: ordenado, preciso y honesto. Las anotaciones se hacen en una sola tinta azul. Los datos exactos —puntajes, contadores, etiquetas— se escriben en monoespaciada, como quien anota medidas. Lo medido y lo sugerido nunca se mezclan en la misma línea. Las páginas son hojas de vidrio claro apoyadas sobre un papel azulado, y solo el margen —la barra lateral— es oscuro, color pizarra.

La precisión no vuelve frío al cuaderno. Los botones son píldoras redondeadas, las tarjetas reaccionan cuando el puntero pasa sobre ellas, y los estados se dicen en verde, ámbar y rojo suaves en vez de alarmas. El tono es el de un evaluador que quiere que el estudiante mejore: claro sobre lo que falla, cálido al acompañarlo.

La densidad es media. Mucho aire en la landing, que persuade, y más compacta en la aplicación, que se usa para trabajar. Títulos en serif con carácter; todo lo demás en una sans legible.

**Key Characteristics:**
- Una sola tinta de acción: Tinta de Evaluador (#2b55a3).
- Vidrio translúcido con desenfoque sobre papel azulado; la profundidad viene de las capas, no de las sombras.
- Tres voces tipográficas con papeles fijos: Fraunces titula, Figtree explica y JetBrains Mono mide.
- Color semántico solo para estados, siempre en pareja de texto y fondo.
- Formas suaves: tarjetas de 18px, botones en píldora y chips casi rectos.

## Colors

Una sola familia de azules con un único acento; el color fuera del azul solo comunica estado.

### Primary
- **Tinta de Evaluador** (#2b55a3): la única tinta de acción. Botones principales, enlaces, el elemento activo del menú, barras de progreso, el foco de teclado y los iconos de marca. Su versión al pasar el puntero es **Tinta Asentada** (#234889).
- **Tinta Diluida** (rgba(43,85,163,0.1)): fondo de los chips de marca, de los iconos en las tarjetas de la landing y de los estados activos suaves.

### Neutral
- **Azul Pizarra** (#1c2f5e): títulos y fondo de la barra lateral; también la base oscura de los degradados del hero y del cierre de la landing.
- **Texto de Cuaderno** (#4a5572): texto corrido.
- **Nota al Margen** (#8a93a8): texto secundario, fechas, metadatos y etiquetas atenuadas.
- **Papel Azulado** (#e8edf5): el fondo de toda la aplicación y de la landing.
- **Vidrio Tarjeta** (rgba(255,255,255,0.55)) y **Vidrio Campo** (rgba(255,255,255,0.72)): superficies de tarjetas y de campos o paneles internos.
- **Renglón** (rgba(28,47,94,0.12)): divisorias y bordes finos sobre superficies claras.
- **Canto de Vidrio** (rgba(255,255,255,0.8)): el borde claro que define cada tarjeta.
- **Pizarra Atenuada** (#9fb0cf): texto secundario sobre la barra lateral oscura, nunca sobre superficies claras.

### Semantic
- **Éxito** (#15803d sobre #dcfce7), **Progreso** (#b45309 sobre #fef3c7) y **Error** (#b91c1c sobre #fee2e2): bandas de puntaje, requisitos demostrados, declarados o ausentes, hallazgos y alertas.

### Named Rules
**The One Ink Rule.** Tinta de Evaluador es la única tinta de acción. No existe un segundo color de marca; si algo necesita destacar, se usa Tinta Diluida o el peso tipográfico, no otro tono.

**The State-Only Color Rule.** Verde, ámbar y rojo solo comunican estado, nunca decoran, y siempre van como pareja de texto y fondo.

**The Gradient Boundary Rule.** Los degradados solo existen en el hero y en el cierre de la landing, y solo con la familia azul (#16254b, #1c2f5e, #2b55a3; acentos #5b86d4, #bcd0f5, #dfe8fb). En la aplicación no hay degradados.

## Typography

**Display Font:** Fraunces (con Georgia, serif)
**Body Font:** Figtree (con ui-sans-serif, system-ui)
**Label/Mono Font:** JetBrains Mono (con ui-monospace, Cascadia Code)

**Character:** Fraunces le da al título el peso de un encabezado escrito a mano con cuidado; Figtree es clara y amable para leer; JetBrains Mono es la voz de la medida exacta.

### Hierarchy
- **Display** (600, de 2rem a 3.8rem según el ancho, interlineado 1.1, −0.02em): solo el título del hero de la landing.
- **Headline** (600, 32px/40px, −0.02em): el título de cada página de la aplicación.
- **Title** (600, 20px/28px, −0.01em, Fraunces): títulos de sección y de tarjetas importantes.
- **Title-sm** (600, 16px/24px, Figtree): títulos de tarjetas y bloques de formulario.
- **Body** (400, 14px/20px; 16px en introducciones): texto corrido. Líneas largas limitadas a unos 65–75 caracteres.
- **Body-sm** (400, 12px/16px): notas al pie y aclaraciones.
- **Label** (500, 11px/14px, 0.04em, MAYÚSCULAS, mono): etiquetas de metadato, fases, estados y rótulos como "Sugerencia de IA".
- **Metric** (600, 18px/24px, −0.02em, mono): contadores como "03 / 05" y cifras exactas.

### Named Rules
**The Three Voices Rule.** Fraunces titula, Figtree explica, JetBrains Mono mide. Una cifra exacta nunca va en Figtree; un párrafo nunca va en mono.

**The Quiet Score Rule.** Un puntaje es un dato del cuaderno, no un trofeo: se escribe en mono, a tamaño de métrica o título, nunca como la pieza más grande de la pantalla.

## Layout

La aplicación usa una barra lateral fija de 256px (72px plegada) a partir de 1024px, y un cajón en pantallas menores, con una cabecera clara de 64px. El contenido principal lleva un relleno de 16, 24 o 32px según el ancho. Cada página limita su ancho de lectura (entre 672 y 1024px). La pantalla de selección de puesto usa dos columnas con un panel lateral pegajoso desde 1024px.

La landing usa un contenedor de hasta 1280px con márgenes fluidos (clamp(20px, 4vw, 56px)) y secciones con aire vertical de clamp(64px, 8vw, 100px).

El ritmo es la escala de 4px: 4, 8, 16, 24 y 28px. Las rejillas de tarjetas usan separaciones de 20–24px y pasan de una a tres columnas según el ancho.

Debe funcionar completa en el celular: toda función se puede usar en una columna.

## Elevation & Depth

La profundidad viene de capas de vidrio translúcido con desenfoque (backdrop-filter: blur(18px)) sobre el papel azulado, no de sombras. En reposo, las superficies de la aplicación son planas. Solo las tarjetas de la landing llevan una sombra ambiental casi imperceptible, y la elevación clara aparece únicamente como respuesta al puntero.

### Shadow Vocabulary
- **Ambiental en reposo** (`box-shadow: 0 8px 24px -12px rgba(28,47,94,0.18)`): tarjetas de la landing en reposo.
- **Elevación al pasar el puntero** (`box-shadow: 0 26px 50px -26px rgba(28,47,94,0.4)`): la misma tarjeta al subir 6px con el puntero encima.
- **Tarjeta al frente del carrusel** (`box-shadow: 0 26px 50px -24px rgba(28,47,94,0.45)`): la tarjeta activa del carrusel de puestos.

### Named Rules
**The Glass-Not-Shadow Rule.** La jerarquía la dan la transparencia, el desenfoque y el canto claro. Una sombra marcada solo aparece como respuesta a la interacción, nunca para decorar.

## Shapes

Formas suaves con tres radios con papel fijo: 18px para tarjetas y paneles de vidrio, 8px para controles y 4px para chips de metadato. Los campos de acceso usan 10px. Los botones de acción, las etiquetas de estado y el elemento activo del menú son píldoras completas. Los bordes son de 1px: claros (Canto de Vidrio) en las tarjetas y Renglón en las divisorias.

## Components

### Buttons
Cálidos y seguros: píldoras que cambian de tono sin brusquedad.
- **Shape:** píldora completa (9999px) en acciones principales; 8px en botones de control.
- **Primary:** Tinta de Evaluador con texto blanco, peso 500, 10px × 16px.
- **Hover / Focus:** pasa a Tinta Asentada en 150ms; foco con contorno de 2px en Tinta de Evaluador separado 2px.
- **Secondary:** blanco con texto Azul Pizarra y un anillo de 1px en Renglón; al pasar el puntero, Vidrio Campo.
- **Glass (sobre fondos oscuros):** blanco al 10 % con texto blanco y anillo blanco al 25 %.
- **Ghost (barra lateral):** texto Pizarra Atenuada que pasa a blanco sobre un fondo blanco al 10 %.
- **Disabled:** 50 % de opacidad y cursor no permitido.

### Chips
- **Metadato:** JetBrains Mono, 11px, mayúsculas, sobre Papel Azulado o Tinta Diluida; radio de 4px.
- **Puntaje:** píldora en mono con el par de color de su banda (éxito, progreso o error).

### Cards / Containers
- **Corner Style:** 18px.
- **Background:** Vidrio Tarjeta con desenfoque de 18px.
- **Shadow Strategy:** plana en la aplicación; en la landing, sombra ambiental y elevación al pasar el puntero (ver Elevation & Depth).
- **Border:** 1px en Canto de Vidrio; en hover de la landing pasa a Tinta de Evaluador al 35 %.
- **Internal Padding:** 16–20px en la aplicación; 28px en la landing.

### Inputs / Fields
- **Style:** 52px de alto, Vidrio Campo, borde de 1px y radio de 10px, con el icono del campo a la izquierda.
- **Focus:** el borde pasa a Tinta de Evaluador.
- **Error:** borde y mensaje en el color de error, anunciado a lectores de pantalla.

### Navigation
- **Barra lateral:** fondo Azul Pizarra. Los elementos se muestran en Pizarra Atenuada; el activo es una píldora rellena de Tinta de Evaluador con texto blanco. La acción principal, "Nueva entrevista", es otra píldora de tinta.
- **Cabecera:** clara, de 64px, con el nombre de la sección actual (no el de la aplicación).
- **Landing:** barra flotante de vidrio que es oscura sobre el hero y clara después, y marca la sección visible.

### Sugerencia de IA
Lo que propone la IA va siempre rotulado con "Sugerencia de IA" en etiqueta mono y sobre Tinta Diluida, separado visualmente de lo medido.

## Do's and Don'ts

### Do:
- **Do** usar Tinta de Evaluador (#2b55a3) como único color de acción, y Tinta Diluida para los fondos suaves de marca.
- **Do** escribir toda cifra exacta (puntajes, contadores, conteos como "5/8") en JetBrains Mono.
- **Do** construir la profundidad con vidrio translúcido, desenfoque de 18px y canto claro; la sombra marcada solo con el puntero encima.
- **Do** rotular siempre como "Sugerencia de IA" lo que no es medido.
- **Do** hacer que cada estado se lea sin depender solo del color: icono o texto además del par de color.
- **Do** cumplir WCAG 2.1 AA y respetar "reducir movimiento" (las animaciones se anulan).

### Don't:
- **Don't** usar degradados morados, neón ni la estética genérica de "app de IA".
- **Don't** presentar un puntaje grande y llamativo como protagonista de la pantalla.
- **Don't** usar ilustraciones genéricas ni fotos de stock.
- **Don't** introducir un segundo color de marca ni otros tonos de azul fuera de esta paleta.
- **Don't** usar verde, ámbar o rojo como decoración.
- **Don't** poner degradados en la aplicación; solo en el hero y en el cierre de la landing.
