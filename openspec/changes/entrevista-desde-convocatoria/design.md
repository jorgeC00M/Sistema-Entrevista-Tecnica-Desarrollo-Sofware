## Context

- **Lectura del aviso:**
  - `integrations/documentos/extractor.py::extraer()` lee PDF y DOCX y expone `tiene_capa_de_texto`;
  - `apps/curriculums/serializers.py` ya valida "pegada o archivo, no las dos" con `_validar_archivo()` y rechaza escaneados;
  - `integrations/documentos/convocatoria.py::partir()` devuelve obligatorios y deseables (términos canónicos), `anos_requeridos` y `cargo`, sin IA;
  - `terminos.py` normaliza y reconoce las tecnologías;
  - `anonimizar.py::enmascarar()` tapa correos, enlaces y teléfonos.
- **Capa de IA:**
  - `ProveedorIAporJSON` implementa cada operación como prompt, JSON y parser;
  - las operaciones opcionales son `Protocol` (`RevisorDeCV`), así los dobles de entrevista no tienen que implementarlas;
  - `ProveedorEnCadena` reenvía las operaciones y `factory` decide qué proveedores sirven.
- **Catálogo:** puestos, tecnologías por puesto y niveles viven en la base. La capa de IA solo conoce los enums `Puesto` y `Nivel`; las tecnologías van por nombre.
- **Frontend:** existen `components/ui/Modal` y `ModalDeConfirmacion`, y la pantalla de selección tiene el enlace deshabilitado "Pegar la convocatoria · Próximamente".

Motivación: proposal.md. Requisitos: `specs/entrevista-desde-convocatoria/spec.md`.

## Goals / Non-Goals

**Goals:**
- Reusar la lectura del aviso que ya existe en el módulo de CV, sin duplicarla.
- Que la IA solo pueda devolver valores del catálogo y requisitos presentes en el aviso.
- Una entrevista con convocatoria es la misma entrevista: mismo plan, misma nota, con preguntas más concretas.

**Non-Goals:**
- Comparar el CV del usuario con el aviso: eso ya lo hace el módulo de CV.
- OCR de avisos escaneados: se pide pegar el texto, como en el módulo de CV.
- Que el evaluador califique según los requisitos.
- Guardar el archivo original.

## Decisions

### D1. Detección híbrida: el código mide, la IA clasifica

1. Se enmascara el texto con `enmascarar()`.
2. `partir()` saca los términos reconocidos, los años y el cargo. Son las **pistas** que acompañan al aviso en el prompt y la base para anclar los requisitos.
3. La IA recibe:
   - el aviso enmascarado;
   - las pistas;
   - las **opciones del catálogo**: los puestos con su código, nombre y tecnologías (código y nombre), y los niveles con su código, nombre y grado.

   Devuelve `{puesto, tecnologia, nivel, requisitos[], fuera_de_alcance[]}`.
4. `analista_convocatoria.parsear_perfil(datos, entrada)` ancla la respuesta:
   - el puesto debe estar en las opciones; si no, el perfil es `no_identificado`;
   - la tecnología debe estar entre las de ese puesto; si no, queda `None`, sin reemplazarla;
   - el nivel debe estar entre las opciones; si no, toma el más bajo (Junior) y se marca `nivel_supuesto`;
   - cada requisito y cada elemento de `fuera_de_alcance` deben aparecer en el aviso normalizado (`terminos.normalizar`) o estar entre los términos reconocidos; se deduplican y se recortan a 8 y a 5.

Es la misma regla del módulo de CV, "el código decide qué, la IA propone cómo": aquí la IA propone la clasificación y el código la limita a lo posible.

- *Alternativa:* solo reglas, como el prototipo. Se descarta porque con 6 puestos y unas 23 tecnologías las reglas fallan con avisos redactados libremente ("buscamos alguien para nuestra app en Flutter que también toque el backend"). La IA clasifica mejor y el anclaje evita que invente.
- *Alternativa:* solo IA, sin pistas ni anclaje. Se descarta porque podría devolver un puesto inexistente o requisitos que el aviso no pide.

### D2. Contrato en la capa de IA

- `prompts/analista_convocatoria.py` reúne: `EntradaDeConvocatoria` (texto enmascarado, pistas y opciones), `PerfilDetectado`, `sistema()`, `usuario()`, `ESQUEMA_PERFIL` y `parsear_perfil()`.
- `base.py` define `Protocol AnalizadorDeConvocatoria.analizar_convocatoria(entrada) -> PerfilDetectado`.
- `ProveedorIAporJSON` lo implementa con la misma secuencia que las demás operaciones, así Gemini, Claude, DeepSeek y OpenRouter lo heredan.
- `FakeProveedorIA` lo resuelve con reglas deterministas sobre las pistas: el cargo o los términos dan el puesto; el primer término que sea tecnología del puesto da la tecnología; "senior" o "semi" en el texto dan el nivel. Sirve para los tests y para usar el sistema sin cuota.
- `ProveedorEnCadena` lo reenvía a los eslabones que implementen el `Protocol`.

