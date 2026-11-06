## Purpose

Definir cómo informa el sistema un fallo del servicio de IA: un código que la interfaz entiende y un aviso único que dice qué pasó, qué se conserva y qué hacer, sin exponer qué proveedor falló.

## ADDED Requirements

### Requirement: Cada fallo de la IA trae un código
Toda respuesta de error causada por el servicio de IA SHALL incluir, además de su mensaje, un `codigo`:
- `ia_ocupada` (503): el servicio está saturado, caído temporalmente o no configurado, después de los reintentos;
- `ia_rechazo` (502): el servicio rechazó la solicitud o falló de otro modo;
- `ia_respuesta_invalida` (502): respondió algo que no se pudo usar, incluso después de un reintento.

La respuesta MUST NOT nombrar al proveedor ni al modelo. El proveedor y el modelo SHALL quedar en el registro del servidor.

#### Scenario: Proveedor saturado
- **WHEN** todos los proveedores configurados responden que están saturados
- **THEN** la API responde 503 con `codigo: "ia_ocupada"` y un mensaje que no nombra al proveedor

#### Scenario: JSON inválido una vez
- **WHEN** la IA devuelve un JSON mal formado y al reintentar responde bien
- **THEN** la operación se completa sin error para el usuario

### Requirement: Un solo aviso de error de IA
La interfaz SHALL mostrar los fallos de la IA con un único aviso en rojo, anunciado como alerta, con:
- un título según el código: «La IA está ocupada en este momento.», «La IA no pudo atender esta solicitud.» o «La IA respondió algo que no pudimos usar.»;
- una línea sobre qué se conserva en esa pantalla;
- la acción para reintentar, cuando la haya.

El aviso MUST NOT mostrar el nombre del proveedor. Un error sin código de IA SHALL seguir mostrándose como hasta ahora.

#### Scenario: Falla la evaluación en el chat
- **WHEN** falla la evaluación de una respuesta por saturación de la IA
- **THEN** el chat muestra «La IA está ocupada en este momento.», «Tu respuesta está guardada; no la pierdes.» y «Reintentar»

#### Scenario: Falla al iniciar la entrevista
- **WHEN** falla la IA al pulsar «Comenzar»
- **THEN** el modal sigue abierto y muestra el aviso con «No se creó la entrevista; puedes intentarlo de nuevo.»

#### Scenario: Falla al analizar una convocatoria
- **WHEN** falla la IA al analizar una convocatoria
- **THEN** se muestra el aviso con «Tu texto sigue aquí.» (o «Tu archivo sigue aquí.» si se subió un archivo), y el texto o el archivo siguen cargados
