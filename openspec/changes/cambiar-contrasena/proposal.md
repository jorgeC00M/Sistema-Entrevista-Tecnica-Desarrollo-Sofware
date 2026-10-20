## Why

"Mi perfil" es de solo lectura y no existe ninguna forma de cambiar la contraseña: ni pantalla ni endpoint. Quien sospecha que su contraseña se filtró no tiene cómo reemplazarla. Además, los tokens de sesión (refresh de 7 días) no se pueden invalidar, así que aunque la cambiara, un dispositivo ajeno seguiría dentro.

## What Changes

- **Sección "Seguridad" en "Mi perfil"**, bajo los datos de la cuenta:
  - con contraseña: la fila "Contraseña · ••••••••" y el botón "Cambiar contraseña";
  - cuenta creada con Google: el aviso "Entras con Google: tu cuenta no tiene contraseña", sin botón.
- **Modal "Cambiar contraseña"**, sobre el `Modal` del sistema:
  - campos "Contraseña actual", "Nueva contraseña" y "Repite la nueva contraseña", con el botón para mostrarlas;
  - botones Cancelar y Guardar;
  - los errores aparecen junto a su campo; si algo falla, el modal sigue abierto;
  - al terminar, un mensaje de confirmación.
- **Nuevo endpoint `POST /api/auth/contrasena`** (autenticado y con límite de 5 por minuto):
  - exige la contraseña actual;
  - aplica los mismos validadores que el registro;
  - rechaza que la nueva sea igual a la actual y las cuentas sin contraseña;
  - invalida todas las sesiones abiertas del usuario y devuelve un par de tokens nuevo para este dispositivo.
- **Lista negra de tokens:** se activa `rest_framework_simplejwt.token_blacklist`, que viene con el paquete ya instalado. Agrega tablas con su migración, sin dependencias nuevas.
- **`GET /api/auth/perfil`** añade `tiene_contrasena`.

## Capabilities

### New Capabilities
- `cambiar-contrasena`: cambiar la contraseña desde el perfil, cerrando las demás sesiones.

### Modified Capabilities
- Ninguna con spec archivado.

## Impact

- **Backend:**
  - `apps/usuarios/{serializers.py, views.py, urls.py}`;
  - `config/settings/base.py`: `INSTALLED_APPS` y la tasa de límite `contrasena`;
  - las migraciones de `token_blacklist`, que se aplican con `migrate`;
  - un nuevo `apps/usuarios/tests/test_contrasena.py`.
- **Frontend:**
  - `features/perfil/pages/PerfilPage.tsx`;
  - un nuevo `features/perfil/components/ModalCambiarContrasena.tsx`;
  - `api/auth.ts` y `types/usuario.ts`.
- **Documentación:** `CLAUDE.md`, en la sección de los dos caminos de login.
- **Despliegue:** Render debe ejecutar `migrate`, que ya forma parte de `build.sh`.
