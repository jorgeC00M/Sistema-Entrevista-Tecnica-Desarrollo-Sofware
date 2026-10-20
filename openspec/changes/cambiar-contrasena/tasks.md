## 1. Backend

- [x] 1.1 En `config/settings/base.py`, añadir `rest_framework_simplejwt.token_blacklist` a `INSTALLED_APPS` y `"contrasena": "5/min"` a `DEFAULT_THROTTLE_RATES`. Ejecutar `python manage.py migrate`. Se verifica con `showmigrations token_blacklist`, todas aplicadas.
- [x] 1.2 En `apps/usuarios/serializers.py`, añadir `tiene_contrasena` a `PerfilSerializer` y crear `CambiarContrasenaSerializer` (D2, D4).
- [x] 1.3 En `apps/usuarios/views.py`, crear `CambiarContrasenaView` (atómica, con la lista negra de todos los `OutstandingToken` del usuario y un par nuevo) y añadir la ruta `contrasena` en `urls.py` (D1, D3).
- [x] 1.4 Crear `apps/usuarios/tests/test_contrasena.py`, que cubra:
  - un cambio correcto (tokens nuevos; el login con la nueva sí y con la vieja no);
  - una contraseña actual incorrecta (400 en `actual`);
  - una nueva débil (400 en `nueva`);
  - una nueva igual a la actual (400);
  - sin token (401);
  - una cuenta de Google (400);
  - el refresh viejo rechazado (401) y el nuevo válido;
  - `tiene_contrasena` true o false en el perfil.

  Ejecutar `python manage.py test` en verde, con el conteo nuevo.

## 2. Frontend

- [x] 2.1 En `types/usuario.ts`, añadir `tiene_contrasena`. En `api/auth.ts`, crear `cambiarContrasena()`, que guarda los tokens nuevos. Reutilizar o generalizar el mapeo de errores por campo de `api/errores.ts`.
- [x] 2.2 Crear `features/perfil/components/ModalCambiarContrasena.tsx` sobre `Modal` (D5):
  - un `<form>` con tres `CampoAuth` y su `autoComplete`;
  - la validación de coincidencia en el cliente;
  - los errores por campo y los generales;
  - Cancelar / Guardar con `cargando`.
- [x] 2.3 En `PerfilPage.tsx`, añadir la sección "Seguridad" (con contraseña: la fila y el botón; Google: el aviso), el modal y la confirmación con `aria-live`, con el foco de vuelta al botón.
- [x] 2.4 Ejecutar `pnpm exec tsc --noEmit`, `pnpm test` (incluida la guarda de estilos), `pnpm run lint` (sin avisos nuevos) y `pnpm run build`, todos en verde.

## 3. Documentación y prueba manual

- [x] 3.1 Actualizar `CLAUDE.md`, en "Two login paths converge…": el cambio de contraseña, la lista negra (solo se invalidan los refresh, los access viven hasta 15 min, la transición de 7 días y `flushexpiredtokens`) y el aviso para las cuentas de Google. Actualizar también el conteo de tests.
- [ ] 3.2 Prueba manual que cubra:
  - un cambio correcto;
  - una contraseña actual errónea;
  - una nueva débil;
  - que no coincidan;
  - una cuenta de Google que ve el aviso;
  - un segundo navegador que pierde la sesión al refrescar;
  - el modal a 375 px y solo con teclado (Enter envía, Esc cierra).

  Si no se puede ejecutar, queda **sin marcar**.
