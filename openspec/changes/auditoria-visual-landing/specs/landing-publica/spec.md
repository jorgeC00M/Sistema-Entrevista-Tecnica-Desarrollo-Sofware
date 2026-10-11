## Purpose

Presentar Antesala a quien todavía no tiene cuenta, describiendo con exactitud lo
que hace, con una calidad visual que no parezca una plantilla generada.

## ADDED Requirements

### Requirement: Todo texto de la landing cumple el contraste WCAG AA

Todo texto de la landing MUST alcanzar un contraste de al menos 4,5:1 con su
fondo, o 3:1 si es texto grande (24 px o más, o 18,66 px en negrita). Esto
incluye etiquetas, metadatos y textos secundarios, y el texto sobre el
degradado del hero.

#### Scenario: Texto secundario sobre el fondo

- **WHEN** se muestra un texto secundario sobre el fondo de la página
- **THEN** su contraste es de al menos 4,5:1

#### Scenario: Texto pequeño sobre el degradado del hero

- **WHEN** se muestran los rastros o el subtítulo sobre la parte más clara del degradado
- **THEN** su contraste es de al menos 4,5:1

### Requirement: La tipografía sigue una escala con nombre

Los tamaños de texto de la landing SHALL salir de una escala de tokens con
nombre (display, título de sección, título de tarjeta, cuerpo, meta) y no de
valores sueltos. Los pesos usados MUST estar cargados, sin pesos sintetizados por
el navegador.

#### Scenario: Sin tamaños sueltos

- **WHEN** se revisa el código de las secciones de la landing
- **THEN** no hay tamaños de texto arbitrarios fuera de la escala

#### Scenario: Peso cargado

- **WHEN** una cifra se muestra en JetBrains Mono a peso 600
- **THEN** ese peso se descarga de la fuente y no se simula

### Requirement: La composición evita los patrones genéricos

La landing MUST NOT construirse con los patrones señalados como genéricos en el
diagnóstico: títulos de sección numerados, filas de tres tarjetas iguales como
única forma de presentar contenido, ni cuadrícula y resplandor decorativos en el
hero. La vista previa del producto SHALL ser un elemento protagonista del hero.

#### Scenario: Hero

- **WHEN** el visitante abre la landing en escritorio
- **THEN** el titular y la vista previa del producto comparten el primer pantallazo, sin cuadrícula ni resplandor decorativo

#### Scenario: Secciones

- **WHEN** el visitante recorre las secciones
- **THEN** ninguna repite la composición de otra y ninguna lleva un número de sección

### Requirement: El nombre del producto es Antesala en toda la landing

El título del documento, la descripción, las etiquetas para compartir en redes
y la marca visible SHALL usar el nombre Antesala.

#### Scenario: Pestaña del navegador

- **WHEN** el visitante abre la landing
- **THEN** la pestaña muestra "Antesala" en el título

#### Scenario: Compartir el enlace

- **WHEN** alguien comparte la URL en una red social
- **THEN** la vista previa muestra el título y la descripción de Antesala
