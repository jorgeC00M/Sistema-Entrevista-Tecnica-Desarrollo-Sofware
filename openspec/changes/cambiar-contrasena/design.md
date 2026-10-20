## Context

**Backend.** `apps/usuarios`:
- registro: `RegistroSerializer`, que aplica `validate_password`;
- login: `LoginView` sobre `TokenObtainPairView`, con `throttle_scope = "login"`;
- refresh: `TokenRefreshView`;
- Google: `GoogleLoginView`, que crea las cuentas con `set_unusable_password()`;
- perfil: `PerfilView` con `PerfilSerializer`, que no expone si hay contraseña.

`_tokens_para()` emite el par con `RefreshToken.for_user`. `SIMPLE_JWT` define access de 15 min y refresh de 7 días, sin `token_blacklist`.

**Frontend.** `api/client.ts` guarda los tokens en `localStorage` (`guardarTokens`). `CampoAuth` ya trae el ojo para alternar la visibilidad. `PerfilPage` muestra los datos en tarjetas de dos columnas, y `Modal` es el único modal del sistema.

Ver proposal.md.

## Goals / Non-Goals

**Goals:**
- Cambiar la contraseña con la actual como prueba.
- Que las demás sesiones caigan.
- Que la sesión actual siga sin volver a iniciar sesión.

**Non-Goals:**
- Recuperar la contraseña olvidada por correo.
- Crear una contraseña para cuentas de Google.
- Cambiar el correo u otros datos del perfil.
- Revocar los access tokens ya emitidos.

## Decisions

### D1. La lista negra de simplejwt, no un contador propio
Se añade `rest_framework_simplejwt.token_blacklist` a `INSTALLED_APPS`:
- con ella, `RefreshToken.for_user` registra cada refresh en `OutstandingToken`;
- `TokenRefreshView` rechaza los que estén en `BlacklistedToken`.

El cambio recorre `OutstandingToken.objects.filter(user=usuario)` y crea su `BlacklistedToken` con `get_or_create`. Después emite un par nuevo con `_tokens_para()`.
- **Por qué esta opción:** viene con el paquete instalado (sin dependencias nuevas), sus migraciones son las del paquete y es el mecanismo estándar.
- **Alternativa descartada:** un campo "versión de contraseña" en el token. Exigiría una clase de token propia y modificar la validación de cada petición.
- **Limitaciones:**
  - los access ya emitidos duran hasta 15 min;
  - los refresh emitidos antes de activar la app no quedaron registrados y caducan solos en 7 días.

  Ambas se documentan.

### D2. Serializer con errores por campo
`CambiarContrasenaSerializer(actual, nueva)` recibe el usuario por `context`:
- **`validate_actual`:** si no es correcta, error "La contraseña actual no es correcta".
- **`validate`:**
  - una cuenta sin contraseña usable es un error no asociado a ningún campo;
  - `validate_password(nueva, usuario)` convierte su `ValidationError` en un error de `nueva`;
  - si `nueva == actual`, el error es "La nueva contraseña debe ser distinta de la actual", en `nueva`.

La vista usa `serializer.is_valid(raise_exception=True)`, así que los errores salen por el manejador global como 400 con los errores por campo, el mismo formato que el registro.

### D3. Vista atómica y con límite
`CambiarContrasenaView` (`APIView`, `IsAuthenticated`, `throttle_scope = "contrasena"`, con `"contrasena": "5/min"` en `DEFAULT_THROTTLE_RATES`) hace `set_password`, `save` y la lista negra dentro de `transaction.atomic()`, y devuelve `_tokens_para(usuario)` con 200.
- **Ruta:** `path("contrasena", …)`, siguiendo el estilo sin barra final del módulo.
- **Por qué atómica:** si falla la lista negra, no queda una contraseña cambiada con las sesiones viejas vivas.

### D4. `tiene_contrasena` en el perfil
`PerfilSerializer` añade `tiene_contrasena = serializers.SerializerMethodField()`, que devuelve `obj.has_usable_password()`. En el frontend, `Usuario.tiene_contrasena: boolean`.

### D5. Interfaz
- **`PerfilPage`:** tras el `dl` de datos, `<section aria-labelledby>` con `<h2>Seguridad</h2>` y una `Tarjeta`.
  - **Con contraseña:** una fila `flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between`, con `EtiquetaMono` "Contraseña", el valor `••••••••` y el `Boton variante="secundario" tamano="sm"` "Cambiar contraseña" (`ref` para el foco).
  - **Sin contraseña:** el aviso de Google.
  - **Confirmación:** bajo la tarjeta, un `<p aria-live="polite">` con el mensaje de éxito.
- **`ModalCambiarContrasena`:** usa `Modal` directamente, no `ModalDeConfirmacion`, porque necesita un `<form>` (Enter envía y los gestores de contraseñas lo entienden). El formulario lleva un `id`, y el botón Guardar, en `acciones`, usa `form=` y `type="submit"`.
  - **Campos:** tres `CampoAuth` con `autoComplete` `current-password` / `new-password` / `new-password`.
  - **Errores:** cada uno en su campo con `aria-invalid`; los generales, en `role="alert"`.
  - **Éxito:** `onCambiada()`, y la página cierra el modal y muestra el mensaje.
  - **Foco:** al cancelar vuelve solo a quien abrió el modal (comportamiento de `Modal`); tras guardar, `focoAlCerrar` lleva al botón.
- **`api/auth.ts`:** `cambiarContrasena({ actual, nueva })` hace `POST`, luego `guardarTokens(datos)` y devuelve los datos.
- **Errores por campo:** se reutiliza el mecanismo que ya usa el registro en `api/errores.ts`. Si su helper está atado a los nombres de registro, se generaliza sin cambiar el comportamiento del registro.

## Risks / Trade-offs

- [Access tokens vivos hasta 15 min en otros dispositivos] → aceptado y documentado; el refresh ya no les sirve.
- [`OutstandingToken` crece con cada login] → `python manage.py flushexpiredtokens` (de simplejwt) los limpia; se menciona en `CLAUDE.md`.
- [Tokens previos a la lista negra] → caducan en 7 días como máximo; documentado.
- [Migraciones de un paquete externo en producción] → `build.sh` ya ejecuta `migrate`; son tablas nuevas, sin tocar las existentes.
