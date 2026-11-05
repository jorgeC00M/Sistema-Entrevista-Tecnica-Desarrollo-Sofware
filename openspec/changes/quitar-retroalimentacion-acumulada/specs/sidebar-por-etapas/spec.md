## ADDED Requirements

### Requirement: «Tu progreso» solo lleva al historial
El grupo «Tu progreso» del menú lateral SHALL tener un solo destino, «Historial y progreso». La aplicación MUST NOT ofrecer una pantalla de retroalimentación acumulada. Una visita a `/retroalimentacion` SHALL llevar a `/historial` sin dejar la ruta antigua en el historial del navegador.

#### Scenario: Menú lateral
- **WHEN** el usuario abre el menú en escritorio
- **THEN** ve «PREPARARTE» con «Revisar mi CV» y «TU PROGRESO» solo con «Historial y progreso»

#### Scenario: Enlace guardado
- **WHEN** el usuario abre `/retroalimentacion`
- **THEN** llega a «Historial y progreso», y «atrás» no lo devuelve a `/retroalimentacion`

### Requirement: La retroalimentación vive en el reporte de cada entrevista
La retroalimentación de una entrevista SHALL consultarse en su reporte, al que se llega con «Ver» desde «Historial y progreso»: el Resumen, el Plan de mejora y la Transcripción. El sistema MUST NOT exponer un endpoint que acumule las evaluaciones de todas las entrevistas: `GET /api/estadisticas/retroalimentacion/` y el prefijo `/api/estadisticas/` SHALL responder 404.

Cada pregunta SHALL seguir guardando su propia área, y el reporte la SHALL mostrar.

#### Scenario: Endpoint retirado
- **WHEN** un cliente autenticado pide `GET /api/estadisticas/retroalimentacion/`
- **THEN** recibe 404

#### Scenario: Área por pregunta
- **WHEN** el usuario abre el reporte de una entrevista de Backend
- **THEN** cada pregunta muestra el área que le asignó el plan del puesto

### Requirement: La landing no promete un acumulado
La página pública MUST NOT prometer un «promedio por tema» ni una «retroalimentación acumulada». La tarjeta «Tu progreso» SHALL describir el historial, la evolución por nivel y puesto, y el reporte de cada entrevista con su plan de mejora.

#### Scenario: Tarjeta «Tu progreso»
- **WHEN** un visitante lee «Qué recibes» en la landing
- **THEN** «Tu progreso» habla del historial, la evolución y el reporte de cada entrevista, sin mencionar un acumulado
