## Purpose

Definir qué muestra la confirmación de "Repetir última" en la pantalla de nueva entrevista y qué ocurre al confirmarla, para que el usuario quede listo para empezar o sepa exactamente qué le falta.

## ADDED Requirements

### Requirement: La confirmación muestra solo la configuración anterior

El modal "Aplicar configuración anterior" SHALL mostrar, en su cuerpo, únicamente el puesto, la tecnología y el nivel de la última entrevista. Si la tecnología ya no está disponible, la fila lo indica. El cuerpo MUST NOT incluir advertencias sobre la selección o la búsqueda actuales.

#### Scenario: Con selección y búsqueda en curso
- **WHEN** el usuario eligió Frontend, escribió "des" y abre "Repetir última"
- **THEN** el modal muestra la tabla de su última entrevista y ninguna frase sobre reemplazar la selección o la búsqueda

### Requirement: Confirmar prepara la selección sin iniciar la entrevista

Al confirmar, el sistema SHALL elegir el puesto y el nivel de la última entrevista, y su tecnología si sigue activa. SHALL borrar la búsqueda y cerrar el modal. MUST NOT iniciar la entrevista.

#### Scenario: Configuración completa
- **WHEN** la última entrevista fue Backend + Python + Junior y el usuario confirma
- **THEN** quedan elegidos Backend, Python y Junior, el buscador queda vacío, no se crea ninguna entrevista y "Comenzar entrevista" queda habilitado

#### Scenario: Tecnología ya no disponible
- **WHEN** la tecnología de la última entrevista está inactiva y el usuario confirma
- **THEN** quedan elegidos el puesto y el nivel, la tecnología queda sin elegir y "Comenzar entrevista" sigue deshabilitado

#### Scenario: Cancelar no cambia nada
- **WHEN** el usuario abre el modal y pulsa Cancelar, la X o Esc
- **THEN** la selección y la búsqueda quedan como estaban

### Requirement: Confirmar lleva al siguiente paso

Tras confirmar, la pantalla SHALL desplazarse y mover el foco a lo que sigue:
- a "Comenzar entrevista" si la configuración quedó completa;
- a la primera tecnología del puesto si falta elegirla.

El cambio MUST anunciarse en una región `aria-live`. El desplazamiento MUST respetar "reducir movimiento".

#### Scenario: Listo para empezar
- **WHEN** el usuario confirma una configuración completa
- **THEN** el foco queda en "Comenzar entrevista" y se anuncia "Configuración anterior aplicada"

#### Scenario: Falta la tecnología
- **WHEN** el usuario confirma una configuración cuya tecnología ya no está disponible
- **THEN** el foco queda en la primera tecnología del puesto y se anuncia que falta elegir la tecnología
