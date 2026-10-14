## Context

- `integrations/ia/base.py::ProveedorIAporJSON` implementa todas las operaciones (preguntas, evaluación, revisión de CV) sobre un único método abstracto, `_pedir_json(sistema, entrada, esquema)`. Un adaptador nuevo solo implementa ese método y traduce sus errores a `exceptions.py`.
- `integrations/ia/factory.py::_REGISTRO` importa los adaptadores de forma diferida. `get_proveedor()` crea **una instancia por llamada**, porque `services.iniciar/responder` lo invocan en cada petición.
- `apps/evaluaciones/services.py::guardar()` lee `proveedor.nombre` y `proveedor.modelo` **después** de la llamada a la IA.
- `apps/curriculums/revision.py:102` llama a `get_revisor_de_cv()` dentro de `try … except ErrorProveedorIA`. `ProveedorNoDisponible` hereda de esa jerarquía, así que ya termina en `no_disponible` sin tocar `revision.py`.

Motivación: ver proposal.md. Requisitos: `specs/proveedores-de-ia/spec.md`.

## Goals / Non-Goals

**Goals:**
- Un único adaptador para todo endpoint compatible con OpenAI, con DeepSeek y OpenRouter como dos configuraciones de él.
- Que una cuota gratuita agotada no corte la entrevista si hay otro proveedor configurado.
- Que el texto de un CV nunca llegue a un proveedor no apto, aunque esté configurado.

**Non-Goals:**
- Un selector de motor en la interfaz: las notas dejarían de ser comparables entre entrevistas.
- Rotar entre proveedores para repartir carga. La cadena es de respaldo, no de balanceo.
- Recordar entre peticiones que un proveedor está agotado (cortocircuito). Con instancias por petición y el plan gratuito de Render, no hay dónde guardarlo de forma fiable; el costo es un intento fallido y rápido por llamada.
- Cambiar el motor documentado en la tesis.

## Decisions

### D1. SDK `openai` con `base_url`, no `httpx` a mano

DeepSeek y OpenRouter exponen la API de Chat Completions de OpenAI. El SDK ya trae timeout, reintentos con retroceso para 408/409/429/5xx y errores tipados (`APIStatusError`, `APIConnectionError`). Es la misma forma que tiene `claude.py` con el SDK de Anthropic, así que la traducción de errores queda casi idéntica.

- *Alternativa:* `httpx` directo, que ya llega como dependencia transitiva de `google-genai`. Se descarta porque habría que reescribir los reintentos y el parseo de errores, que es justo la divergencia que `base.py` vino a eliminar.

`ProveedorCompatibleOpenAI` lee de atributos de clase la variable de la clave, la del modelo, el modelo por defecto y la URL. `DeepSeekProveedorIA` y `OpenRouterProveedorIA` son subclases que solo fijan esos valores:
- DeepSeek: modelo `deepseek-chat`, URL `https://api.deepseek.com`.
- OpenRouter: URL `https://openrouter.ai/api/v1`, **sin modelo por defecto**. Al implementar se consultó el catálogo público (`/api/v1/models`, octubre 2026): 462 modelos, 14 gratuitos y **ningún DeepSeek gratuito**. Fijar un modelo por defecto sería un 404 diferido, así que `OPENROUTER_MODEL` es obligatorio (p. ej. `google/gemma-4-31b-it:free`). La vía gratuita a DeepSeek que suponía la propuesta no existe hoy; `openrouter` queda como acceso genérico a modelos gratuitos.

### D2. JSON por modo `json_object` más esquema en el prompt

Estos endpoints no garantizan `json_schema` estricto (DeepSeek no lo soporta). `_pedir_json()` envía `response_format={"type": "json_object"}` y agrega al mensaje de sistema "Responde solo con un objeto JSON que cumpla este esquema:" seguido del esquema serializado. DeepSeek exige que la palabra "json" aparezca en el prompt.

La garantía real ya existe: `parsear_evaluacion`, `parsear_preguntas` y `parsear_revision` validan cada campo y rangos como los niveles 0–4. Un JSON que no cumpla se rechaza como `RespuestaIAInvalida`, y la cadena pasa al siguiente.

Errores:
- `finish_reason == "length"` → `RespuestaIAInvalida`, porque un JSON truncado nunca se debe parsear a medias;
- `message.content` vacío → `RespuestaIAInvalida`;
- `APIStatusError` 408/409/429/≥500 → `ErrorTransitorio`;
- otros 4xx → `ErrorPermanente`;
- `APIConnectionError` → `ErrorTransitorio`.

