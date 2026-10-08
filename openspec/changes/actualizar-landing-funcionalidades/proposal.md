## Why

La landing se escribió cuando la entrevista se armaba "por área" y no existía el
módulo de CV. Desde entonces el sistema cambió —se elige un puesto, la nota se
publica al terminar, las preguntas se adaptan, hay historial y retroalimentación
acumulada, y existe la revisión del CV contra un ATS— y la página pública
promete cosas que ya no son ciertas. En una defensa de tesis, "la página dice X
y el sistema hace Y" es una objeción fácil; además, la función que más distingue
al proyecto (el CV) no aparece.

## What Changes

- **Hero**: corregir la errata del título; el subtítulo habla de puesto, de la
  evaluación y de la revisión del CV; "Resultados al instante" pasa a "Nota al
  terminar".
- **Cómo funciona**: "Eliges puesto y nivel" (tecnología opcional); el paso 2
  explica que desde la tercera pregunta la entrevista se ajusta a cómo vas.
- **Qué recibes**: se reemplaza "la misma respuesta obtiene siempre la misma
  nota" —una promesa que un modelo de lenguaje no garantiza— por lo cierto: una
  rúbrica fija y una evaluación que no depende del orden ni del historial. Se
  añade una tarjeta "Tu progreso" (historial, estadísticas por tema,
  retroalimentación acumulada).
- **Nueva sección "Revisa tu CV"**: qué ve el ATS, el mapa frente a una
  convocatoria y las sugerencias de IA rotuladas, con el aviso de que no da un
  puntaje porque los ATS reales no puntúan.
- **"Áreas" pasa a "Puestos"**: el carrusel muestra los puestos del catálogo
  con las áreas que cubre cada uno. **BREAKING** respecto al requisito del
  cambio `rediseno-landing-avanzado` ("las áreas técnicas se exploran mediante
  un carrusel"), que este reemplaza.
- **Franja de datos**: puestos · preguntas · áreas · niveles; se quita "100
  puntos por respuesta", que no es un dato del catálogo.
- **Vista previa**: encuadre por puesto y el resultado rotulado "al terminar".
- **Navegación**: enlaces a "Revisión de CV" y "Puestos" en el encabezado y el
  pie.
- **Limpieza**: el carrusel se generaliza (`CarruselDeTarjetas`) y se elimina
  `CarruselAreas`, que deja de usarse.

## Capabilities

### New Capabilities
- `landing-publica`: se añaden los requisitos de veracidad del contenido, la
  sección de CV y el carrusel de puestos (la capacidad está descrita en cambios
  anteriores aún sin archivar).

### Modified Capabilities

## Impact

- **Frontend**: `features/landing/` (secciones Hero, ComoFunciona, QueRecibes,
  AreasTecnicas → PuestosDisponibles, nueva RevisaTuCV; componentes
  FranjaDatos, VistaPreviaEntrevista, HeaderLanding, FooterLanding,
  CarruselAreas → CarruselDeTarjetas).
- **Backend**: ninguno. `/api/catalogos/publico/` ya publica `puestos` con sus
  `areas`.
- Sin dependencias nuevas; se mantiene el sistema visual "vidrio".
