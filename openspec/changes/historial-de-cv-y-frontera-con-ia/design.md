## Context

Ver `proposal.md` — Why para la motivación y `specs/revision-de-cv/spec.md` para
los requisitos.

Lo que ya existe y condiciona el enfoque:

- `apps/curriculums/selectors.py` tiene `curriculums_del_usuario()` y
  `curriculum_del_usuario()`, ambos filtrando por usuario dentro de la consulta.
- `CurriculumListCreateView` (GET y POST) y `CurriculumDetailView` están
  publicados y probados. El GET del listado devuelve `CurriculumListaSerializer`,
  con `parseabilidad` y `con_convocatoria` por fila.
- `api/curriculums.ts` ya exporta `obtenerHistorialDeCurriculums()`.
- `CurriculumPage` guarda el análisis en un único estado `resultado`, que es lo
  que la zona de resultados consume.
- `apps/entrevistas/tests/test_privacidad.py` es el precedente del blindaje: un
  proveedor espía que registra cada texto recibido y comprueba que no contiene los
  datos identificatorios.

Es decir: el backend está completo y el frontend es lo único que falta. No hay que
diseñar endpoints, solo consumirlos.

## Goals / Non-Goals

**Goals**

- Que el usuario pueda comprobar si su currículum mejoró tras corregirlo.
- Que ningún endpoint del módulo quede sin cliente.
- Que la frontera con la capa de IA esté verificada y no solo documentada.

**Non-Goals**

- No se construye ninguna métrica de evolución entre análisis.
- No se añaden pruebas del frontend, ni se despliega, ni se corrige
  `docs/arquitectura.md` ni la landing.
- No se toca `integrations/documentos/` ni el módulo de entrevistas.
- No se implementa la revisión de contenido con IA. Este cambio la prepara
  poniéndole una barrera, no la construye.

## Decisions

### El historial se muestra al llegar, no debajo del resultado

*Alternativa considerada: una sección al final de la pantalla.* Se descarta porque
la pantalla ya es larga —convocatoria, CV, espejo, brecha o inventario, dos listas
de hallazgos y viñetas—. El historial acabaría fuera de vista justo cuando el
usuario termina de analizar.

Al entrar sin resultado se muestra la lista; al analizar, el resultado la
reemplaza. Progresivo, y el espacio que ocupa es el que estaba vacío de todas
formas.

### Abrir un análisis previo reutiliza el mismo estado

`onAbrir(id)` pide el detalle y lo coloca en `resultado`, el mismo estado que llena
un análisis nuevo. Así la zona de resultados no necesita saber de dónde vino lo que
muestra, y no hay dos caminos de renderizado que puedan divergir.

Es además lo que da uso real a `CurriculumDetailView`. Sin esta acción el historial
sería una lista decorativa y el endpoint seguiría muerto en la práctica, solo con
una apariencia de uso.

### La comparación es visual, no calculada

*Alternativa considerada: mostrar el delta ("+2 campos desde tu último análisis").*
Se descarta: dos análisis pueden tener convocatorias distintas, así que la resta
entre sus resultados no significa nada. Es el mismo error que el módulo ya evita al
no publicar un puntaje de compatibilidad, y cometerlo aquí lo invalidaría ahí.

Las filas ordenadas con su propio resultado dejan la comparación a la vista sin
afirmar nada que no se pueda sostener.

### El blindaje es una prueba de arquitectura, no de comportamiento

Lo natural sería replicar `test_privacidad.py`: un proveedor espía que registre lo
que recibe. **Pero hoy nada envía el CV**, así que ese test no tendría nada que
observar y pasaría por vacío — dando una falsa sensación de cobertura, que es peor
que no tenerlo.

Lo que sí se puede verificar ahora es la frontera: que `apps/curriculums` no
importe `integrations.ia`.

Dos capas, porque cada una cubre lo que la otra no ve:

1. **Estática**, recorriendo los módulos con `ast`: detecta el import declarado.
   Se usa `ast` y no una búsqueda de texto para que un comentario que mencione el
   módulo no rompa la prueba — y los docstrings de `apps/curriculums` lo
   mencionan varias veces, así que con `grep` el test sería rojo desde el primer
   día.
2. **En ejecución**, parcheando `get_proveedor` para que falle si se invoca:
   detecta un import indirecto a través de un tercer módulo, que el análisis
   estático no seguiría.

El docstring debe decir qué hacer cuando falle: o el CV se está enviando sin
anonimizar, o se añadió la fase de IA y el test hay que **reescribirlo** con un
proveedor espía que verifique el enmascarado — no borrarlo. Un test de frontera que
se elimina en silencio es exactamente cómo se pierde una garantía.

### El índice de `hash_texto` se elimina

La única consulta que lo usaría filtra por `(usuario, hash_texto,
hash_convocatoria)` a la vez, y el índice compuesto de la restricción de unicidad
la sirve por prefijo. Un índice de columna única sobre `hash_texto` nunca se
elegiría para esa consulta: solo cuesta mantener en cada escritura.

## Risks / Trade-offs

- **La prueba estática con `ast` podría no ver un import dinámico**
  (`importlib`, `__import__`) → la cubre la capa en ejecución, que es por qué hay
  dos y no una.
- **El historial crece sin límite** y la pantalla cargaría todas las filas → hoy
  son unidades por usuario; si llega a importar, el endpoint ya existe y añadir
  paginación es aditivo. Ponerla ahora sería resolver un problema que no se tiene.
- **Abrir un análisis antiguo no restaura la convocatoria en el formulario**, así
  que "reanalizar con lo mismo" exige volver a pegarla → aceptado: el análisis
  guardado ya tiene su resultado y el objetivo es consultarlo, no repetirlo.
- **Un análisis antiguo puede haberse hecho con un diccionario de términos
  anterior**, así que su brecha refleja las reglas de entonces → es el
  comportamiento correcto: el historial muestra lo que se midió, no lo que se
  mediría hoy. Lo mismo que ya se decidió al guardar el área en `Intercambio` en
  vez de recalcularla.

## Migration Plan

Migración `0005` de `curriculums`: un `AlterField` que quita `db_index`. Es un
`DROP INDEX`, así que no choca con los eventos de trigger pendientes que obligaron
a partir la `0002` en tres — pero se aplica y se revierte sobre la base real para
comprobarlo en vez de asumirlo.

Reversible y sin pérdida de datos: revertir recrea el índice.
