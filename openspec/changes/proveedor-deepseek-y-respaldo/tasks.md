## 1. Adaptador compatible con OpenAI

- [x] 1.1 Añadir `openai` con versión fijada a `backend/requirements/base.txt`, bajo el bloque de proveedores de IA, e instalarlo en el `.venv`. Verificar con `python -c "import openai"`.
- [x] 1.2 Crear `backend/integrations/ia/compatible_openai.py` con `ProveedorCompatibleOpenAI(ProveedorIAporJSON)` y las subclases `DeepSeekProveedorIA` y `OpenRouterProveedorIA` (design.md, D1 y D2):
  - timeout de 30 s y `max_retries=2`;
  - `response_format=json_object` y esquema en el prompt de sistema;
  - traducción de errores;
  - `apto_para_datos_personales = False`.

  Verificar que `get_proveedor("deepseek")` sin clave lanza `ProveedorNoConfigurado`.
- [x] 1.3 Registrar `deepseek` y `openrouter` en `factory.py::_REGISTRO`. Verificar en `tests/integration/test_factory.py` que ambos nombres resuelven a su clase con una clave de prueba.
- [x] 1.4 Tests sin red en `tests/integration/test_adaptadores_errores.py`, con un cliente `openai` simulado:
  - 429 y 503 → `ErrorTransitorio`;
  - 401 y 404 → `ErrorPermanente`;
  - error de conexión → `ErrorTransitorio`;
  - `finish_reason="length"` → `RespuestaIAInvalida`;
  - contenido vacío o no JSON → `RespuestaIAInvalida`;
  - el prompt de sistema contiene "json" y el esquema.

  Verificar con `python manage.py test tests.integration`.

## 2. Cadena de respaldo

- [x] 2.1 Atributo de clase `apto_para_datos_personales` en `ProveedorIA` (`False` por defecto) y `True` en `GeminiProveedorIA`, `AnthropicProveedorIA` y `FakeProveedorIA`. Verificar con un test que lista el valor de cada clase registrada.
- [x] 2.2 Crear `backend/integrations/ia/cadena.py::ProveedorEnCadena` (design.md, D3):
  - pasa al siguiente ante cualquier `ErrorProveedorIA`;
  - registra en el log cada fallo;
  - relanza el último error;
  - fija `nombre` y `modelo` al eslabón que respondió.

  Verificar con tests:
  - el primero responde → el segundo no recibe llamadas;
  - 429 en el primero → responde el segundo y `nombre` es el del segundo;
  - todos fallan → se relanza el error del último;
  - error permanente en el primero → responde el segundo.
- [x] 2.3 `get_proveedor()` acepta nombres separados por coma: con uno, devuelve el adaptador directo; con varios, una cadena; con un nombre desconocido, `ProveedorNoDisponible` sin llamar a nada. Verificar en `test_factory.py`, incluidos espacios (`"gemini, openrouter"`).
- [x] 2.4 Test de servicio: con una cadena `[falla_transitoria, fake]`, `responder()` guarda la evaluación con `proveedor_ia` del segundo. Verificar en `apps/entrevistas/tests/test_errores.py`.

## 3. Frontera de privacidad del CV

- [x] 3.1 `get_revisor_de_cv()` conserva solo los eslabones aptos que cumplen `RevisorDeCV`; si no queda ninguno, lanza `ProveedorNoDisponible`. Verificar en `test_factory.py`:
  - `gemini,openrouter` → solo Gemini;
  - `openrouter` → `ProveedorNoDisponible`.
- [x] 3.2 Ampliar `apps/curriculums/tests/test_frontera_con_ia.py` con dos casos, usando un espía registrado como no apto: con `IA_PROVEEDOR` apuntando solo al espía, subir un CV responde 201, `revision_ia.estado == "no_disponible"` y el espía no recibió ninguna llamada. Verificar también que una entrevista con el mismo espía sí lo llama.

## 4. Configuración y documentación

- [x] 4.1 `backend/.env.example`:
  - `IA_PROVEEDOR` lista `deepseek | openrouter` y la sintaxis de cadena;
  - nuevas `DEEPSEEK_API_KEY`, `DEEPSEEK_MODEL`, `OPENROUTER_API_KEY`, `OPENROUTER_MODEL`, cada una con su comentario (gratuito o de pago, enlace para obtener la clave, "no apto para CV");
  - el modelo por defecto de Gemini corregido a `gemini-3.5-flash-lite`.

  Verificar releyendo que cada variable que lee el código aparece en el archivo.
- [x] 4.2 `CLAUDE.md`:
  - variables de entorno: los valores nuevos de `IA_PROVEEDOR` y la cadena;
  - "Layering": `compatible_openai.py` y `cadena.py`;
  - módulo de CV: `apto_para_datos_personales` y el filtro de `get_revisor_de_cv`.

  Verificar releyendo esos apartados.

## 5. Verificación

- [x] 5.1 `python manage.py test` completo en verde contra PostgreSQL y `makemigrations --check` sin cambios.
- [ ] 5.2 Prueba manual del usuario con su clave de DeepSeek (ya guardada en `backend/.env`):
  - `IA_PROVEEDOR=gemini,deepseek`, completar una entrevista y comprobar `proveedor_ia` en el admin;
  - `medir_consistencia --repeticiones 2 --proveedor deepseek`, guardando la salida para comparar con Gemini.
