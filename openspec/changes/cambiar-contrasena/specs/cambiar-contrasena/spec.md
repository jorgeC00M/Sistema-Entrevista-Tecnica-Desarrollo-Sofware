## Purpose

Que el usuario pueda reemplazar su contraseña desde "Mi perfil" y que, al hacerlo, las sesiones abiertas en otros dispositivos dejen de ser válidas.

## ADDED Requirements

### Requirement: Sección de seguridad en el perfil

"Mi perfil" SHALL mostrar, bajo los datos de la cuenta, una sección titulada "Seguridad":
- si la cuenta tiene contraseña, una fila "Contraseña" con un valor enmascarado y el botón "Cambiar contraseña";
- si la cuenta se creó con Google y no tiene contraseña, el texto "Entras con Google: tu cuenta no tiene contraseña" y ningún botón para cambiarla ni crearla.

El perfil (`GET /api/auth/perfil`) MUST indicar si la cuenta tiene contraseña.

#### Scenario: Cuenta con contraseña
- **WHEN** un usuario registrado con correo abre "Mi perfil"
- **THEN** ve la sección "Seguridad" con el botón "Cambiar contraseña"

#### Scenario: Cuenta de Google
- **WHEN** un usuario creado con Google abre "Mi perfil"
- **THEN** ve el aviso de que entra con Google y no hay botón para cambiar la contraseña

### Requirement: Modal para cambiar la contraseña

"Cambiar contraseña" SHALL abrir un modal con:
- los campos "Contraseña actual", "Nueva contraseña" y "Repite la nueva contraseña", cada uno con un control para mostrar u ocultar su contenido;
- los botones Cancelar y Guardar.

En detalle:
- **Coincidencia:** si la nueva y su repetición no coinciden, MUST mostrarse el error junto a la repetición sin llamar al servidor.
- **Errores del servidor:** MUST mostrarse junto al campo al que se refieren (la contraseña actual incorrecta, o una nueva rechazada por los validadores), o en un aviso dentro del modal si no corresponden a ningún campo. El modal MUST seguir abierto.
- **Cancelar, la X y Esc** MUST cerrarlo sin cambiar nada.
- **Al guardar con éxito,** el modal se cierra, el foco vuelve a "Cambiar contraseña" y se anuncia "Contraseña actualizada. Cerramos tu sesión en otros dispositivos.". El usuario MUST seguir con la sesión abierta en este dispositivo.

#### Scenario: Repetición distinta
- **WHEN** la nueva contraseña y su repetición no coinciden y el usuario pulsa Guardar
- **THEN** ve "Las contraseñas no coinciden" junto a la repetición y no se envía nada

#### Scenario: Contraseña actual incorrecta
- **WHEN** el usuario escribe una contraseña actual equivocada
- **THEN** ve "La contraseña actual no es correcta" junto a ese campo, con el modal abierto

#### Scenario: Cambio correcto
- **WHEN** el usuario envía una contraseña actual correcta y una nueva válida
- **THEN** el modal se cierra, ve la confirmación y sigue navegando sin volver a iniciar sesión

### Requirement: Endpoint de cambio de contraseña

`POST /api/auth/contrasena`, con los campos `actual` y `nueva`, SHALL:
- exigir autenticación (401 sin ella);
- verificar la contraseña actual;
- aplicar a la nueva los mismos validadores que el registro;
- rechazar que la nueva sea igual a la actual;
- rechazar una cuenta sin contraseña utilizable.

Todos los rechazos MUST responder 400, con el error en el campo correspondiente. El endpoint MUST tener un límite de peticiones por usuario. Si el cambio tiene éxito, MUST responder 200 con un par de tokens nuevo (`access`, `refresh`).

#### Scenario: Nueva contraseña débil
- **WHEN** se envía como nueva una contraseña común o demasiado corta
- **THEN** la respuesta es 400 con el mensaje del validador en `nueva`, y la contraseña no cambia

#### Scenario: Login tras el cambio
- **WHEN** el cambio tuvo éxito
- **THEN** el login funciona con la contraseña nueva y falla con la anterior

### Requirement: Cerrar las demás sesiones

Al cambiar la contraseña, todo refresh token emitido antes para ese usuario SHALL dejar de servir para obtener nuevos access tokens. Solo el par devuelto por el cambio MUST seguir siendo válido.

Los access tokens ya emitidos MAY seguir valiendo hasta su caducidad (15 minutos). Los refresh emitidos antes de que existiera la lista negra MAY no poder invalidarse y caducan a los 7 días. Ambas limitaciones MUST quedar documentadas.

#### Scenario: Otro dispositivo pierde la sesión
- **WHEN** un segundo navegador intenta refrescar su sesión después del cambio
- **THEN** `POST /api/auth/token/refresh` responde 401 y ese navegador vuelve a pedir inicio de sesión
