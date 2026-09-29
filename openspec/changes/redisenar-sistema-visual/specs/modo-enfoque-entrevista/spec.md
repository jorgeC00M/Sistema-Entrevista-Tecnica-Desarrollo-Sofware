## Purpose

Reduce las distracciones mientras el estudiante responde una entrevista, colapsando la barra lateral automáticamente al entrar, sin quitarle la posibilidad de volver a abrirla si la necesita.

## ADDED Requirements

### Requirement: El sidebar se colapsa al entrar a una entrevista activa

Al entrar a la conversación de una entrevista, el sistema SHALL colapsar la barra lateral a su forma de franja de iconos.

#### Scenario: Entrar a una entrevista con el sidebar expandido

- **WHEN** el estudiante navega a la conversación de una entrevista con la barra lateral expandida
- **THEN** la barra lateral pasa a su forma colapsada (franja de iconos)

#### Scenario: Entrar a una entrevista con el sidebar ya colapsado

- **WHEN** el estudiante navega a la conversación de una entrevista con la barra lateral ya colapsada
- **THEN** la barra lateral permanece colapsada, sin cambio observable

### Requirement: El colapso automático no impide reabrir la barra

El control para expandir la barra lateral SHALL seguir disponible mientras el estudiante está en una entrevista.

#### Scenario: Reabrir durante la entrevista

- **WHEN** el estudiante activa el control de la barra lateral mientras responde una entrevista
- **THEN** la barra lateral se expande
- **AND** permanece expandida mientras el estudiante siga en esa misma conversación

### Requirement: Salir de la entrevista no fuerza ningún estado

Al salir de la conversación de una entrevista, el sistema MUST NOT forzar la barra lateral a un estado concreto.

#### Scenario: Salir tras haberla reabierto

- **WHEN** el estudiante reabrió la barra lateral durante la entrevista y luego sale de esa pantalla
- **THEN** la barra lateral permanece como el estudiante la dejó, expandida

#### Scenario: Salir sin haber tocado el control

- **WHEN** el estudiante no tocó el control de la barra lateral durante la entrevista y sale de esa pantalla
- **THEN** la barra lateral permanece colapsada, tal como quedó al entrar

### Requirement: Volver a entrar reaplica el colapso automático

Entrar a una nueva entrevista (o recargar la misma) SHALL volver a aplicar el colapso automático, independientemente de cómo haya quedado la barra lateral la vez anterior.

#### Scenario: Segunda entrevista tras haber reabierto la anterior

- **WHEN** el estudiante reabrió la barra lateral en una entrevista, la terminó, y comienza una nueva
- **THEN** la barra lateral se colapsa automáticamente de nuevo al entrar a la nueva conversación
