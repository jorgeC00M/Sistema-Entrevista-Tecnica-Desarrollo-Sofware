---
name: Antesala
description: Practica tu próxima entrevista técnica y revisa tu CV antes de la evaluación real.
colors:
  tinta-de-evaluador: "#2b55a3"
  tinta-de-evaluador-hover: "#234889"
  tinta-de-evaluador-suave: "rgba(43, 85, 163, 0.1)"
  azul-pizarra: "#1c2f5e"
  texto-de-cuaderno: "#4a5572"
  nota-al-margen: "#5f6984"
  lapiz-tenue: "#8a93a8"
  papel-azulado: "#eef2f8"
  vidrio-tarjeta: "rgba(255, 255, 255, 0.78)"
  vidrio-campo: "rgba(255, 255, 255, 0.72)"
  renglon: "rgba(28, 47, 94, 0.12)"
  hilo-de-tinta: "rgba(28, 47, 94, 0.1)"
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
    fontSize: "clamp(2.5rem, 5vw, 4.25rem)"
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: "-0.025em"
  seccion:
    fontFamily: "Fraunces, Georgia, serif"
    fontSize: "clamp(1.75rem, 3vw, 2.5rem)"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.015em"
  tarjeta:
    fontFamily: "Figtree, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "-0.005em"
  entrada:
    fontFamily: "Figtree, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.6
  meta:
    fontFamily: "Figtree, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.45
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
  vidrio: "12px"
  pildora: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "28px"
  seccion: "clamp(80px, 10vw, 128px)"
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
  button-ghost-sidebar:
    textColor: "{colors.pizarra-atenuada}"
    rounded: "{rounded.control}"
    padding: "6px 12px"
  card:
    backgroundColor: "{colors.vidrio-tarjeta}"
    rounded: "{rounded.vidrio}"
    padding: "20px"
  input:
    backgroundColor: "{colors.vidrio-campo}"
    textColor: "{colors.azul-pizarra}"
    rounded: "{rounded.campo}"
    height: "52px"
    padding: "0 16px"
  chip-metadata:
    backgroundColor: "{colors.vidrio-campo}"
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

La densidad es media. Mucho aire en la landing, que persuade, y más compacta en la aplicación, que se usa para trabajar. Títulos en serif con carácter; todo lo demás en una sans legible. La composición es asimétrica y alineada a la izquierda: el producto real —la vista previa de la entrevista, la ficha del ATS, un resultado— es la imagen, no los iconos ni las cifras.

