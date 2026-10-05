## Context

Ver `proposal.md` — Why para la motivación y `specs/revision-de-cv/spec.md` para
los requisitos.

Lo que ya existe y condiciona el enfoque:

- `integrations/documentos/` tiene cero dependencia de Django y se prueba con
  Python puro. Ahí viven `extractor.py` (PDF/DOCX → texto, coordenadas, tablas,
  imágenes), `ats.py` (las nueve verificaciones) y `secciones.py` (diccionario
  curado de títulos ES/EN). Son 27 tests que no deben romperse.
- `secciones.py` ya detecta los títulos del CV, pero solo responde *si existen*.
  Para el mapa de evidencia hay que saber además *dónde empieza y acaba cada
  bloque*.
- `apps/curriculums/` guarda el texto extraído y el análisis en `JSONField`, nunca
  el archivo. `Curriculum.puesto` es FK no nula y parte de
  `UniqueConstraint(usuario, puesto, hash_texto)`.
- El corpus de prueba se genera con `tests/fixtures/cv/generar.py`, que escribe los
  PDF a mano sin librería para controlar las coordenadas exactas.
- `apps/common/exceptions.py` es el único sitio que traduce las excepciones de
  documento a HTTP 400.

## Goals / Non-Goals

**Goals**

- Que la referencia del análisis de contenido sea un texto que el usuario aporta,
  no una definición interna del sistema.
- Que el camino sin convocatoria produzca un resultado completo por sí mismo.
- Que toda afirmación sobre el CV siga saliendo de medir el documento, no de un
  juicio.
- No añadir dependencias ni primitivas de UI nuevas.

**Non-Goals**

- No se construye la revisión de contenido con IA. Queda para después, y tomará la
  convocatoria como referencia.
- No se toca el módulo de entrevistas, ni `PLAN_POR_PUESTO`, ni el catálogo.
- No se implementa búsqueda semántica ni normalización morfológica: la coincidencia
  es léxica contra un diccionario de variantes.

## Decisions

### El mapa de evidencia en tres estados, no en dos

Por cada requisito: `demostrado` (aparece en experiencia o proyectos), `declarado`
(solo en habilidades) o `ausente`.

*Alternativa considerada: presente/ausente.* Se descarta porque pierde el matiz que
de verdad distingue a un candidato. "Django" en una lista separada por comas y
"Django" dentro de un logro indexan igual para la máquina y valen muy distinto para
la persona que lee, y el candidato promedio no sabe que esa diferencia existe.
Decírselo es el aporte que ninguna comparación binaria da.

Requiere segmentar el CV, que es la pieza nueva: `secciones.py::segmentar()`
reutiliza `TITULOS_POR_SECCION` y devuelve el bloque de texto de cada sección.
Va ahí y no en un módulo nuevo porque el diccionario que necesita ya vive ahí.

### La degradación se declara, no se esconde

Si los títulos del CV no se reconocieron —el caso de `titulos_creativos.pdf`— no
hay secciones que segmentar y el estado cae a presente/ausente. Eso **se informa**.

Encadena con `secciones_no_reconocidas`, que el módulo ya reporta: una debilidad de
formato degrada el análisis de contenido. Es la misma clase de cascada que ya se
demuestra con `dos_columnas.pdf`, y mostrar un mapa a medias sin explicar por qué
sería peor que no mostrarlo.

### Corto cuando no hay texto que comparar

Si el CV no tiene capa de texto, la brecha no se calcula ni se guarda. Mostrar
"0 de 6 requisitos" sería falso: no es que el candidato no cumpla, es que nadie
puede leer el documento. Es el mismo criterio con el que `ats.py` ya calla las
otras ocho reglas en ese caso, por la misma razón — no ahogar la única causa real
bajo hallazgos derivados.

### Extracción léxica contra diccionario, no IA

`terminos.py` mapea término canónico → variantes, al estilo de `secciones.py`.
Coincidencia por límite de palabra, para que "js" no encaje en "jsx" ni "react" en
"reactivo".

*Alternativa considerada: pedirle a la IA que extraiga los requisitos.* Resuelve
los requisitos descriptivos ("experiencia con bases de datos relacionales", sin
nombrar ninguna) que el diccionario pierde. Se descarta para esta fase por tres
razones: no es reproducible, puede añadir requisitos que la convocatoria no dice, y
en una defensa "estos términos aparecen literalmente en el texto" es una
afirmación más fuerte que "la IA decidió que estos eran los requisitos". Las dos
vías son complementarias y no excluyentes: el diccionario captura los requisitos
duros, que son justo los que usa la búsqueda booleana de un reclutador.

