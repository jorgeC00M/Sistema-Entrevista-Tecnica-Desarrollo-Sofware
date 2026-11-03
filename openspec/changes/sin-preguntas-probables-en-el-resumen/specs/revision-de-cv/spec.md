## Purpose

Diagnosticar por qué un currículum queda fuera de la búsqueda de un reclutador que usa un ATS, midiendo el documento regla por regla y sin publicar nunca un puntaje.

## ADDED Requirements

### Requirement: El Resumen cierra solo con la práctica de la entrevista
El Resumen SHALL terminar con el botón «Practicar la entrevista», siempre visible y con el puesto sugerido preseleccionado cuando lo hay. NO SHALL mostrar «Preguntas que podrían hacerte» ni ninguna lista de preguntas probables, aunque la revisión con IA las traiga.

#### Scenario: Con preguntas en la revisión
- **WHEN** la revisión con IA trae preguntas probables
- **THEN** el Resumen termina con «Practicar la entrevista» y no muestra las preguntas

### Requirement: El aviso de la IA no cuenta lo que no se muestra
Las preguntas probables NO SHALL contar para ningún aviso de la revisión con IA. El aviso «La IA no encontró nada que sugerir» se retiró después por decisión del usuario (ver `plan-de-mejora-como-lista-de-arreglos`): con la revisión lista no SHALL mostrarse ningún aviso.

#### Scenario: Solo preguntas
- **WHEN** la revisión con IA solo trae preguntas probables
- **THEN** no se muestra ningún aviso de la IA
