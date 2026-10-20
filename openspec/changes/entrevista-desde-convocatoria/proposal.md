## Why

Quien practica para una postulación real ya tiene el aviso de trabajo en la mano. Hoy tiene que traducirlo a mano a puesto, tecnología y nivel, y la entrevista ignora lo que el aviso pide en concreto (por ejemplo "APIs REST, PostgreSQL, Git"). El enlace "Pegar la convocatoria" de la pantalla de nueva entrevista está deshabilitado con "Próximamente" a la espera de esto.

El sistema ya tiene casi todas las piezas en el módulo de CV:
- extraer texto de PDF/DOCX y rechazar escaneados;
- partir una convocatoria en requisitos, años y cargo;
- reconocer tecnologías;
- enmascarar contactos.

Falta usarlas para **configurar y orientar una entrevista**.

## What Changes

- **Pegar o subir la convocatoria** desde la pantalla de nueva entrevista: texto de hasta 5000 caracteres, o un archivo PDF/DOCX. El archivo no se guarda.
- **Detección del perfil**, en dos capas:
  - el código extrae de forma determinista las tecnologías reconocidas, los años y el cargo;
  - la IA clasifica en el catálogo: puesto, tecnología **de ese puesto** y nivel, y resume hasta 8 requisitos.
  - Un parser **ancla** la respuesta: descarta lo que no esté en el catálogo activo o no aparezca en el aviso.
  - Si no hay un puesto de desarrollo de software reconocible, se informa y **no se inventa** un perfil.
- **Confirmación por el usuario:** la vista "Esto es lo que detectamos" muestra puesto, tecnología y nivel, los requisitos que se evaluarán y lo que el simulador **no** evalúa (p. ej. AWS, Kubernetes), con "Editar texto" y "Usar este perfil". El usuario puede cambiar la selección después.
- **La entrevista se adapta a los requisitos:** el entrevistador los recibe y ancla en ellos las preguntas de tecnología, profundidad y caso práctico. El plan de 5 preguntas, las áreas y las estadísticas no cambian. **El evaluador no los recibe:** la nota sigue calificando con la misma rúbrica y nivel, así es comparable entre entrevistas con y sin convocatoria.
- **Caché por usuario:** el mismo aviso (por hash) no vuelve a gastar una llamada a la IA.
- **Privacidad:** el aviso se guarda y se envía a la IA **enmascarado** (sin correos, teléfonos ni enlaces). No es un dato personal del candidato, así que cualquier proveedor configurado puede analizarlo.

## Capabilities

### New Capabilities
- `entrevista-desde-convocatoria`: recibir una convocatoria, detectar y confirmar su perfil, e iniciar una entrevista que pregunte sobre sus requisitos.

### Modified Capabilities
<!-- La selección de entrevista vive en `rediseno-seleccion-entrevista`, aún sin archivar; este cambio solo habilita el enlace de convocatoria que ese cambio dejó como "Próximamente". -->

## Impact

- **Capa de IA:**
  - nuevo `integrations/ia/prompts/analista_convocatoria.py`;
  - en `base.py`, el `Protocol AnalizadorDeConvocatoria` y su implementación en `ProveedorIAporJSON`;
  - `fake.py` y `cadena.py`;
  - en `schemas.py`, `ContextoDeEntrevista.requisitos`;
  - en `entrevistador.py`, la línea de requisitos.
- **Backend:**
  - en `apps/entrevistas`, el modelo `Convocatoria`, `Entrevista.convocatoria` (FK nullable) y una migración;
  - el servicio `analizar_convocatoria`, el endpoint `POST /api/entrevistas/convocatoria/` y el campo opcional `convocatoria` al iniciar;
  - `desde_convocatoria` en el serializer;
  - el throttle `analizar-convocatoria`.
- **Reutilizado sin cambios:**
  - `integrations/documentos/{extractor,convocatoria,terminos,anonimizar}.py`;
  - la validación de archivo del módulo de CV, que se mueve a un lugar compartido.
- **Frontend:**
  - en `features/seleccion/`, el modal en dos pasos con `components/ui/Modal`;
  - la etiqueta en `BarraDeResumen`;
  - la etiqueta en la entrevista;
  - los tipos y las funciones de API.
- **Tesis:** el Alcance no menciona la convocatoria; es una ampliación que refuerza el realismo de la simulación y conviene mencionarla.
