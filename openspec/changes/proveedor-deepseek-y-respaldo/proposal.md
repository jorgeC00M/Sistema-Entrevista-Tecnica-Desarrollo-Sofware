## Why

El proyecto no tiene presupuesto, y hoy solo hay un motor gratuito: la capa gratuita de Gemini, que se agota por día y por minuto. Cuando se agota, la entrevista se corta con un 503 aunque exista otro motor gratuito disponible.

Se pidió agregar DeepSeek "en su versión gratuita". La investigación (octubre 2026) cambia el planteamiento:
- **La API oficial de DeepSeek no es gratis de forma permanente.** Da unos 5 millones de tokens durante 30 días y después cobra, aunque barato.
- **OpenRouter ofrece modelos gratuitos** (`:free`: 50 peticiones al día, 20 por minuto), pero al implementar se comprobó que su catálogo de octubre de 2026 **no incluye ningún DeepSeek gratuito**. Queda como acceso genérico a modelos gratuitos, con el modelo obligatorio en `OPENROUTER_MODEL`.
- **DeepSeek procesa y guarda los datos en China** y entrena con ellos por defecto, sin opción de desactivarlo fuera de la UE, el Reino Unido o Suiza. Esto choca con el módulo de CV, que maneja datos personales reales.

## What Changes

- **Dos proveedores nuevos** seleccionables con `IA_PROVEEDOR`:
  - `deepseek`: API oficial;
  - `openrouter`: modelos gratuitos de OpenRouter (modelo obligatorio en `OPENROUTER_MODEL`).

  Ambos comparten un adaptador compatible con OpenAI. Es configuración del servidor; no hay ninguna opción nueva en la interfaz.
- **Cadena de respaldo:** `IA_PROVEEDOR` acepta varios nombres separados por coma (p. ej. `gemini,openrouter`). Si un proveedor agota su cuota o falla de forma transitoria, la misma operación se pide al siguiente. Con un solo nombre el comportamiento es el de hoy.
- **Trazabilidad:** cada evaluación registra el proveedor que **realmente** respondió (`proveedor_ia`, `modelo_ia`).
- **Frontera de privacidad del CV:** cada proveedor declara si es apto para datos personales. La revisión de CV con IA usa solo los aptos; DeepSeek y OpenRouter no lo son. Si no queda ninguno, la revisión queda `no_disponible` y el diagnóstico medido se muestra igual.
- **Configuración:** `.env.example` documenta las claves nuevas y la cadena, y corrige el modelo por defecto de Gemini (decía `gemini-2.5-flash`; el código usa `gemini-3.5-flash-lite`).
- **Dependencia nueva:** SDK `openai`, usado para hablar con DeepSeek y OpenRouter, que comparten su formato.

## Capabilities

### New Capabilities
- `proveedores-de-ia`: qué motores de IA puede usar el sistema, cómo se encadenan cuando uno falla, cómo se registra cuál respondió y qué motores pueden recibir datos de un currículum.

### Modified Capabilities
<!-- No hay specs archivadas en openspec/specs/. -->

## Impact

- **Capa de IA (sin Django):**
  - nuevo `integrations/ia/compatible_openai.py`;
  - nuevo `integrations/ia/cadena.py`;
  - `integrations/ia/factory.py` (registro, parseo con comas y filtro del revisor de CV);
  - atributo `apto_para_datos_personales` en `base.py`, `gemini.py`, `claude.py` y `fake.py`.
- **Dependencias:** `openai` en `backend/requirements/base.txt`.
- **Tests:**
  - `tests/integration/test_adaptadores_errores.py`;
  - `tests/integration/test_factory.py`;
  - `apps/curriculums/tests/test_frontera_con_ia.py`.
- **Sin cambios:** modelo de datos, migraciones, API pública, frontend, `revision.py` (ya convierte `ErrorProveedorIA` en `no_disponible`) y `production.py`.
- **Documentación:** `.env.example`, `CLAUDE.md`. El perfil de tesis sigue nombrando a Claude como motor; DeepSeek y OpenRouter son respaldo interno, como Gemini.
