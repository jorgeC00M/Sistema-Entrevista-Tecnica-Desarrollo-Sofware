## Why

El veredicto del Resumen («El ATS lee tu CV con pérdidas») es hoy una franja de color con una sola línea de causa («Lo principal: …»). No muestra cuántos datos se extrajeron, no explica por qué tiene ese color y obliga a bajar hasta el espejo para ver la proporción.

Jorge pidió reemplazarlo por un banner de dos paneles:
- a la izquierda, una dona con los datos por estado y el total en el centro;
- a la derecha, el estado, el título, la regla que activó el color y un bloque «Formato» con los errores.

Aprobó dos decisiones:
- **Solo dos estados, los que se miden:** extraídos y no extraídos. No existe un estado «incompleto» en la medición y no se inventa.
- **El bloque «Formato» muestra los errores como diagnóstico.** Usa su título, por ejemplo «Tus habilidades están en barras gráficas». «Lo que debes hacer», al lado, sigue mostrando la acción para corregir esos mismos errores. Son los mismos errores, contados una vez como causa y otra como arreglo.

## What Changes

- **Panel izquierdo, la dona** (`conic-gradient`), que reparte los 8 datos entre extraídos (color de éxito) y no extraídos (color de error).
  - En el centro va «8 datos revisados»: el total, nunca una fracción.
  - Debajo, una leyenda en texto con la cantidad de cada estado («6 extraídos», «2 no extraídos»).
  - Para el lector de pantalla es una imagen con su nombre: «8 datos revisados: 6 extraídos, 2 no extraídos».
- **Panel derecho:**
  - la etiqueta del estado («Con pérdidas»);
  - el título («El ATS lee tu CV con pérdidas»);
  - la regla que activó el color, una por nivel. Por ejemplo, en «Con pérdidas»: «Falta al menos un dato o hay un error que le resta visibilidad»;
  - el bloque «Formato», con los mismos errores que hoy muestra «Lo que debes hacer» (los 3 más graves), cada uno con el icono de su severidad y su diagnóstico. Si no hay errores, lo dice.
- **Se reemplaza la línea «Lo principal: …»:** los errores del bloque «Formato» la sustituyen.
- **Reutilización:** la regla del veredicto (`veredictoDeLegibilidad`) y los nombres (`VEREDICTOS`) no cambian. Se agrega la regla de cada nivel en `VEREDICTOS`. Una función común da las 3 correcciones prioritarias, que comparten el banner y «Lo que debes hacer».

## Capabilities

### New Capabilities
- `revision-de-cv`: el banner del veredicto con la dona y el bloque «Formato». Aún no tiene spec principal, así que la delta es ADDED, como en los cambios anteriores.

### Modified Capabilities

## Impact

- **Frontend:**
  - `features/curriculum/components/VeredictoDeLegibilidad.tsx`, reescrito;
  - `features/curriculum/hallazgos.ts` y su test: la regla por nivel, las correcciones prioritarias y quizás quitar `causa` si queda sin uso;
  - `features/curriculum/components/LoQueDebesHacer.tsx`, que usa la función común.
- **Specs sin archivar que describen el veredicto como una línea con «la causa principal»:** `diferenciar-revision-y-comparacion-de-cv`.
- **Documentación:** `CLAUDE.md`.
- **Sin cambios:**
  - el backend y el API;
  - la regla del veredicto;
  - `AnalisisATS.veredicto` del historial;
  - el espejo y Plan de Mejora.
