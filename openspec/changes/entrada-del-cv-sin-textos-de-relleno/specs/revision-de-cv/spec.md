## Purpose

Diagnosticar por qué un currículum queda fuera de la búsqueda de un reclutador que usa un ATS, midiendo el documento regla por regla y sin publicar nunca un puntaje.

## ADDED Requirements

### Requirement: La nota de privacidad del CV se retiró
La nota que este cambio acortó a una línea se retiró después, por decisión del usuario, en `entrada-del-cv-que-revisamos`: bajo la zona del CV NO SHALL haber nota de privacidad. La garantía sigue siendo cierta en el sistema (el archivo no se almacena y el nombre, el correo y el teléfono se tapan antes de la IA).

#### Scenario: Antes de subir
- **WHEN** el usuario abre `/mi-cv`
- **THEN** bajo la zona del CV no hay nota de privacidad

### Requirement: El consejo de la convocatoria va en el placeholder
Bajo el cuadro de texto de la convocatoria NO SHALL haber un párrafo de instrucciones. El placeholder del cuadro SHALL pedir el aviso completo con sus títulos de requisitos y deseables: «Pega aquí el aviso completo, con sus títulos de requisitos y deseables.».

#### Scenario: Cuadro vacío
- **WHEN** el usuario elige «Análisis dirigido» con «Pegar texto»
- **THEN** el cuadro vacío muestra ese placeholder y debajo no hay texto de instrucciones
