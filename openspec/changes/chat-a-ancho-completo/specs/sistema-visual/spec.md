## Purpose

Define la forma y la disposición de las superficies de la interfaz, para que todas las pantallas usen el espacio de manera coherente.

## ADDED Requirements

### Requirement: La entrevista usa el ancho de las demás pantallas
- **Ancho de la pantalla:** la pantalla de entrevista MUST ocupar el mismo ancho de contenido que las demás pantallas autenticadas. Eso incluye su cabecera, el historial de mensajes y el campo de respuesta.
- **Ancho de cada mensaje:** cada mensaje MUST limitarse a un ancho de lectura cómodo, de unos 65 caracteres por línea en pantallas anchas.
- **Alineación:** los mensajes de la IA MUST ir a la izquierda y los del usuario a la derecha.

#### Scenario: Escritorio ancho
- **WHEN** el usuario abre una entrevista en curso en una pantalla de 1440 px
- **THEN** la cabecera y el campo de respuesta tienen el mismo ancho que la tarjeta de «Simular entrevista», y ninguna burbuja supera unos 65 caracteres por línea

#### Scenario: Celular
- **WHEN** el usuario abre la entrevista en una pantalla de 390 px
- **THEN** la pantalla ocupa todo el ancho disponible y las burbujas ocupan como máximo el 85 % de él
