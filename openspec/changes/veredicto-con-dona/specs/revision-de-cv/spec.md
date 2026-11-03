## Purpose

Diagnosticar por qué un currículum queda fuera de la búsqueda de un reclutador que usa un ATS, midiendo el documento regla por regla y sin publicar nunca un puntaje.

## ADDED Requirements

### Requirement: El veredicto del CV lo define un cambio posterior
La dona de dos estados y el veredicto por gravedad que este cambio introdujo fueron reemplazados, por decisión del usuario, en `estado-del-cv-por-datos-clave`: tres estados por dato (extraído, incompleto, no extraído), el estado del CV por datos clave y «Formato» con enlaces. De este cambio se mantiene que el centro de la dona SHALL mostrar el total («8 datos revisados», nunca una fracción), con una leyenda en texto con cada cantidad y una frase para el lector de pantalla.

#### Scenario: Total en el centro
- **WHEN** el usuario mira la dona
- **THEN** el centro dice «8 datos revisados», no una fracción

