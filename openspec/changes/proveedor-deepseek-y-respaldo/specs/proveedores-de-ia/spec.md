## Purpose

Definir qué motores de IA puede usar el sistema, cómo se encadenan para que un proveedor gratuito agotado no corte la entrevista, cómo queda registrado cuál respondió y qué motores pueden recibir datos derivados de un currículum.

## ADDED Requirements

### Requirement: Proveedores DeepSeek y OpenRouter seleccionables por configuración

El sistema SHALL aceptar `deepseek` y `openrouter` como valores de `IA_PROVEEDOR`, además de `fake`, `gemini` y `anthropic`. La elección MUST ser configuración del servidor; la interfaz no ofrece ningún selector de motor. Si falta la clave del proveedor elegido, el sistema MUST responder como hoy ante un proveedor no configurado (503), sin un error interno.

#### Scenario: OpenRouter configurado
- **WHEN** `IA_PROVEEDOR=openrouter`, `OPENROUTER_API_KEY` y `OPENROUTER_MODEL` tienen valor
- **THEN** las preguntas y evaluaciones de la entrevista se piden a OpenRouter con el modelo de `OPENROUTER_MODEL`

#### Scenario: OpenRouter sin modelo
- **WHEN** `IA_PROVEEDOR=openrouter` y `OPENROUTER_MODEL` está vacío
- **THEN** el proveedor se trata como no configurado (503): el catálogo gratuito de OpenRouter cambia y no hay un modelo por defecto fiable

#### Scenario: Falta la clave
- **WHEN** `IA_PROVEEDOR=deepseek` y `DEEPSEEK_API_KEY` está vacía
- **THEN** iniciar una entrevista responde 503 y no se crea ninguna entrevista

### Requirement: Errores del proveedor traducidos a la taxonomía común

Las respuestas de DeepSeek y OpenRouter SHALL traducirse a la misma taxonomía que Gemini y Claude:
- cuota agotada (429), tiempo de espera, conflicto o error del servidor → error transitorio;
- otros errores del cliente (clave inválida, petición mal formada) → error permanente;
- una respuesta vacía, truncada o que no es un objeto JSON → respuesta inválida.

#### Scenario: Cuota agotada
- **WHEN** OpenRouter responde 429
- **THEN** la operación falla con un error transitorio

#### Scenario: Respuesta truncada
- **WHEN** el proveedor corta la respuesta por límite de longitud
- **THEN** la operación falla con una respuesta inválida y no se guarda ninguna evaluación

### Requirement: Cadena de respaldo

Cuando `IA_PROVEEDOR` contiene varios nombres separados por coma, el sistema SHALL intentar cada operación con el primero. Ante un error transitorio o una respuesta inválida, MUST repetir la misma operación con el siguiente. Si todos fallan, MUST devolver el error del último. Un error permanente de un eslabón también MUST pasar al siguiente, porque una clave inválida en un proveedor no debe cortar el servicio de los demás. Con un solo nombre, el comportamiento MUST ser idéntico al actual.

#### Scenario: El primero agota su cuota
- **WHEN** `IA_PROVEEDOR=gemini,openrouter`, Gemini responde 429 y OpenRouter responde bien
- **THEN** la evaluación se guarda con la respuesta de OpenRouter

#### Scenario: El primero responde bien
- **WHEN** `IA_PROVEEDOR=gemini,openrouter` y Gemini responde bien
- **THEN** OpenRouter no recibe ninguna llamada

#### Scenario: Todos fallan
- **WHEN** todos los proveedores de la cadena fallan
- **THEN** la operación responde con el error del último proveedor (503 o 502) y la entrevista no avanza, igual que hoy ante un fallo

#### Scenario: Nombre desconocido en la cadena
- **WHEN** `IA_PROVEEDOR=gemini,inexistente`
- **THEN** el sistema responde 503 por proveedor no disponible, sin intentar ninguna llamada

### Requirement: Se registra el proveedor que respondió

Cada evaluación guardada SHALL registrar en `proveedor_ia` y `modelo_ia` el proveedor y el modelo que efectivamente produjeron la respuesta, no el primero de la cadena.

#### Scenario: Respaldo usado
- **WHEN** una evaluación se obtuvo de OpenRouter porque Gemini agotó su cuota
- **THEN** esa evaluación queda con `proveedor_ia = "openrouter"` y el modelo de OpenRouter

### Requirement: Solo proveedores aptos reciben datos de un currículum

Cada proveedor SHALL declarar si es apto para datos personales. DeepSeek y OpenRouter MUST declararse no aptos. La revisión de un currículum con IA MUST usar únicamente proveedores aptos, aunque los no aptos estén en `IA_PROVEEDOR`. Si no queda ninguno apto, la revisión con IA MUST quedar como no disponible y el diagnóstico medido MUST mostrarse completo.

#### Scenario: Cadena mixta
- **WHEN** `IA_PROVEEDOR=gemini,openrouter` y se analiza un currículum
- **THEN** la revisión con IA se pide solo a Gemini, y OpenRouter no recibe ninguna llamada aunque Gemini falle

#### Scenario: Solo proveedores no aptos
- **WHEN** `IA_PROVEEDOR=openrouter` y se analiza un currículum
- **THEN** ningún proveedor recibe texto del currículum, la revisión con IA queda como no disponible y el análisis responde 201 con el diagnóstico medido

#### Scenario: Las entrevistas sí usan DeepSeek
- **WHEN** `IA_PROVEEDOR=openrouter` y se inicia una entrevista
- **THEN** la entrevista funciona con OpenRouter, porque no envía datos personales del candidato
