## Why

La pantalla de revisión de CV obliga hoy a elegir un puesto —backend, frontend o
full-stack— antes de subir el archivo. Esa elección **no tiene ningún efecto sobre
el análisis**: la función que analiza es `analizar(documento)` y no recibe el
puesto; en `apps/curriculums/services.py` solo se usa para la clave del caché y
para guardar la fila. Elegir backend, frontend o full-stack produce un resultado
idéntico byte por byte.

Es decir: un paso obligatorio sin consecuencia. Peor que no tenerlo, porque le
promete al usuario que su elección importa.

El puesto estaba ahí como referencia para interpretar el contenido del CV en una
fase posterior, comparándolo contra las áreas que `PLAN_POR_PUESTO` asigna a ese
puesto. Pero esa referencia siempre fue la débil: **la definí yo para diseñar
entrevistas, no es lo que pide el mercado**. Decir "tu CV no evidencia APIs" se
sostiene solo como "no evidencia lo que este sistema evalúa", que no es lo que el
usuario necesita saber.

Una convocatoria real sí es una referencia de verdad. "La convocatoria pide Docker
y tu CV no lo menciona" es un hecho verificable, no una opinión. Y es además la
otra mitad de lo que hace un ATS: parsear el documento **y** compararlo contra la
requisición del puesto. Hoy el módulo solo replica la primera mitad.

Se evaluó antes y se descartó por considerarse "un módulo dentro de un módulo",
pero ese razonamiento apuntaba a un **catálogo curado de ofertas** —tabla nueva,
migración, redactar diez o quince vacantes—. Pegar la convocatoria que el usuario
ya tiene abierta en otra pestaña no cuesta nada de eso.

## What Changes

- **Fuera el selector de puesto** de la pantalla de CV. Deja de pedirse y deja de
  guardarse: no servía para nada en este módulo. **BREAKING** para
  `POST /api/curriculums/`, que ya no acepta ni exige `puesto`.
- **Entra un campo de convocatoria, opcional**, con dos vías: pegar el texto o
  subir un archivo PDF/DOCX. Reutiliza el extractor que ya existe.
- **Mapa de evidencia determinista**, no una lista de presente/ausente. Por cada
  requisito que la convocatoria pide, una de tres respuestas: *demostrado en la
  experiencia*, *solo declarado en la lista de habilidades*, o *ausente*. Es el
  aporte que ninguna comparación binaria da: "Django" en una lista separada por
  comas vale mucho menos que "Django" dentro de un logro, y cualquier reclutador
  hace esa diferencia aunque el candidato no sepa que la hace. Sin IA.
- **Distinción entre requisitos y deseables**: una convocatoria suele separarlos
  con títulos ("Requisitos", "Deseable", "Nice to have"). Faltar un deseable no es
  lo mismo que faltar un obligatorio, y mostrarlos con el mismo peso alarmaría de
  más.
- **Sin convocatoria el módulo no queda degradado**: si la opción es de verdad
  opcional, el resultado sin ella tiene que valerse solo. Dos añadidos lo
  consiguen, y el primero sale gratis:
  - **Inventario de términos** — el mismo diccionario que alimenta la brecha
    produce, sin nada con que comparar, "lo que un reclutador puede buscar y
    encontrar en tu CV". Y hace algo que el espejo solo no puede: si las
    habilidades están en barritas de nivel, el inventario sale vacío, lo que
    convierte la advertencia `habilidades_en_graficos` de sospecha en prueba.
  - **Viñetas de logro frente a viñetas de tarea** — la única crítica de contenido
    que no necesita referencia. Va **rotulada aparte de las secciones de ATS**,
    porque a un ATS le da igual si hay métricas: es consejo para el humano que lee
    el CV después de que la máquina lo encontró, y mezclarlo bajo "filtros ATS"
    sería impreciso.
- Así solo **una** de las cuatro secciones del resultado cambia según haya
  convocatoria o no: el inventario pasa a ser la brecha. La convocatoria deja de
  ser la diferencia entre útil e inútil y pasa a afinar una sección.
- La clave del caché pasa de `(usuario, puesto, hash_texto)` a
  `(usuario, hash_texto, hash_convocatoria)`: el mismo CV contra otra convocatoria
  es otro análisis.

## Capabilities

### New Capabilities

- `revision-de-cv`: la capacidad de diagnosticar un currículum contra los filtros
  de un ATS y, opcionalmente, contra una convocatoria concreta. No existe spec
  todavía —la fase 1 se implementó desde un archivo de plan, no desde un change de
  OpenSpec— así que este delta establece también los requisitos de la
  parseabilidad que ya están construidos, además de los nuevos de la brecha.

### Modified Capabilities

Ninguna. El módulo de entrevistas no se toca: `seleccion-area` sigue como está y
`PLAN_POR_PUESTO` se mantiene intacto para lo que sí es su trabajo, diseñar
entrevistas.

## Impact

**Backend**
- `integrations/documentos/terminos.py` — nuevo, diccionario curado de términos
  técnicos con sus variantes.
- `integrations/documentos/convocatoria.py` — nuevo, separa requisitos de
  deseables y extrae los términos de cada bloque.
- `integrations/documentos/brecha.py` — nuevo, el mapa de evidencia.
- `integrations/documentos/vinetas.py` — nuevo, logro frente a tarea.
- `integrations/documentos/secciones.py` — se amplía con `segmentar()`, que parte
  el CV por sus títulos reutilizando el diccionario que ya está ahí. Es lo que
  permite saber **dónde** aparece cada término y no solo si aparece.
- `apps/curriculums/models.py` — fuera `puesto`, dentro `convocatoria` y
  `hash_convocatoria`; nueva restricción de unicidad; `brecha`, `inventario` y
  `vinetas` en `AnalisisATS`.
- `apps/curriculums/{services,serializers,views}.py` — el puesto sale del contrato
  y entra la convocatoria.
- Migración `0002` — reversible, como el resto del proyecto.

**Frontend**
- `features/curriculum/components/CampoConvocatoria.tsx` — nuevo.
- `features/curriculum/components/BrechaDeRequisitos.tsx` — nuevo.
- `features/curriculum/components/InventarioDeTerminos.tsx` — nuevo.
- `features/curriculum/components/VinetasDeLogro.tsx` — nuevo.
- `features/curriculum/components/SubirArchivo.tsx` — se extrae su recuadro de
  arrastre a un componente compartido, para que la convocatoria lo reutilice en
  lugar de duplicar la lógica de arrastre y validación.
- `features/curriculum/pages/CurriculumPage.tsx` — fuera las tarjetas de puesto.
- `types/curriculum.ts`, `api/curriculums.ts` — el contrato nuevo.

**Sin cambios**: el extractor, las nueve verificaciones de parseabilidad, el
espejo del ATS y sus 27 tests. Lo nuevo se suma al resultado, no lo reemplaza; si
alguno de esos 27 falla al terminar, es una regresión y no un ajuste esperado.

**Datos existentes**: las filas de `Curriculum` sobreviven a la migración; se
pierde qué puesto se había elegido, que —como se explicó— no afectaba a nada.
