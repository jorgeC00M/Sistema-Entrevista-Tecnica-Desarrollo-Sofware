## Purpose

Que los capítulos I a III del perfil de la tesis describan el sistema tal como está implementado: ni funcionalidades sin declarar ni promesas que el sistema no cumple.

## ADDED Requirements

### Requirement: El Alcance declara lo que el sistema ofrece
El Alcance SHALL nombrar cada funcionalidad que el sistema ofrece al usuario:
- la selección de puesto, tecnología y nivel, donde cada puesto cubre varias áreas;
- los siete puestos;
- los niveles Junior, Semi-Senior y Senior;
- las entrevistas de cinco preguntas, con la posibilidad de abandonarlas;
- la entrevista desde una convocatoria;
- el análisis de CV frente a filtros ATS;
- el registro con correo o con Google;
- la evaluación con rúbrica;
- la retroalimentación;
- el historial con su evolución.

Los objetivos específicos SHALL quedar como en el perfil aprobado.

#### Scenario: Funcionalidad implementada
- **WHEN** el tribunal busca en el Alcance el análisis de CV o la entrevista desde convocatoria
- **THEN** encuentra una viñeta que la describe

#### Scenario: Objetivos intactos
- **WHEN** se compara la sección 1.3 con el perfil aprobado
- **THEN** los seis objetivos específicos son los mismos, salvo correcciones ortográficas

### Requirement: El documento no promete lo que el sistema no hace
El documento SHALL NOT afirmar comportamientos que el sistema no tiene. En particular:
- no SHALL presentar como restricciones del sistema que solo funcione en Cochabamba o solo para egresados de la UMSS: eso es el público objetivo;
- no SHALL hablar de límites de tiempo en la entrevista;
- no SHALL hablar de problemas de codificación ejecutados;
- no SHALL decir que la IA asigna la nota;
- no SHALL decir que la IA recibe el historial completo de la conversación;
- no SHALL hablar de un puntaje ATS.

#### Scenario: Cómo se calcula la nota
- **WHEN** el documento explica la evaluación
- **THEN** dice que la IA elige un nivel de 0 a 4 en cada uno de los tres criterios y que el sistema calcula la nota de 0 a 100 con una fórmula

#### Scenario: Público objetivo
- **WHEN** el Alcance menciona Cochabamba o la UMSS
- **THEN** los presenta como destinatarios del piloto, no como una restricción del sistema

### Requirement: Los datos y procesos coinciden con la implementación
Las tablas de 3.4.1 SHALL listar los campos que existen en la base de datos para Usuario, Entrevista, Intercambio y Evaluación. Además, SHALL incluir las tablas de los catálogos, de Convocatoria y del análisis de CV, y un diagrama entidad-relación.

Los diagramas de 3.3 SHALL mostrar el flujo actual: entrevista personalizada o desde convocatoria, preguntas iniciales generadas juntas, nota visible solo al final, y el flujo del análisis de CV.

#### Scenario: Campo inexistente
- **WHEN** se compara la tabla Entrevista con el modelo del sistema
- **THEN** no aparece `area_tecnica`, y sí `puesto`, `tecnologia`, `nivel` y `convocatoria`

### Requirement: Cada figura y tabla tiene un pie correcto y aparece en el índice
Cada tabla y figura SHALL tener un pie que describa su contenido, con numeración correlativa, y SHALL aparecer en el índice de tablas o en el de figuras.

#### Scenario: Pie copiado
- **WHEN** se revisan las figuras de 2.3
- **THEN** ninguna lleva el pie «Cuadro comparativo entre metodologías ágiles»
