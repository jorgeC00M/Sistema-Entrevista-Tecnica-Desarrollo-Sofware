## Purpose

Define la forma y la disposición de las superficies de la interfaz, para que todas las pantallas usen el espacio de manera coherente.

## ADDED Requirements

### Requirement: Cada mensaje del chat muestra a su autor
Cada burbuja del chat de la entrevista y de la Transcripción del reporte SHALL mostrar un avatar junto a la esquina de su cola:
- en los mensajes de la IA, la marca de la aplicación, abajo a la izquierda;
- en los del usuario, sus iniciales, abajo a la derecha. Si no hay nombre, SHALL mostrarse un icono genérico de usuario.

La etiqueta visible «IA · ENTREVISTADOR» MUST NOT mostrarse. Los avatares SHALL ser decorativos para el lector de pantalla, y cada mensaje SHALL empezar con un texto oculto, «Entrevistador:» o «Tú:», que diga quién habla.

#### Scenario: Conversación en curso
- **WHEN** se muestran una pregunta de la IA y la respuesta del usuario
- **THEN** la pregunta tiene la marca de la app abajo a la izquierda y la respuesta tiene las iniciales del usuario abajo a la derecha

#### Scenario: Con lector de pantalla
- **WHEN** un lector de pantalla lee un mensaje
- **THEN** anuncia «Entrevistador:» o «Tú:» antes del texto y no lee los avatares

### Requirement: Un campo enfocado se marca con una sola línea
Al enfocar un campo de formulario, el sistema SHALL marcarlo con una sola línea de 2 px del color de acento, pegada a su borde. MUST NOT verse a la vez el borde fino y un anillo separado.

#### Scenario: Hacer clic en un campo
- **WHEN** el usuario hace clic o entra con Tab en el campo de respuesta o en cualquier otro campo
- **THEN** el campo muestra una sola línea gruesa de acento alrededor, sin una segunda línea fina
