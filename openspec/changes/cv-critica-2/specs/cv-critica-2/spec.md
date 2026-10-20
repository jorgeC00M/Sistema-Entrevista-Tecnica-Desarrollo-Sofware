## Purpose

Que el diagnóstico medido de un CV llegue sin esperar a la IA, que las sugerencias se completen después sin hacer creer que algo falló, que un CV ilegible se explique según su formato y que las cifras y la navegación sean coherentes en cualquier pantalla.

## ADDED Requirements

### Requirement: El diagnóstico no espera a la IA

`POST /api/curriculums/` SHALL guardar y devolver el diagnóstico medido (espejo, hallazgos, brecha o inventario y viñetas) sin llamar al proveedor de IA. Las sugerencias de un análisis nuevo MUST llegar como "aún no pedidas".

`POST /api/curriculums/<id>/revision/` SHALL obtener las sugerencias de un análisis del usuario:
- **sin volver a subir el archivo:** el documento se reconstruye desde el texto guardado;
- **sin llamar al proveedor** si ya existe una revisión vigente;
- **reintentando** si nunca se pidió o si el proveedor falló.

Además:
- Un análisis de otro usuario MUST responder 404.
- Un fallo del proveedor MUST guardarse como "no disponible" y responder con éxito, igual que hoy.
- El endpoint MUST tener su propio límite de peticiones.
- Solo el módulo de revisión MAY importar la capa de IA, y lo enviado MUST seguir siendo solo secciones con los datos personales tapados.

#### Scenario: Analizar un CV legible
- **WHEN** el usuario sube un CV
- **THEN** la respuesta trae el diagnóstico completo con las sugerencias aún no pedidas, y ningún proveedor de IA fue llamado en esa petición

#### Scenario: Pedir las sugerencias
- **WHEN** se pide la revisión de un análisis recién creado
- **THEN** la respuesta trae las sugerencias, y una segunda petición igual las devuelve sin volver a llamar al proveedor

#### Scenario: Análisis ajeno
- **WHEN** se pide la revisión del análisis de otro usuario
- **THEN** la respuesta es 404

### Requirement: Las sugerencias se completan solas y con estado visible

Tras recibir el diagnóstico, la pantalla SHALL mostrarlo de inmediato y pedir las sugerencias por su cuenta. Mientras llegan:
- cada parte que depende de ellas (el resumen, las viñetas y la redacción, los requisitos y la entrevista) MUST indicar "Pidiendo sugerencias a la IA…";
- el estado MUST anunciarse a los lectores de pantalla;
- la petición MUST tener un tiempo límite propio, mayor que el del análisis.

Si el proveedor no está disponible, la petición falla o se agota el tiempo, la pantalla MUST:
- decir que las sugerencias no están disponibles;
- ofrecer "Reintentar sugerencias", que vuelve a pedirlas sin subir el CV;
- mantener visible el diagnóstico.

Abrir desde el historial un análisis cuyas sugerencias nunca se pidieron MUST pedirlas igual.

#### Scenario: La IA tarda
- **WHEN** las sugerencias tardan 40 segundos
- **THEN** el espejo y las correcciones ya están visibles y la pestaña de entrevista dice que se están pidiendo sugerencias

#### Scenario: La IA falla
- **WHEN** el proveedor no responde
- **THEN** se ve que las sugerencias no están disponibles y un botón "Reintentar sugerencias"

### Requirement: CV ilegible explicado según su formato

Cuando el CV no tiene texto legible:
- el panel SHALL titularse "Tu PDF es una imagen" si el archivo es PDF, y "Tu documento no tiene texto que el ATS pueda leer" si es DOCX;
- para un DOCX cuyo texto está dentro de cuadros de texto, el detalle MUST decir que el texto está en cuadros que el ATS no lee y cómo sacarlo de ellos;
- el panel MUST NOT repetir debajo la ficha completa en rojo: basta con una línea con los campos extraídos (por ejemplo "0/8").

#### Scenario: DOCX hecho con cuadros de texto
- **WHEN** el usuario sube un DOCX cuyo contenido está en cuadros de texto
- **THEN** ve "Tu documento no tiene texto que el ATS pueda leer" y un detalle que nombra los cuadros de texto, no un escaneo

### Requirement: Un único conteo de lo que mejorar

El número de cosas por mejorar SHALL ser el mismo dondequiera que aparezca: correcciones del ATS, más viñetas sin resultado, más correcciones de redacción. Ningún otro control MUST mostrar un número distinto para el mismo concepto.

#### Scenario: Con viñetas y redacción
- **WHEN** hay 4 correcciones del ATS, 6 viñetas sin resultado y 2 correcciones de redacción
- **THEN** la pestaña dice "Mejorar · 12" y no hay ningún otro "4" presentado como el total por mejorar

### Requirement: Tipografía solo con tokens existentes

Toda clase de tamaño de texto de las familias del sistema SHALL corresponder a un token definido. La guarda automática de estilos MUST fallar si un componente usa una clase de esas familias que no exista.

#### Scenario: Token inexistente
- **WHEN** un componente usa una clase de título que no está definida
- **THEN** la guarda de estilos falla y nombra el archivo y la clase

### Requirement: El siguiente paso es visible en móvil

A 375 px de ancho:
- las cuatro pestañas del resultado SHALL verse completas o con una indicación de que hay más;
- "Practicar la entrevista" MUST estar disponible también al final del Resumen;
- en el espejo completo y en el mapa de requisitos, la etiqueta y el valor de cada fila MUST apilarse por debajo de 640 px, para que las sugerencias no queden en una columna estrecha.

#### Scenario: Resultado en un celular
- **WHEN** el usuario termina el análisis a 375 px
- **THEN** ve las cuatro pestañas y, al final del Resumen, el enlace para practicar la entrevista
