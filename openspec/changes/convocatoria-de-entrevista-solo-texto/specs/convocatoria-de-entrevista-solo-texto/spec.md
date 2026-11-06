## Purpose

Definir cómo se da la convocatoria al simular una entrevista desde un aviso: solo como texto pegado o escrito, en el mismo espacio de la pestaña, y qué acepta la API que la analiza.

## ADDED Requirements

### Requirement: La convocatoria de la entrevista solo como texto
La pestaña «Con convocatoria» de «Simular entrevista» SHALL ofrecer solo el campo «Texto de la convocatoria», para pegar o escribir el aviso. MUST NOT ofrecer subirlo como archivo ni elegir entre vías.
- El campo SHALL aceptar de 30 a 5000 caracteres, con su contador.
- Por debajo de 30 caracteres, SHALL avisar que con tan poco texto no se identifica el puesto.
- «Analizar convocatoria» SHALL habilitarse a partir de 30 caracteres.
- Si la IA falla, el aviso SHALL decir que el texto sigue en el campo.

#### Scenario: La pestaña
- **WHEN** el usuario abre «Con convocatoria»
- **THEN** ve el campo de texto y «Analizar convocatoria», sin «Pegar texto / Subir archivo»

#### Scenario: Texto corto
- **WHEN** escribe 12 caracteres
- **THEN** ve el aviso de texto corto y «Analizar convocatoria» sigue deshabilitado

### Requirement: El espacio de la pestaña no cambia
Desde 1024 px, la entrada SHALL ir a la izquierda y lo detectado a la derecha. Antes del primer análisis, a la derecha SHALL verse el marcador que lo anuncia. Por debajo de 1024 px se apila: el campo, el botón y lo detectado.

#### Scenario: Escritorio antes de analizar
- **WHEN** abre la pestaña a 1366 px
- **THEN** ve el campo a la izquierda y, a la derecha, «Aquí verás el puesto, la tecnología y el nivel detectados»

### Requirement: La API de la convocatoria solo recibe texto
El análisis de una convocatoria para simular una entrevista SHALL recibir el aviso solo como texto. Un archivo enviado MUST ignorarse. Sin texto suficiente, SHALL responder 400 con el mensaje de aviso incompleto y MUST NOT llamar a la IA.

#### Scenario: Un cliente envía un archivo
- **WHEN** se llama a la API con un archivo de convocatoria y sin texto
- **THEN** responde 400 «Pega el aviso completo…» y no llama a la IA
