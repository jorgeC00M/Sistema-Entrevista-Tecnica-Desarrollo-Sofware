## Purpose

Define la forma y la disposición de las superficies de la interfaz, para que todas las pantallas usen el espacio de manera coherente.

## ADDED Requirements

### Requirement: El contenido llena el espacio que deja el sidebar
En las pantallas autenticadas, el contenido MUST ocupar todo el ancho disponible a la derecha del sidebar, menos los márgenes laterales, tanto con el sidebar abierto como plegado. MUST NOT quedar una franja vacía a la derecha del contenido.

Los elementos que limitan su propio ancho por legibilidad MUST conservar ese límite: los mensajes del chat y los párrafos de introducción.

#### Scenario: Sidebar plegado en 1440 px
- **WHEN** el usuario pliega el sidebar en una pantalla de 1440 px
- **THEN** las tarjetas de la pantalla llegan hasta el margen derecho, sin franja vacía

#### Scenario: Monitor de 1920 px
- **WHEN** el usuario abre cualquier pantalla autenticada en 1920 px
- **THEN** el contenido llega hasta el margen derecho y las burbujas del chat siguen sin pasar de unos 65 caracteres por línea