**Key Characteristics:**
- Una sola tinta de acción: Tinta de Evaluador (#2b55a3).
- Vidrio translúcido con desenfoque sobre papel azulado; la profundidad viene de las capas, no de las sombras.
- Tres voces tipográficas con papeles fijos: Fraunces titula, Figtree explica y JetBrains Mono mide.
- Color semántico solo para estados, siempre en pareja de texto y fondo.
- Formas suaves: tarjetas de 12px, píldora solo en la acción principal y en los chips de estado.

## Colors

Una sola familia de azules con un único acento; el color fuera del azul solo comunica estado.

### Primary
- **Tinta de Evaluador** (#2b55a3): la única tinta de acción. Botones principales, enlaces, el elemento activo del menú, barras de progreso, el foco de teclado y los iconos de marca. Su versión al pasar el puntero es **Tinta Asentada** (#234889).
- **Tinta Diluida** (rgba(43,85,163,0.1)): fondo de los chips de marca, de los iconos en las tarjetas de la landing y de los estados activos suaves.

### Neutral
- **Azul Pizarra** (#1c2f5e): títulos y fondo de la barra lateral; también la base oscura de los degradados del hero y del cierre de la landing.
- **Texto de Cuaderno** (#4a5572): texto corrido.
- **Nota al Margen** (#5f6984): texto secundario, fechas, metadatos y etiquetas. Cumple WCAG AA (4,65:1 sobre el fondo; 5,47:1 sobre blanco).
- **Lápiz Tenue** (#8a93a8): solo para lo que no es texto —iconos decorativos, marcas de lista, puntos—. Como texto daba 2,62:1 y no cumple.
- **Papel Azulado** (#eef2f8): el fondo de toda la aplicación y de la landing.
- **Vidrio Tarjeta** (rgba(255,255,255,0.78)) y **Vidrio Campo** (rgba(255,255,255,0.72)): superficies de tarjetas y de campos o paneles internos.
- **Renglón** (rgba(28,47,94,0.12)): divisorias y bordes finos sobre superficies claras.
- **Hilo de Tinta** (rgba(28,47,94,0.1)): el borde fino de tarjetas y campos. Antes era blanco y no se veía sobre el fondo claro.
- **Pizarra Atenuada** (#9fb0cf): texto secundario sobre la barra lateral oscura, nunca sobre superficies claras.

### Semantic
- **Éxito** (#15803d sobre #dcfce7), **Progreso** (#b45309 sobre #fef3c7) y **Error** (#b91c1c sobre #fee2e2): bandas de puntaje, requisitos demostrados, declarados o ausentes, hallazgos y alertas.

### Named Rules
**The One Ink Rule.** Tinta de Evaluador es la única tinta de acción. No existe un segundo color de marca; si algo necesita destacar, se usa Tinta Diluida o el peso tipográfico, no otro tono.

**The State-Only Color Rule.** Verde, ámbar y rojo solo comunican estado, nunca decoran, y siempre van como pareja de texto y fondo.

**The Gradient Boundary Rule.** El único degradado es el fondo del hero de la landing, casi plano, de #132042 a #1c2f5e. No baja hasta el acento: así el botón es el único azul vivo de la pantalla. En el resto de la landing y en la aplicación no hay degradados.

**The Readable Gray Rule.** Todo texto supera 4,5:1. Nota al Margen es el gris más claro permitido para texto; Lápiz Tenue no se usa para letras.

## Typography

**Display Font:** Fraunces (con Georgia, serif)
**Body Font:** Figtree (con ui-sans-serif, system-ui)
**Label/Mono Font:** JetBrains Mono (con ui-monospace, Cascadia Code)

**Character:** Fraunces le da al título el peso de un encabezado escrito a mano con cuidado; Figtree es clara y amable para leer; JetBrains Mono es la voz de la medida exacta.

### Hierarchy
- **Display** (600, de 2.5rem a 4.25rem según el ancho, interlineado 1.05, −0.025em): solo el título del hero de la landing.
- **Sección** (600, de 1.75rem a 2.5rem, interlineado 1.15, −0.015em, Fraunces): títulos de sección de la landing.
- **Tarjeta** (600, 1.125rem, Figtree): títulos de elementos y tarjetas de la landing.
- **Entrada** (400, 1.125rem, interlineado 1.6): el párrafo que acompaña a un titular, hasta 52ch.
- **Meta** (400, 0.8125rem): metadatos, notas y filas de ejemplo.
- **Headline** (600, 32px/40px, −0.02em): el título de cada página de la aplicación.
- **Title** (600, 20px/28px, −0.01em, Fraunces): títulos de sección y de tarjetas importantes.
- **Title-sm** (600, 16px/24px, Figtree): títulos de tarjetas y bloques de formulario.
- **Body** (400, 14px/20px en la aplicación; 16px en la landing): texto corrido, hasta 62ch.
- **Body-sm** (400, 12px/16px): notas al pie y aclaraciones.
- **Label** (500, 11px/14px, 0.04em, MAYÚSCULAS, mono): etiquetas de metadato, fases, estados y rótulos como "Sugerencia de IA".
- **Metric** (600, 18px/24px, −0.02em, mono): contadores como "03 / 05" y cifras exactas.

### Named Rules
**The Three Voices Rule.** Fraunces titula, Figtree explica, JetBrains Mono mide. Una cifra exacta nunca va en Figtree; un párrafo nunca va en mono.

**The Quiet Score Rule.** Un puntaje es un dato del cuaderno, no un trofeo: se escribe en mono, a tamaño de métrica o título, nunca como la pieza más grande de la pantalla.

## Layout

La aplicación usa una barra lateral fija de 256px (72px plegada) a partir de 1024px, y un cajón en pantallas menores, con una cabecera clara de 64px. El contenido principal lleva un relleno de 16, 24 o 32px según el ancho. Cada página limita su ancho de lectura (entre 672 y 1024px). La pantalla de selección de puesto usa dos columnas con un panel lateral pegajoso desde 1024px.

La landing usa un contenedor de hasta 1280px con márgenes fluidos (clamp(20px, 4vw, 56px)) y secciones con aire vertical de clamp(80px, 10vw, 128px). Cada sección es asimétrica: texto y lista a un lado, una sola pieza del producto al otro, y ninguna repite la composición de otra.

El ritmo es la escala de 4px: 4, 8, 16, 24 y 28px. Las rejillas de tarjetas usan separaciones de 20–24px y pasan de una a tres columnas según el ancho.

Debe funcionar completa en el celular: toda función se puede usar en una columna.

## Elevation & Depth

La profundidad viene de capas de vidrio con desenfoque (backdrop-filter: blur(18px)) y de un hilo de borde, no de sombras. En reposo, las superficies son planas. La única sombra marcada es la de la vista previa del producto sobre el hero oscuro y la de la tarjeta al frente del carrusel.

### Shadow Vocabulary
- **Vista previa sobre el hero** (`box-shadow: 0 30px 60px -30px rgba(0,0,0,0.55)`): la ventana de la entrevista de ejemplo, sobre el fondo oscuro.
- **Tarjeta al frente del carrusel** (`box-shadow: 0 26px 50px -24px rgba(28,47,94,0.45)`): la tarjeta activa del carrusel de puestos.

### Named Rules
**The Glass-Not-Shadow Rule.** La jerarquía la dan la superficie, el hilo de borde y el espacio. Una sombra marcada solo aparece donde algo flota de verdad (la vista previa, la tarjeta activa), nunca para decorar.

## Shapes

Formas suaves con tres radios con papel fijo: 12px para tarjetas y paneles de vidrio, 8px para controles y 4px para chips de metadato. Los campos de acceso usan 10px. La píldora completa queda para la acción principal, los chips de puntaje y el elemento activo del menú. Los bordes son de 1px: Hilo de Tinta en tarjetas y campos, Renglón en las divisorias.

## Components

### Buttons
Cálidos y seguros: píldoras que cambian de tono sin brusquedad.
- **Shape:** píldora completa (9999px) en acciones principales; 8px en botones de control.
- **Primary:** Tinta de Evaluador con texto blanco, peso 500, 10px × 16px.
- **Hover / Focus:** pasa a Tinta Asentada en 150ms; foco con contorno de 2px en Tinta de Evaluador separado 2px.
- **Secondary:** blanco con texto Azul Pizarra y un anillo de 1px en Renglón; al pasar el puntero, Vidrio Campo.
- **Acción secundaria en la landing:** un enlace de texto ("Ya tengo cuenta"), no un segundo botón.
- **Ghost (barra lateral):** texto Pizarra Atenuada que pasa a blanco sobre un fondo blanco al 10 %.
- **Disabled:** 50 % de opacidad y cursor no permitido.

### Chips
- **Metadato:** JetBrains Mono, 11px, mayúsculas, sobre Papel Azulado o Tinta Diluida; radio de 4px.
- **Puntaje:** píldora en mono con el par de color de su banda (éxito, progreso o error).

### Cards / Containers
- **Corner Style:** 12px.
- **Background:** Vidrio Tarjeta con desenfoque de 18px.
- **Shadow Strategy:** plana (ver Elevation & Depth).
- **Border:** 1px en Hilo de Tinta.
- **Internal Padding:** 16–20px en la aplicación; 24–32px en la landing.

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
- **Do** construir la profundidad con la superficie, el hilo de borde de 1px y el espacio; la sombra marcada solo donde algo flota de verdad.
- **Do** rotular siempre como "Sugerencia de IA" lo que no es medido.
- **Do** hacer que cada estado se lea sin depender solo del color: icono o texto además del par de color.
- **Do** cumplir WCAG 2.1 AA y respetar "reducir movimiento" (las animaciones se anulan).
- **Do** mostrar el producto real (la entrevista, la ficha del ATS, un resultado) como imagen de cada sección.
- **Do** tematizar la selección de texto y el cursor con la paleta.

### Don't:
- **Don't** usar degradados morados, neón ni la estética genérica de "app de IA".
- **Don't** presentar un puntaje grande y llamativo como protagonista de la pantalla.
- **Don't** usar ilustraciones genéricas ni fotos de stock.
- **Don't** introducir un segundo color de marca ni otros tonos de azul fuera de esta paleta.
- **Don't** usar verde, ámbar o rojo como decoración.
- **Don't** poner degradados fuera del fondo del hero.
- **Don't** poner rótulos encima de un título ni numerar las secciones (01 / 02 / 03).
- **Don't** estructurar una sección con tarjetas iguales de icono en un cuadrado + título + texto.
- **Don't** usar franjas de cifras con contadores animados ni anillos de progreso como relleno.
- **Don't** usar Lápiz Tenue (#8a93a8) para texto.
