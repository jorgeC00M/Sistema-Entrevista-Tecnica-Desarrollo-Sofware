## Purpose

Define la forma de los componentes base de la interfaz (botón, tarjeta, campo y burbuja del chat) y en qué superficies se usa el efecto vidrio, para que toda la aplicación se vea igual.

## ADDED Requirements

### Requirement: Botones de acción grandes y táctiles
- **Forma:** todo botón con texto MUST tener forma de píldora.
- **Alto:** el tamaño por defecto MUST medir al menos 44 px de alto.
- **Sombra:** la acción principal MUST tener una sombra visible, tintada con el color de acción.
- **Presión:** al presionarse, el botón MUST reducirse ligeramente de escala, salvo cuando el usuario pidió reducir el movimiento.
- **Foco:** el anillo de foco del teclado MUST seguir siendo visible.

#### Scenario: Botón principal por defecto
- **WHEN** se muestra «Iniciar entrevista» en tamaño por defecto
- **THEN** el botón es una píldora de al menos 44 px de alto, con sombra y texto blanco con contraste AA sobre el acento

#### Scenario: Presionar con movimiento reducido
- **WHEN** el sistema operativo pide reducir el movimiento y el usuario presiona un botón
- **THEN** el botón no cambia de escala

### Requirement: Tarjetas sólidas, muy redondas y sin borde
Las tarjetas de contenido MUST tener:
- fondo opaco;
- un radio de 24 px;
- ningún borde;
- una sombra amplia y suave que las separe del fondo.

Los paneles dentro de una tarjeta MUST conservar un radio menor que el de la tarjeta.

#### Scenario: Tarjeta en la aplicación
- **WHEN** se muestra cualquier tarjeta en una pantalla autenticada
- **THEN** su fondo es blanco opaco, no tiene borde ni desenfoque de fondo y la separa una sombra

### Requirement: Campos redondeados
Los campos de formulario (texto, área de texto, selector, acceso) MUST tener un radio de 14 px. Sus estados de foco, error y deshabilitado MUST seguir como estaban.

#### Scenario: Campo con error
- **WHEN** un campo es inválido
- **THEN** conserva el radio de 14 px y muestra el borde de error

### Requirement: Burbujas del chat con la cola abajo
Las burbujas del chat MUST tener un radio de 24 px y una sola esquina reducida, la de la cola:
- en los mensajes del usuario, abajo a la derecha;
- en los de la IA, abajo a la izquierda.

La burbuja de la IA MUST tener fondo opaco.

#### Scenario: Conversación en curso
- **WHEN** se muestran una pregunta de la IA y una respuesta del usuario
- **THEN** la burbuja de la IA tiene la esquina inferior izquierda reducida, y la del usuario la inferior derecha

### Requirement: Vidrio solo sobre contenido
- **Dónde se usa:** el desenfoque translúcido de fondo («vidrio») MUST usarse solo en superficies que tienen contenido visible detrás: la vista previa sobre el hero, las cabeceras fijas y el velo de los modales.
- **Dónde no:** las superficies apoyadas sobre un fondo plano MUST NOT usar desenfoque de fondo.

#### Scenario: Tarjeta de acceso
- **WHEN** se abre la pantalla de inicio de sesión, cuyo fondo es plano
- **THEN** la tarjeta de acceso es opaca y no aplica desenfoque de fondo

#### Scenario: Cabecera al desplazarse
- **WHEN** el usuario desplaza una pantalla autenticada y el contenido pasa por debajo de la cabecera
- **THEN** la cabecera sigue siendo translúcida con desenfoque
