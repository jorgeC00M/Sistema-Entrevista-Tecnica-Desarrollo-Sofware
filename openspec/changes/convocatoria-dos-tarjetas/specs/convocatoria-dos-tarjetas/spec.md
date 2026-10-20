## Purpose

Que en la pestaña "Con convocatoria" se vea de un vistazo que hay dos formas alternativas de dar el aviso (pegar el texto o subir el archivo) y que el usuario elija una antes de completarla.

## ADDED Requirements

### Requirement: Dos tarjetas para elegir cómo dar la convocatoria

La pestaña "Con convocatoria" SHALL mostrar, en este orden:
1. un rótulo visible, "Elige una forma de darnos la convocatoria";
2. dos tarjetas elegibles en una misma fila: "Pegar texto" (con la ayuda "Copia el aviso de la web") y "Subir archivo" (con la ayuda "PDF o DOCX"), cada una con su icono.

Las tarjetas MUST comportarse como un grupo de opciones excluyentes:
- siempre hay exactamente una elegida;
- "Pegar texto" está elegida al entrar;
- la elegida se distingue visualmente y se anuncia como seleccionada a los lectores de pantalla;
- se pueden elegir con teclado (Tab al grupo y flechas para cambiar).

Por debajo de 640 px las tarjetas MUST apilarse, en el mismo orden. La pestaña MUST NOT mostrar ejemplos de texto para probar ("Probar con un ejemplo").

#### Scenario: Entrar a la pestaña
- **WHEN** el usuario selecciona "Con convocatoria"
- **THEN** ve el rótulo, las dos tarjetas lado a lado con "Pegar texto" elegida, el área de texto debajo y ningún ejemplo

#### Scenario: Elegir con teclado
- **WHEN** el foco está en la tarjeta "Pegar texto" y el usuario pulsa la flecha derecha
- **THEN** queda elegida "Subir archivo" y debajo aparece la zona de archivo

#### Scenario: Pantalla angosta
- **WHEN** el ancho es de 375 px
- **THEN** las tarjetas se apilan, "Pegar texto" arriba, sin desplazamiento horizontal

### Requirement: Solo se muestra el campo de la forma elegida

Debajo de las tarjetas SHALL mostrarse solo el campo de la forma elegida:
- con "Pegar texto", el área de texto "Texto de la convocatoria", con su contador (máximo 5000) y el aviso si hay menos de 30 caracteres;
- con "Subir archivo", la zona para un PDF o DOCX.

"Analizar convocatoria" MUST enviar solo lo de la forma elegida. Se habilita con 30 caracteres o más de texto, o con un archivo, según cuál esté elegida.

Al cambiar de tarjeta, lo escrito o el archivo elegido en la otra MUST conservarse, para recuperarlo si el usuario vuelve a ella. Ninguno de los dos campos se deshabilita por tener contenido en el otro. Mientras se analiza, las tarjetas y el campo MUST quedar deshabilitados.

#### Scenario: Analizar el archivo habiendo escrito texto antes
- **WHEN** el usuario escribe un texto, cambia a "Subir archivo", elige un PDF y pulsa "Analizar convocatoria"
- **THEN** se analiza el PDF, no el texto

#### Scenario: Volver a la tarjeta de texto
- **WHEN** el usuario escribe un texto, cambia a "Subir archivo" y vuelve a "Pegar texto"
- **THEN** el área de texto conserva lo escrito

#### Scenario: Sin contenido en la forma elegida
- **WHEN** "Subir archivo" está elegida y no hay archivo, aunque haya texto escrito en la otra
- **THEN** "Analizar convocatoria" está deshabilitado
