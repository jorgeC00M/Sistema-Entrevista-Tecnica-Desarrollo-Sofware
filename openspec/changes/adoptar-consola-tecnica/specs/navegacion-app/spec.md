## Purpose

Define qué secciones ofrece el shell autenticado y bajo qué condiciones cada destino está disponible, para que el menú nunca ofrezca un enlace que lleve a una pantalla sin contenido.

## ADDED Requirements

### Requirement: Destinos del shell autenticado

El shell autenticado SHALL ofrecer acceso a: nueva entrevista, entrevista en curso, resultados, historial y progreso, retroalimentación y perfil.

La acción de iniciar una nueva entrevista SHALL presentarse como acción principal, diferenciada del resto de destinos de navegación.

#### Scenario: Usuario autenticado abre la aplicación

- **WHEN** un usuario autenticado carga cualquier pantalla del shell
- **THEN** el menú lista los destinos disponibles y destaca "Nueva entrevista" como acción principal

#### Scenario: El destino actual queda señalado

- **WHEN** el usuario está en una de las secciones del menú
- **THEN** ese destino aparece marcado como activo, y lo comunica por algo más que el color

### Requirement: Destinos condicionados por el estado del usuario

El sistema SHALL ofrecer "Entrevista en curso" únicamente cuando el usuario tenga una entrevista sin terminar, y "Resultados" únicamente cuando tenga al menos una entrevista finalizada.

Un destino no disponible NO SHALL mostrarse como enlace inerte ni llevar a una pantalla vacía.

#### Scenario: Usuario con una entrevista a medias

- **WHEN** el usuario tiene una entrevista en estado en progreso
- **THEN** el menú ofrece "Entrevista en curso" y lleva a esa entrevista

#### Scenario: Usuario sin entrevistas a medias

- **WHEN** el usuario no tiene ninguna entrevista en progreso
- **THEN** el menú no ofrece "Entrevista en curso"

#### Scenario: Usuario que nunca terminó una entrevista

- **WHEN** el usuario no tiene ninguna entrevista finalizada
- **THEN** el menú no ofrece "Resultados"

#### Scenario: Usuario con entrevistas finalizadas

- **WHEN** el usuario tiene al menos una entrevista finalizada
- **THEN** el menú ofrece "Resultados" y lleva al reporte de la más reciente

### Requirement: Identidad propia del proyecto en el shell

El shell SHALL usar la marca y el avatar del propio proyecto. NO SHALL incorporar logotipos ni fotografías provenientes de maquetas externas.

#### Scenario: Cabecera y menú muestran la marca

- **WHEN** el usuario ve el shell autenticado
- **THEN** se muestra el logotipo del proyecto y, para el usuario, un avatar generado a partir de sus iniciales