El aviso no es un dato personal del candidato y llega enmascarado, así que **no** se filtra por `apto_para_datos_personales`.

### D3. Modelo `Convocatoria` y caché

En `apps/entrevistas/models.py`:

```
Convocatoria(usuario FK CASCADE, texto TextField (enmascarado), hash CharField(64),
             perfil JSONField, creado_en)
UniqueConstraint(usuario, hash)
```

Además, `Entrevista.convocatoria` es una FK nullable con PROTECT: una convocatoria con entrevistas no se borra, porque es parte del contexto de esas preguntas.

El servicio `analizar_convocatoria(usuario, texto)` sigue estos pasos:
1. enmascara el texto y calcula `sha256` del texto enmascarado;
2. si ya existe una fila para ese usuario y hash, la devuelve sin llamar a la IA;
3. si no, llama a la IA **fuera de la transacción**, como `responder()`;
4. guarda la fila con `get_or_create`, para que dos peticiones simultáneas no dupliquen.

`no_identificado` también se guarda: el mismo aviso daría el mismo resultado.

### D4. API

- `POST /api/entrevistas/convocatoria/`:
  - acepta multipart o JSON con `texto` o `archivo`;
  - `AnalizarConvocatoriaSerializer` reutiliza la validación de archivo del módulo de CV, que se mueve a `apps/common/archivos.py` para no importar entre apps;
  - el throttle es `analizar-convocatoria`, 20 por hora;
  - responde 201 con `{id, perfil}`; 422 si `no_identificado`; 400 por escaneado, formato o largo; los errores de la IA pasan por el manejador central (503/502).
- `IniciarEntrevistaSerializer` gana un campo `convocatoria` opcional (id), validado como del usuario; si no es suya, responde 404 por pertenencia, como el resto.
- `EntrevistaSerializer` gana `desde_convocatoria: bool`.

### D5. Cómo se adapta la entrevista

- `ContextoDeEntrevista` gana `requisitos: tuple[str, ...] = ()`, que se arma en `_contexto(entrevista)` desde `entrevista.convocatoria.perfil["requisitos"]`.
- `entrevistador.sistema()` y `sistema_de_calentamiento()` añaden, si hay requisitos, la línea "Requisitos de la convocatoria: X, Y, Z" y una regla: "en los encargos de tecnología, profundidad y caso práctico, apóyate en estos requisitos cuando encajen con el área".
- `evaluador.sistema()` **no** los recibe; un test fija que no aparecen en su prompt.
- El contexto es constante durante toda la entrevista, así que el evaluador sigue siendo una función pura.

### D6. Frontend

- `features/seleccion/components/ConvocatoriaModal.tsx`, sobre `components/ui/Modal`, con dos pasos:
  1. **Entrada:**
     - pestañas "Pegar texto" (textarea con contador de 5000 y mínimo de 30) y "Subir archivo" (PDF/DOCX), con el mismo `accept` y límite que el módulo de CV;
     - los ejemplos del prototipo como pastillas, en datos del componente: son textos de ejemplo, no catálogo;
     - el botón "Analizar".
  2. **Resultado:** "Esto es lo que detectamos" con puesto, tecnología y nivel, los requisitos con ✓ y lo de `fuera_de_alcance` con ⚠ "no se evalúa en el simulador"; si `nivel_supuesto`, una nota; los botones "Editar texto" (vuelve al paso 1 con el texto) y "Usar este perfil".
- Estados: cargando ("Analizando la convocatoria…"), 400 escaneado, 422 no identificado ("Elegir manualmente") y 503.
- `SeleccionPuestoPage` guarda el `convocatoriaId`, rellena la selección y enfoca el siguiente paso (el mismo patrón de "Repetir última").
- `BarraDeResumen` muestra la etiqueta "Desde convocatoria", y `iniciarEntrevista` envía `convocatoria`.
- Si el usuario cambia de puesto, la etiqueta se mantiene: los requisitos siguen sirviendo.
- `EntrevistaPage` muestra "Basada en tu convocatoria" cuando `desde_convocatoria`.

## Risks / Trade-offs

- [La IA clasifica mal un aviso ambiguo] → El usuario confirma y puede cambiar todo antes de comenzar; el anclaje impide valores imposibles.
- [Un costo extra por aviso] → La caché por hash evita repetirlo; además hay throttle.
- [Requisitos que no encajan con el plan (p. ej. "Kubernetes" en un aviso de frontend)] → Van a `fuera_de_alcance`, a la vista del usuario, y el prompt solo los usa "cuando encajen con el área".
- [Mover `_validar_archivo` puede romper el módulo de CV] → El cambio es mecánico y los tests de `curriculums` lo cubren.

## Migration Plan

Hay una migración en `entrevistas`: crea `Convocatoria` y añade `Entrevista.convocatoria` nullable, sin datos que migrar. Para revertir se hace `migrate entrevistas <anterior>`, mientras ninguna entrevista use convocatoria (PROTECT).