### D3. `ProveedorEnCadena` en `integrations/ia/cadena.py`

Es un `ProveedorIA` que recibe una lista de proveedores e implementa cada operación con `_intentar(operacion)`:
- recorre los eslabones en orden;
- captura `ErrorProveedorIA`, deja un registro en el log del eslabón que falló y por qué, y pasa al siguiente;
- si todos fallan, relanza el último error.

Al acertar, fija `self.nombre` y `self.modelo` a los del eslabón que respondió. Como `get_proveedor()` crea una instancia por petición, ese estado no se comparte entre usuarios, y `guardar()` lee justo después de la llamada.

- *Por qué también ante un error permanente:* en una cadena, el error permanente de un eslabón (clave revocada, modelo retirado) es motivo para usar el siguiente, no para cortar el servicio. Se registra en el log para que se corrija.
- *Alternativa:* resolver la cadena dentro de `services.py`. Se descarta porque las vistas y los servicios no deben saber de proveedores; la cadena es un `ProveedorIA` más.

`get_proveedor(nombre)` separa por comas e ignora los espacios. Si hay un solo nombre, devuelve el adaptador directo (comportamiento actual). Si hay varios, devuelve `ProveedorEnCadena([...])`. Si cualquier nombre no existe, lanza `ProveedorNoDisponible` antes de llamar a nada. Un eslabón sin clave (`ProveedorNoConfigurado`) también aborta: es un error de configuración que conviene ver al desplegar, no un respaldo silencioso.

### D4. `apto_para_datos_personales` y el filtro del revisor de CV

Es un atributo de clase en `ProveedorIA`:
- `False` por defecto (seguro por omisión);
- `True` en `GeminiProveedorIA`, `AnthropicProveedorIA` y `FakeProveedorIA`;
- `False` explícito en `ProveedorCompatibleOpenAI`, con un comentario sobre la jurisdicción y el entrenamiento por defecto.

`get_revisor_de_cv()` construye la lista de nombres, conserva solo los eslabones aptos que además cumplen `RevisorDeCV`, y devuelve el único que quede, o una cadena si son varios. Si no queda ninguno, lanza `ProveedorNoDisponible`, y `revision.py` lo convierte en `no_disponible` sin cambios.

Gemini en su capa gratuita también puede usar el contenido para mejorar productos. Se acepta porque el CV ya se envía minimizado y enmascarado (`anonimizar.py`) y la jurisdicción es otra. Queda escrito como compromiso conocido, no como garantía.

### D5. Coherencia de la nota con motores mezclados

Dentro de una misma entrevista, distintas preguntas pueden calificarse con motores distintos si la cadena actúa. La fórmula por niveles (`formula-de-puntuacion`) reduce el impacto, porque cada motor solo elige niveles descritos, y `proveedor_ia` por evaluación lo hace auditable. `medir_consistencia --proveedor openrouter` permite medir y comparar los motores para el capítulo de pruebas.

## Risks / Trade-offs

- [El modelo `:free` de OpenRouter cambia de nombre o desaparece] → Es configurable con `OPENROUTER_MODEL`. Un 404 o un 400 se traducen a `ErrorPermanente`, la cadena pasa al siguiente y queda registrado.
- [Los modelos `:free` son más lentos o saturados] → Timeout de 30 s por intento, como el resto. El peor caso de una cadena de dos es mayor, pero ese mismo caso hoy es un 503.
- [JSON fuera de esquema más frecuente sin modo estricto] → Lo rechazan los parsers y la cadena pasa al siguiente. Se mide con `medir_consistencia`, que cuenta los fallos aparte.
- [Lista de proveedores aptos mal configurada a futuro] → El atributo vale `False` por defecto y un test de frontera fija que OpenRouter y DeepSeek nunca reciben texto de un CV.
- [Dependencia nueva] → El SDK `openai` es puro Python y se importa de forma diferida, como los demás: tenerlo instalado no implica usarlo.

## Migration Plan

Sin migraciones. Se despliega con el `IA_PROVEEDOR` actual y el comportamiento no cambia. Para activarlo:
1. Crear una clave en OpenRouter.
2. Definir `OPENROUTER_API_KEY` en Render.
3. Cambiar a `IA_PROVEEDOR=gemini,openrouter`.

Para revertir basta con volver a un solo nombre.
