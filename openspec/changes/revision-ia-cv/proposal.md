## Why

El diagnóstico del CV dice **qué** falla ("4 viñetas sin resultado", "Django
solo declarado", "faltan 3 años") pero deja al usuario solo con el **cómo**
corregirlo. Redactar es justo lo que un modelo de lenguaje hace bien y lo que el
código no puede hacer; medir el documento es lo contrario. Además, nada conecta
hoy el módulo de CV con el de entrevistas, que es el núcleo de la tesis, y el
objetivo específico 6 pide evaluar dónde la IA aporta y dónde no.

Requiere `reglas-ats-ampliadas`: la minimización de datos se apoya en saber qué
texto es encabezado, y la sugerencia de brecha cubre los requisitos de
experiencia y cargo que ese cambio introduce.

## What Changes

- Una sección de **sugerencias de IA**, rotulada y separada de los hallazgos
  medidos, con cuatro partes:
  - reescritura de cada viñeta sin resultado;
  - cómo cerrar cada requisito `declarado` o `ausente` de la convocatoria;
  - **preguntas probables de entrevista** según el CV (y la convocatoria), cada
    una con el fragmento que la motiva, y un puesto sugerido que preselecciona
    la pantalla de nueva entrevista;
  - ortografía y redacción (erratas, primera persona, tiempos verbales).
- Los datos identificatorios **nunca** salen: el encabezado del CV no se envía y
  el resto se enmascara (correo, teléfono, enlaces, nombre).
- La IA nunca bloquea ni modifica el diagnóstico: si falla, el análisis llega
  completo y la sección dice que no está disponible.
- La pantalla de nueva entrevista acepta un puesto preseleccionado por URL.
- La prueba de frontera con la IA se **reescribe** con un proveedor espía, como
  manda su propia documentación.
- Se elimina el bloque fijo "Practicar la entrevista" de la pantalla del CV, que
  pasa a formar parte de las preguntas probables (con el mismo enlace como
  respaldo cuando la IA no está disponible).

## Capabilities

### New Capabilities
- `revision-de-cv`: se añaden los requisitos de las sugerencias de IA, la
  protección de datos personales y la conexión con la entrevista.

### Modified Capabilities

## Impact

- **Capa IA (sin Django)**: `integrations/ia/{base,fake,factory}.py`, nuevo
  `integrations/ia/prompts/revisor_cv.py`; nuevo
  `integrations/documentos/anonimizar.py`; `ats.py` expone sus patrones de
  contacto.
- **App**: nuevo `apps/curriculums/revision.py` (único importador de la IA),
  `models.py` (`revision_ia`), migración `0007`, `services.py`,
  `serializers.py`, `tests/test_frontera_con_ia.py` reescrito.
- **API**: `analisis.revision_ia` en las respuestas de `/api/curriculums/`.
  Ningún campo existente cambia. Un fallo del proveedor **no** cambia el código
  HTTP (sigue siendo 201).
- **Frontend**: `types/curriculum.ts`, `CurriculumPage.tsx`,
  `VinetasDeLogro.tsx`, `BrechaDeRequisitos.tsx`, componentes nuevos de la
  sección de IA, `SeleccionPuestoPage.tsx`.
- **Coste**: una llamada al proveedor por análisis nuevo; cero en caché.
- **Documentación**: `CLAUDE.md` deja de afirmar que el módulo no usa IA.
