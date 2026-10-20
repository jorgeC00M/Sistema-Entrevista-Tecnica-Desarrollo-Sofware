## Purpose

Mostrar Puesto y Nivel en la misma fila del formulario de entrevista y recorrer los campos siempre en el mismo orden: el de la pantalla, el del aviso de lo que falta y el del foco.

## ADDED Requirements

### Requirement: Puesto y Nivel en la misma fila

En anchos de 640 px o más, el formulario SHALL mostrar Puesto a la izquierda y Nivel a la derecha en la misma fila, con sus desplegables a la misma altura. La fila siguiente MUST contener Tecnología: un campo a todo el ancho, o "Tecnología de frontend" y "Tecnología de backend" lado a lado en un puesto con capas. En anchos menores, los campos MUST apilarse en el orden Puesto, Nivel, Tecnología.

#### Scenario: Escritorio
- **WHEN** el usuario abre el formulario en una ventana de 1280 px
- **THEN** ve Puesto y Nivel en la primera fila, a la misma altura, y Tecnología en la fila de abajo

#### Scenario: Full Stack en escritorio
- **WHEN** el usuario elige Full Stack en una ventana de 1280 px
- **THEN** la segunda fila muestra "Tecnología de frontend" y "Tecnología de backend" lado a lado

#### Scenario: Móvil
- **WHEN** el usuario abre el formulario a 375 px
- **THEN** los campos aparecen uno debajo del otro: Puesto, Nivel y Tecnología

### Requirement: Un solo orden de campos

El campo que falta SHALL determinarse en el orden Puesto, Nivel, Tecnología. Ese orden MUST ser el que anuncia la barra de resumen y el que sigue el foco tras aplicar "Repetir última" o una convocatoria.

#### Scenario: Faltan nivel y tecnología
- **WHEN** solo está elegido el puesto
- **THEN** la barra dice "Elige el nivel", y tras un atajo que deje ambos vacíos el foco va al campo Nivel

#### Scenario: Solo falta la tecnología
- **WHEN** puesto y nivel están elegidos y la tecnología no
- **THEN** la barra dice "Elige la tecnología"