**Límite que hay que declarar en el docstring y en la interfaz:** solo encuentra
lo que está en el diccionario. Su cobertura es el techo de la función. Lo que nunca
hace es inventar un requisito.

### Sin puntaje de ajuste

*Alternativa considerada: un "72% compatible".* Se descarta por lo mismo que el
módulo ya rechaza el "Puntaje ATS sobre 100": nadie puede sostener de dónde sale el
número. "4 de 6 requisitos obligatorios" dice lo mismo y se defiende.

### El hash de la convocatoria vacía no es NULL

Sin convocatoria se guarda el hash de la cadena vacía. Postgres trata los NULL como
distintos entre sí, así que con NULL la `UniqueConstraint` no dispararía y el caché
quedaría roto **justo en el caso más común**. Es el tipo de fallo que no da error:
simplemente se acumulan filas duplicadas y se repite el trabajo.

`AnalisisATS.brecha` sí es NULL cuando no hubo convocatoria, que no es lo mismo que
una brecha vacía (convocatoria aportada pero sin términos reconocibles).

### Las viñetas se rotulan como etapa distinta

A un ATS le da igual si una viñeta tiene métricas. El análisis de redacción
concierne a la persona que lee el CV **después** de que la máquina lo encontró.

La interfaz separa las dos etapas con encabezados propios. Meter las viñetas bajo
"filtros ATS" sería impreciso, y la precisión sobre qué hace un ATS es lo que
sostiene la credibilidad del módulo entero.

### El recuadro de arrastre se extrae, no se duplica

`SubirArchivo.tsx` tiene la lógica de arrastre, el conteo de archivos soltados, la
validación de extensión y peso, y el botón de quitar. La convocatoria necesita lo
mismo. Se extrae a un componente compartido en vez de copiarlo, porque dos copias
divergen en el primer arreglo que se le haga a una.

### El enlace a la entrevista pierde la preselección

Sin puesto almacenado, el CTA final lleva a `/nueva-entrevista` sin preseleccionar.

*Alternativa considerada: inferir el puesto desde los términos encontrados.* Se
descarta: es una inferencia que puede equivocarse, y la pantalla de destino ya está
diseñada para elegir en un clic. Un acierto ahorra un clic; un error desconcierta.

## Risks / Trade-offs

- **El diccionario de términos se queda corto** → su cobertura es el techo
  declarado de la función, y ampliarlo es añadir una entrada. Nunca produce un
  falso requisito, que es el error que sí importaría.
- **La segmentación depende de títulos reconocidos**, así que el mapa de evidencia
  degrada en los CV peor formateados — que son justo los que más ayuda necesitan →
  la degradación se informa y encadena con el hallazgo de formato que la causa.
- **Coincidencias de término en contexto equivocado**: "Java" dentro de
  "JavaScript", "React" en "reactivo" → coincidencia por límite de palabra y el
  diccionario ordenado para preferir la variante más larga. Tests dedicados a estos
  dos casos concretos.
- **Quitar `puesto` es BREAKING** para `POST /api/curriculums/` → el único cliente
  es este frontend y se actualiza en el mismo cambio. Los 13 tests de la app que
  hoy mandan `puesto` hay que actualizarlos.
- **Las filas existentes de `Curriculum` pierden su puesto** al migrar → el dato no
  afectaba a nada (es la premisa del cambio), y las filas sobreviven.
- **El texto de la convocatoria es contenido de un tercero** (una empresa) que
  queda almacenado → se guarda solo para el caché y el análisis del propio usuario,
  no se publica ni se comparte. No contiene datos personales del usuario.

## Migration Plan

Migración `0002` de `curriculums`, reversible: elimina `puesto`, añade
`convocatoria`, `hash_convocatoria`, `brecha`, `inventario` y `vinetas`, y
reemplaza la restricción de unicidad.

Para que el reverso funcione, `puesto` se vuelve a añadir como nulable: una
`RemoveField` inversa no puede reponer una columna no nula sin un valor por
defecto. Es el mismo problema que ya se resolvió así en las migraciones de
`entrevistas`.

Revertir es revertir la migración y el commit; no hay estado externo ni banderas.

## Open Questions

Ninguna que afecte al alcance, al enfoque o al desglose de tareas.
