# tesis-alineada-con-el-sistema Specification

## Purpose

Define que los documentos de la tesis (perfil y marco teórico) nombren las pantallas y las funciones de la IA tal como están en el sistema.

## Requirements

### Requirement: El perfil nombra la pantalla «Simular entrevista»
El perfil de tesis SHALL llamar «Formulario «Simular entrevista»» a la pantalla donde se configura la entrevista: en los títulos de sección, en las Figuras 12 y 13, en las Tablas 17 y 18 y en sus índices. La tabla del reporte SHALL decir que «Practicar» abre «Simular entrevista». El perfil MUST NOT decir «Nueva Entrevista».

#### Scenario: Figuras y tablas
- **WHEN** se lee la sección de interfaces del perfil
- **THEN** las Figuras 12 y 13, las Tablas 17 y 18 y sus entradas en los índices dicen «Formulario «Simular entrevista»» seguido de su pestaña

#### Scenario: Botón de práctica
- **WHEN** se lee la fila «Practicar de nuevo este puesto» de la tabla del reporte
- **THEN** dice que abre «Simular entrevista» con el mismo puesto y nivel preseleccionados

### Requirement: El marco teórico lista al redactor del veredicto
En la sección 2.5.4 de los dos documentos del marco teórico, la lista de funciones de la API de Claude SHALL incluir, después de la evaluación de respuestas, la redacción del veredicto final. La viñeta SHALL decir que el veredicto se basa en las evaluaciones ya guardadas, que no recibe las respuestas y que no modifica la nota. El resto de ambos documentos MUST NOT cambiar.

#### Scenario: Funciones de la API
- **WHEN** se lee la lista de funciones de la API de Claude en 2.5.4
- **THEN** aparecen, en este orden, generar preguntas, evaluar cada respuesta, redactar el veredicto, analizar convocatorias y sugerir mejoras al CV

#### Scenario: Mismo formato
- **WHEN** se abre el documento en Word
- **THEN** la viñeta nueva tiene la misma viñeta, sangría y estilo que las otras de la lista
