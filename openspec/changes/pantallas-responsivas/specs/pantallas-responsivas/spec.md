## Purpose

Que todas las pantallas a las que se llega desde el sidebar se usen bien en móvil, tablet y escritorio: que aprovechen el ancho disponible, que no tengan scroll horizontal y que conserven todas sus funciones.

## ADDED Requirements

### Requirement: Contenedor común alineado al sidebar

Todas las pantallas del área autenticada SHALL mostrar su contenido en un contenedor común:
- de hasta 1280 px de ancho;
- alineado a la izquierda, junto al sidebar;
- con márgenes laterales de 16 px en móvil, 24 px en tablet y 32 px en escritorio.

Ninguna pantalla MUST centrar su contenido en un ancho propio menor que deje franjas vacías a ambos lados.

Los formularios, el chat de la entrevista y los párrafos largos MAY limitar su propio ancho para que se lean bien, pero MUST quedar alineados a la izquierda con el título de la pantalla.

#### Scenario: Perfil en escritorio
- **WHEN** el usuario abre "Mi perfil" con una ventana de 1440 px
- **THEN** el título y los datos empiezan junto al sidebar, y los datos se reparten en dos columnas

#### Scenario: Texto largo
- **WHEN** una pantalla muestra un párrafo de introducción en escritorio
- **THEN** sus líneas no superan aproximadamente 75 caracteres

### Requirement: Navegación según el tamaño de pantalla

| Ancho | Navegación |
|---|---|
| menos de 768 px | menú en cajón que se abre con el botón de menú de la cabecera (como hoy) |
| 768 a 1023 px | barra lateral fija de iconos, siempre plegada; el nombre de cada destino aparece al pasar el cursor o al enfocarlo; sin botón de plegar ni botón de menú |
| 1024 px o más | barra lateral completa, que el usuario puede plegar y desplegar (como hoy) |

Los destinos del sidebar MUST tener un área táctil de al menos 44×44 px. Si el cajón está abierto y la ventana pasa a 768 px o más, el cajón MUST cerrarse.

#### Scenario: Tablet
- **WHEN** el ancho es de 800 px
- **THEN** se ve la barra de iconos fija, el contenido empieza a su derecha, y no hay botón de menú en la cabecera

#### Scenario: Navegar con teclado en tablet
- **WHEN** el usuario recorre la barra de iconos con Tab
- **THEN** cada destino muestra su nombre al enfocarlo y se activa con Enter

#### Scenario: Girar de móvil a tablet con el cajón abierto
- **WHEN** el cajón está abierto y la ventana pasa de 600 a 900 px
- **THEN** el cajón se cierra y queda la barra de iconos

### Requirement: Distribución por pantalla

En escritorio (1024 px o más) las pantallas SHALL repartir su contenido así:
- **"Mi perfil":** sus datos en dos columnas.
- **"Revisar mi CV":** la convocatoria y el CV con "Analizar" en dos columnas; los resultados y el historial de análisis a todo el ancho.
- **"Retroalimentación":** el reparto por bandas y las observaciones lado a lado.
- **"Historial y progreso":** las dos gráficas lado a lado y la lista a todo el ancho.

Por debajo de 1024 px estas columnas MUST apilarse en el mismo orden.

#### Scenario: CV en móvil
- **WHEN** el ancho es de 375 px
- **THEN** la convocatoria aparece arriba y el CV con "Analizar" debajo, a todo el ancho

### Requirement: Sin desbordamiento horizontal

A 320, 375, 768, 1024 y 1440 px, ninguna pantalla del área autenticada SHALL producir scroll horizontal, ni en su estado normal, ni vacío, ni cargando, ni de error, ni con un modal abierto. En particular:
- **Texto variable:** nombres de puesto y tecnología, nombres de archivo y correos MUST partirse o recortarse sin empujar el ancho.
- **Filas del historial:** en móvil MUST mostrarse en dos líneas (el título arriba, y la nota, el estado y la fecha debajo).
- **Botones de acción** al final del reporte de resultados: en móvil MUST apilarse a todo el ancho.
- **Chat de la entrevista:** MUST ajustarse a la altura visible real del navegador móvil, de modo que el campo de respuesta quede siempre a la vista.
- **Modales:** a 320 px MUST caber con margen, y sus botones apilarse si no caben en una fila.

#### Scenario: Puesto largo en el historial
- **WHEN** el historial muestra "QA Tester / Automatizador · Playwright" a 375 px
- **THEN** la fila se parte en dos líneas y no aparece scroll horizontal

#### Scenario: Responder en el móvil
- **WHEN** el usuario está en una entrevista en un móvil con la barra del navegador visible
- **THEN** el campo de respuesta y su botón de enviar se ven sin desplazarse

### Requirement: Funciones intactas en todos los tamaños

En cada tamaño SHALL seguir disponible cada función de las pantallas del sidebar:
- iniciar una entrevista desde las dos pestañas, con su modal;
- repetir la última configuración;
- analizar una convocatoria o un CV;
- abrir un análisis previo;
- responder y abandonar una entrevista;
- ver los resultados y navegar entre secciones.

Plegar el sidebar MAY existir solo en escritorio.

#### Scenario: Iniciar una entrevista en móvil
- **WHEN** el usuario completa la selección a 375 px y pulsa "Iniciar entrevista"
- **THEN** el modal de inicio se ve completo y "Comenzar" inicia la entrevista
