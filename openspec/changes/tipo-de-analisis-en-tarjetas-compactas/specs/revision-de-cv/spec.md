## Purpose

Diagnosticar por qué un currículum queda fuera de la búsqueda de un reclutador que usa un ATS, midiendo el documento regla por regla y sin publicar nunca un puntaje.

## ADDED Requirements

### Requirement: El control del tipo de análisis lo define un cambio posterior
Las dos tarjetas-radio compactas que este cambio introdujo fueron reemplazadas, por decisión del usuario, por dos pestañas: el control del tipo de análisis lo define `tipo-de-analisis-en-pestanas`. Se mantiene de este cambio que bajo el tipo NO SHALL haber texto de ayuda ni explicación del ATS, y que «Análisis general» SHALL venir elegido al entrar.

#### Scenario: Entrada
- **WHEN** el usuario entra a `/mi-cv`
- **THEN** «Análisis general» está elegido y no hay texto de ayuda bajo el tipo
