## ADDED Requirements

### Requirement: El reloj no depende de la hora del dispositivo
El tiempo restante SHALL calcularse con el límite y la hora que da el servidor, tomados en el momento en que llegó su respuesta, y contarse con un reloj que no cambie si alguien modifica la hora del sistema. Si el dato viene de una caché, la cuenta MUST partir de cuando llegó del servidor, no de cuando se leyó. Al volver a la pestaña de la entrevista, la interfaz SHALL resincronizarse con el servidor. La decisión de cerrar la entrevista sigue siendo del servidor.

#### Scenario: Dispositivo con la hora mal puesta
- **WHEN** el reloj del dispositivo va 15 minutos atrasado y quedan 10 minutos
- **THEN** el chat y el sidebar muestran unos 10 minutos

#### Scenario: Cambiar la hora a mitad de la entrevista
- **WHEN** el usuario adelanta la hora del sistema una hora con el chat abierto
- **THEN** la cuenta regresiva no salta

#### Scenario: Dato de la caché
- **WHEN** el sidebar usa una fila del historial que llegó hace 25 segundos
- **THEN** los minutos que muestra descuentan esos 25 segundos

#### Scenario: Volver tras suspender la laptop
- **WHEN** el usuario suspende la laptop 10 minutos con la entrevista abierta y vuelve
- **THEN** el reloj se resincroniza con el servidor y muestra el tiempo que realmente queda
