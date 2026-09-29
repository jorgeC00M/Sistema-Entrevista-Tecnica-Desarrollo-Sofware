## Purpose

Ayuda al estudiante a orientarse dentro de su zona autenticada, mostrando en el encabezado el nombre de la sección en la que está, en lugar de repetir el nombre genérico de la aplicación en cada pantalla.

## ADDED Requirements

### Requirement: El encabezado nombra la sección visible

El encabezado SHALL mostrar el nombre de la sección de la zona autenticada en la que se encuentra el estudiante.

#### Scenario: Cambiar de sección actualiza el nombre

- **WHEN** el estudiante navega de una sección a otra de su zona autenticada
- **THEN** el encabezado pasa a mostrar el nombre de la nueva sección

#### Scenario: Toda pantalla protegida tiene un nombre

- **WHEN** el estudiante está en cualquier pantalla de su zona autenticada
- **THEN** el encabezado muestra un nombre de sección
- **AND** ese nombre nunca queda vacío ni genérico

### Requirement: El nombre de sección no sustituye a la navegación

El nombre de sección en el encabezado SHALL ser solo informativo. El sistema MUST NOT depender de él como único medio para identificar el destino activo.

#### Scenario: El destino activo se sigue viendo en la barra lateral

- **WHEN** el estudiante consulta el encabezado y la barra lateral a la vez
- **THEN** el destino activo sigue distinguiéndose en la barra lateral, independientemente de lo que muestre el encabezado
