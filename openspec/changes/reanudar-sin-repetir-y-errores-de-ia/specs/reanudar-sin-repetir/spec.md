## Purpose

Garantizar que una respuesta ya guardada nunca se vuelva a pedir ni se evalúe dos veces, y definir qué ve el usuario al volver a una entrevista cuya última respuesta está en evaluación o falló.

## ADDED Requirements

### Requirement: Una respuesta guardada no se vuelve a pedir
Si la pregunta pendiente ya tiene respuesta guardada, la entrevista MUST NOT mostrarla como pregunta nueva ni pedir otra respuesta. El chat SHALL mostrar esa pregunta y su respuesta una sola vez, con el campo de respuesta bloqueado. El detalle de la entrevista SHALL informar, junto a la pregunta pendiente, la respuesta guardada (vacía si no la hay), cuándo se guardó y si su evaluación falló.

#### Scenario: Recargar mientras la IA evalúa
- **WHEN** el usuario envía la respuesta 3 y recarga la página antes de que termine la evaluación
- **THEN** ve la pregunta 3 y su respuesta una sola vez, el aviso «Evaluando tu respuesta…» y el campo bloqueado; la pregunta 3 no aparece repetida

#### Scenario: Pregunta sin responder
- **WHEN** el usuario recarga con la pregunta 3 sin responder
- **THEN** ve la pregunta 3 como pendiente y el campo habilitado, como hasta ahora

### Requirement: Recargar no reenvía la respuesta
Mientras una respuesta guardada esté en evaluación, la interfaz MUST NOT reenviarla por su cuenta. SHALL consultar el estado de la entrevista cada pocos segundos hasta que:
- aparezca la siguiente pregunta (que SHALL mostrarse sola);
- la entrevista se cierre (y SHALL pasar al reporte);
- la evaluación se considere fallida.

Una evaluación SHALL considerarse fallida cuando el servidor la marcó así, o cuando pasaron 2 minutos desde que se guardó la respuesta sin evaluación ni marca.

#### Scenario: La evaluación termina tras recargar
- **WHEN** el usuario recargó durante la evaluación y el servidor termina 20 segundos después
- **THEN** la pregunta 4 aparece sin que el usuario haga nada y sin un segundo envío de la respuesta 3

#### Scenario: El servidor se reinició a mitad de la evaluación
- **WHEN** pasan 2 minutos desde que se guardó la respuesta, sin evaluación ni marca de fallo
- **THEN** el chat la trata como evaluación fallida

### Requirement: Una evaluación fallida se reintenta sin reescribir
Cuando el servidor agota sus intentos con la IA al evaluar una respuesta o al generar la siguiente pregunta, SHALL marcar esa respuesta como de evaluación fallida y conservarla. El chat SHALL decir que la respuesta está guardada y ofrecer «Reintentar», que reenvía la respuesta guardada en el servidor, también después de recargar. Un reintento exitoso SHALL quitar la marca. El límite de tiempo se aplica como hasta ahora: una respuesta guardada a tiempo se evalúa aunque el reintento llegue después del límite.

#### Scenario: Reintentar tras recargar
- **WHEN** la evaluación de la respuesta 3 falló, el usuario recarga y pulsa «Reintentar»
- **THEN** se evalúa la respuesta 3 guardada, sin que el usuario la reescriba, y aparece la pregunta 4

#### Scenario: Ver el fallo al volver
- **WHEN** el usuario vuelve a una entrevista cuya última evaluación quedó marcada como fallida
- **THEN** ve de inmediato «Tu respuesta está guardada; no la pierdes» y «Reintentar», sin esperar 2 minutos

### Requirement: Una sola evaluación por respuesta
Dos envíos simultáneos sobre la misma pregunta (doble clic, dos pestañas) MUST dejar una sola evaluación y una sola pregunta siguiente. Ninguno de los dos MUST responder con un error del servidor.

#### Scenario: Dos pestañas envían a la vez
- **WHEN** dos peticiones de respuesta sobre la misma pregunta llegan a la vez
- **THEN** la pregunta queda con una evaluación, existe una sola pregunta siguiente y ambas peticiones responden con éxito

### Requirement: El servidor atiende varias entrevistas a la vez
El servidor de producción SHALL poder atender varias peticiones al mismo tiempo, de modo que la evaluación de una respuesta no haga esperar a otros usuarios. Además, MUST NOT cortar una petición antes de que venza el tiempo máximo que el cliente espera al responder (90 s).

#### Scenario: Tres usuarios responden en el mismo minuto
- **WHEN** tres usuarios envían su respuesta casi a la vez y cada evaluación tarda unos 25 segundos
- **THEN** cada uno recibe su siguiente pregunta en unos 25 segundos, sin esperar la de los demás

#### Scenario: Evaluación lenta
- **WHEN** la IA tarda 45 segundos en evaluar
- **THEN** la petición se completa y el usuario recibe su siguiente pregunta
