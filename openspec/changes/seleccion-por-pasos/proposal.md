## Why

Con solo 6 puestos, el buscador de "Nueva entrevista" obliga al usuario a adivinar qué escribir cuando en realidad solo tiene que **elegir**. Además, transmite la idea de que hay algo escondido que encontrar. El usuario final necesita un flujo guiado en el que decida, paso a paso, a qué puesto postula, con qué tecnologías y a qué nivel. En Full Stack, además, quiere elegir por separado el framework de frontend y el de backend, en lugar de cuatro combinaciones fijas.

## What Changes

- **BREAKING (interfaz):** se elimina el buscador de puestos y su panel de sugerencias. La pantalla pasa a ser un flujo de **3 pasos**:
  1. puesto (6 tarjetas visibles);
  2. tecnología;
  3. nivel.

  Cada paso completado se pliega en una capa "✓ Puesto: … ✎" que se puede reabrir para editar. Los pasos todavía no alcanzados se ven bloqueados.
- En **Full Stack**, el paso de tecnología tiene dos grupos, "Frontend" (React, Angular, Vue) y "Backend" (Node.js, Python, Java, PHP), y hay que elegir uno de cada uno. Las cuatro combinaciones fijas actuales quedan inactivas; las entrevistas antiguas que las usan las conservan.
- **API:** `POST /api/entrevistas/` acepta `segunda_tecnologia` (obligatoria solo en puestos cuyas tecnologías tienen capa).
  - `EntrevistaSerializer` y `GET /api/entrevistas/ultima-configuracion/` exponen `segunda_tecnologia`.
  - `tecnologia_display` devuelve el nombre compuesto ("React + Node.js").
- **API:** cada tecnología de `GET /api/catalogos/puestos/` expone `capa` (`""`, `"frontend"` o `"backend"`).
- **BREAKING (API):** `GET /api/catalogos/puestos/` ya no devuelve `mas_practicados` ni `palabras_clave`. Se elimina "Lo más practicado" de la pantalla.
- **Convocatoria:** el perfil detectado pasa de `tecnologia` (un código) a `tecnologias` (lista de hasta 2, una por capa). Los perfiles guardados con el formato anterior se siguen leyendo.
- **Se elimina el código muerto:**
  - en el frontend: buscador, sugerencias, resultados filtrados, la librería de búsqueda y sus tests, el resaltado de texto y el parámetro `?q=`;
  - en el backend: la columna `Puesto.palabras_clave` y el cálculo de "lo más practicado";
  - en OpenSpec: el cambio sin archivar `sugerencias-bajo-el-buscador`.
- **Se mantienen sin cambios de comportamiento:**
  - "Repetir última", el análisis de convocatoria y la preselección `?puesto=&nivel=` (ahora rellenan los pasos);
  - la barra de resumen con "Comenzar entrevista";
  - el plan de 5 preguntas, las áreas, la rúbrica y las estadísticas.

## Capabilities

### New Capabilities
- `seleccion-por-pasos`: cómo el candidato configura una entrevista en tres pasos editables (puesto, tecnologías del puesto —dos en Full Stack— y nivel), y cómo el servidor valida y guarda esa elección.

### Modified Capabilities
Ninguna en `openspec/specs/` (está vacío).

Nota: este cambio **reemplaza** dos partes del requisito "Búsqueda de puestos en el navegador" y de "Lo más practicado sale de datos reales", ambos de `rediseno-seleccion-entrevista`, que sigue sin archivar. También **sustituye por completo** a `sugerencias-bajo-el-buscador`, cuya carpeta se borra. `rediseno-seleccion-entrevista` debe archivarse antes que este cambio.

## Impact

- **Backend:**
  - `apps/catalogos`: modelos, `datos.py`, selectores, serializers, vistas, `cargar_catalogos`, migraciones 0010–0011 y tests.
  - `apps/entrevistas`: modelo, serializers, vistas, servicio `iniciar` y migración 0008.
  - Convocatoria: `apps/entrevistas/convocatorias.py`, `integrations/ia/prompts/analista_convocatoria.py` e `integrations/ia/fake.py`.
- **Capa de IA de la entrevista:** sin cambios. `ContextoDeEntrevista.tecnologia` sigue siendo un texto ("React + Node.js").
- **Frontend:**
  - `features/seleccion/` reescrito por pasos;
  - `types/`, `api/entrevistas.ts` y `lib/`;
  - eliminación de `components/ui/TextoResaltado.tsx`.
- **Datos:** las 14 entrevistas locales conservan su tecnología. Las migraciones son reversibles y se hace un respaldo antes de aplicarlas.
- **Docs:** `CLAUDE.md`.
