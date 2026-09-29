## Why

La zona autenticada navega con dos enlaces en un header horizontal. Eso alcanzaba cuando solo había dos destinos, pero ya se queda corto en dos frentes.

El primero es práctico: una entrevista dejada a medias solo se recupera entrando a Historial y buscándola en la lista. El sistema sabe perfectamente que está en curso — la marca como `en_progreso` y hasta sabe por qué pregunta va — pero no lo dice en ningún sitio hasta que el usuario va a buscarlo.

El segundo es de fondo. El objetivo general del proyecto habla de *mejorar* el nivel de competencia, y la retroalimentación que lo sostendría hoy está atomizada: cada debilidad y cada sugerencia vive dentro del resultado de una entrevista concreta. Un egresado que hizo seis entrevistas no tiene forma de ver que la misma carencia le aparece una y otra vez, que es justo el dato que le diría qué estudiar.

## What Changes

**Frontend**

- Barra lateral izquierda en la zona autenticada, con la navegación del estudiante.
- El header se adelgaza: conserva la marca y el usuario, y cede la navegación al sidebar. No habrá los mismos enlaces en dos sitios.
- **BREAKING** (navegación): los enlaces "Nueva entrevista" e "Historial" desaparecen del header.
- En pantallas estrechas el sidebar se oculta y se abre como cajón desde un botón de menú, con cierre por Escape, por clic fuera y devolución del foco.
- Elemento contextual "Continuar entrevista", visible solo cuando el usuario tiene una entrevista sin terminar, indicando su área y en qué pregunta va.
- Página nueva "Mi perfil", de solo lectura, con los datos que ya devuelve `/api/auth/perfil`.
- Página nueva "Retroalimentación", que agrega las observaciones de todas las entrevistas del usuario.

**Backend**

- Nuevo endpoint `GET /api/evaluaciones/retroalimentacion/` que devuelve, por área, el reparto de respuestas entre las bandas de la rúbrica, y la lista de las observaciones más recientes con su debilidad y su sugerencia.
- No se añade ninguna llamada a la IA: la agregación es de datos ya almacenados.

**Fuera de alcance**

- No se separan Historial y Progreso. Siguen siendo una sola vista, como fija la capacidad `historial-progreso`.
- No se permite editar el perfil. Cambiar nombre, correo o carnet exigiría endpoints de escritura que no existen.
- No se resumen los textos de la IA ni se agrupan por similitud semántica. Las observaciones se muestran tal como se generaron.
- No se crean tests. La suite del backend queda en 94.

## Capabilities

### New Capabilities

- `navegacion-estudiante`: la navegación de la zona autenticada — qué destinos ofrece, cómo refleja el estado de la sesión del usuario y cómo se comporta cuando la pantalla no da para una barra fija.
- `retroalimentacion-acumulada`: la consulta del desempeño del usuario a lo largo de todas sus entrevistas, en términos de qué se le da bien, qué se le repite como carencia y qué se le ha sugerido mejorar.

### Modified Capabilities

<!-- Ninguna. `openspec/specs/` sigue vacío: `historial-progreso` y `landing-publica`
     existen solo como deltas en changes sin archivar. Este cambio no altera lo que
     esas capacidades especifican — la vista de historial y progreso sigue siendo una
     sola, y la landing no se toca. -->

## Impact

**Código afectado**

- `frontend/src/components/layout/` — el header pierde su navegación y aparece el sidebar.
- `frontend/src/router/RutaProtegida.tsx` — el shell autenticado pasa a tener dos columnas.
- `frontend/src/router/index.tsx` — dos rutas nuevas: perfil y retroalimentación.
- `frontend/src/features/perfil/` y `frontend/src/features/retroalimentacion/` — features nuevas.
- `frontend/src/types/evaluacion.ts` y `frontend/src/api/evaluaciones.ts` — tipo y función de la retroalimentación acumulada.
- `backend/apps/evaluaciones/{services,views,urls}.py` — la agregación y su endpoint.

**Decisión de alcance que conviene revisar**

La retroalimentación acumulada incluirá las respuestas de entrevistas **abandonadas**, no solo de las finalizadas. Se aparta de `calcular_estadisticas`, que solo cuenta las finalizadas, y es deliberado: una puntuación media es una medida del rendimiento y necesita entrevistas completas para ser comparable, mientras que una debilidad detectada en la pregunta 3 de una entrevista que se dejó a medias sigue siendo una debilidad real que conviene mostrar.

**Sin impacto**

- El flujo de entrevista, la evaluación y la autenticación no cambian.
- La landing pública y su header propio no se tocan: el sidebar es solo de la zona autenticada.
- Los 94 tests del backend siguen siendo la red de seguridad y deben continuar en verde.
