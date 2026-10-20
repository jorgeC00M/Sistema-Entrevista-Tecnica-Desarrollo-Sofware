## Purpose

Permitir que el candidato pegue o suba la convocatoria a la que va a postular, que el sistema detecte su perfil dentro del catálogo para que el candidato lo confirme, y que la entrevista pregunte sobre los requisitos de ese aviso.

## ADDED Requirements

### Requirement: Recibir la convocatoria pegada o en archivo

El sistema SHALL aceptar la convocatoria como texto pegado (de 30 a 5000 caracteres) o como archivo PDF/DOCX, pero no las dos cosas a la vez. Un archivo sin capa de texto (escaneado) o de formato no admitido MUST rechazarse con 400 y un mensaje que sugiera pegar el texto. El archivo MUST NOT guardarse.

#### Scenario: Texto pegado
- **WHEN** el usuario envía el texto de un aviso de 600 caracteres
- **THEN** el sistema lo analiza y responde 201 con el perfil detectado

#### Scenario: PDF escaneado
- **WHEN** el usuario sube un PDF sin capa de texto
- **THEN** responde 400 indicando que no se pudo leer el texto y que lo pegue

#### Scenario: Ambas cosas
- **WHEN** el usuario envía texto y archivo a la vez
- **THEN** responde 400

### Requirement: Perfil detectado y anclado al catálogo

El perfil SHALL contener puesto, tecnología y nivel **activos del catálogo**, con la tecnología perteneciente al puesto, hasta 8 requisitos y la lista de lo que el simulador no evalúa. Cualquier valor que la IA devuelva fuera del catálogo MUST descartarse. Cada requisito MUST aparecer en el aviso o ser una tecnología reconocida. Si la tecnología devuelta no es del puesto, MUST quedar nula, no reemplazarse.

#### Scenario: Aviso de backend
- **WHEN** el aviso pide "Desarrollador Backend Junior con Python y Django, APIs REST y PostgreSQL"
- **THEN** el perfil es Backend, Python, Junior, y los requisitos incluyen APIs REST y PostgreSQL

#### Scenario: Tecnología de otro puesto
- **WHEN** la IA devuelve puesto Frontend y tecnología Flutter
- **THEN** el perfil queda con Frontend y sin tecnología

#### Scenario: Requisito inventado
- **WHEN** la IA devuelve un requisito que no aparece en el aviso ni es una tecnología reconocida
- **THEN** ese requisito no se incluye

### Requirement: No se inventa un perfil

Si el aviso no permite identificar un puesto de desarrollo de software del catálogo, el sistema SHALL responder 422 con un mensaje que lo explique, y MUST NOT devolver un perfil por defecto.

#### Scenario: Aviso de otra profesión
- **WHEN** el usuario pega un aviso de contador público
- **THEN** responde 422 indicando que no parece una convocatoria de desarrollo de software

### Requirement: Privacidad y caché

El aviso SHALL guardarse y enviarse a la IA con los correos, teléfonos y enlaces enmascarados. Analizar dos veces el mismo aviso (mismo texto enmascarado) para el mismo usuario MUST reutilizar el análisis guardado sin llamar a la IA. Un usuario MUST NOT poder usar el análisis de otro.

#### Scenario: Contacto en el aviso
- **WHEN** el aviso incluye "Enviar CV a rrhh@empresa.com o al 71234567"
- **THEN** ni el texto guardado ni lo enviado a la IA contienen ese correo ni ese teléfono

#### Scenario: Mismo aviso dos veces
- **WHEN** el usuario analiza el mismo aviso por segunda vez
- **THEN** recibe el mismo perfil y la IA no recibe ninguna llamada

### Requirement: Confirmar y usar el perfil

La pantalla SHALL mostrar el perfil detectado (puesto, tecnología, nivel, requisitos y lo que no se evalúa) con las acciones "Editar texto" y "Usar este perfil". "Usar este perfil" MUST rellenar la selección e indicarla como "Desde convocatoria". El usuario MUST poder cambiar la selección antes de comenzar. Mientras se analiza, MUST verse un estado de carga, y cada error (escaneado, no identificado, servicio no disponible) MUST mostrarse con su mensaje.

#### Scenario: Usar el perfil
- **WHEN** el usuario pulsa "Usar este perfil"
- **THEN** quedan elegidos el puesto, la tecnología y el nivel detectados, y la barra de resumen muestra "Desde convocatoria"

#### Scenario: Falta la tecnología
- **WHEN** el perfil detectado no tiene tecnología
- **THEN** quedan elegidos el puesto y el nivel, y la pantalla pide elegir la tecnología

### Requirement: La entrevista pregunta sobre los requisitos

Al iniciar una entrevista con una convocatoria del usuario, las preguntas de tecnología, profundidad y caso práctico SHALL considerar sus requisitos. La convocatoria MUST pertenecer al usuario (404 si no). El evaluador MUST NOT recibir los requisitos: califica con la misma rúbrica y nivel. El plan de 5 preguntas y sus áreas MUST NOT cambiar.

#### Scenario: Requisitos en el prompt
- **WHEN** se inicia una entrevista con una convocatoria que pide "PostgreSQL"
- **THEN** el prompt del entrevistador incluye "PostgreSQL" entre los requisitos y el del evaluador no

#### Scenario: Convocatoria ajena
- **WHEN** el usuario inicia con el id de la convocatoria de otro usuario
- **THEN** responde 404 y no se crea la entrevista

#### Scenario: Marca en la entrevista
- **WHEN** el usuario abre una entrevista iniciada desde una convocatoria
- **THEN** la pantalla indica "Basada en tu convocatoria"
