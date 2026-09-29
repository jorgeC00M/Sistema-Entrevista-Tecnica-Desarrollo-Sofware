## Why

Hoy el sistema no tiene puerta de entrada. Un visitante que abre la aplicación aterriza en `/`, que es una ruta protegida, y el guard lo expulsa a `/login` sin haberle explicado nunca qué es esto ni por qué debería registrarse. La única información que ve antes de decidir es el subtítulo "Simulador de Entrevistas Técnicas".

El proyecto está dirigido a egresados de Ingeniería de Sistemas de la UMSS que llegarán por recomendación o por un enlace, sin contexto previo. Pedirles una contraseña antes de contarles qué van a recibir es la forma más directa de perderlos, y también deja al tribunal sin una pantalla que presente el sistema.

## What Changes

**Frontend**

- Nueva landing pública en `/`, accesible sin sesión, que explica el servicio y empuja a crear cuenta.
- Header propio de la landing: logo, nombre del sistema, navegación a las secciones, y las acciones de iniciar sesión y crear cuenta.
- Footer con identidad académica (Proyecto de Grado, Ingeniería de Sistemas, UMSS, autor y año), enlaces de navegación y un correo de contacto.
- Sección de cierre con el llamado "¿Quieres iniciar con la entrevista?" y las dos acciones: crear cuenta o iniciar sesión si ya la tiene.
- Las áreas técnicas y los niveles que la landing muestra se leen del backend, no se escriben a mano en el componente.
- **BREAKING** (rutas): la pantalla de selección de área deja de vivir en `/` y pasa a `/nueva-entrevista`. Un usuario con sesión que entra a `/` es llevado directamente ahí, de modo que no aterriza en la página de marketing cada vez que vuelve.
- Se actualizan los enlaces internos que hoy apuntan a `/` como "Nueva entrevista": el del header de la aplicación y los dos del panel de resultados.

**Backend**

- Nuevo endpoint público `GET /api/catalogos/publico/` que devuelve las áreas y los niveles activos sin exigir autenticación. Es el único cambio del backend.
- El endpoint autenticado `GET /api/catalogos/` no se toca: sigue exigiendo sesión y sigue siendo el que consume la pantalla de selección.

**Fuera de alcance**

- No se crean tests. La suite del backend debe seguir en 94, sin sumar ni restar.

## Capabilities

### New Capabilities

- `landing-publica`: presentación pública del servicio antes de iniciar sesión, con la información que un visitante necesita para decidir si crea una cuenta, y el reparto de la ruta raíz entre visitantes anónimos y usuarios con sesión.

### Modified Capabilities

<!-- Ninguna. `openspec/specs/` sigue vacío: la capacidad `seleccion-area` existe
     únicamente como delta dentro del change `completar-migracion-arquitectura`,
     que todavía no se ha archivado. El cambio de su ruta se coordina desde
     Impact, no con un delta sobre una spec que aún no está publicada. -->

## Impact

**Código afectado**

- `frontend/src/features/landing/` — feature nueva completa: página, secciones, header y footer propios.
- `frontend/src/router/index.tsx` — `/` pasa a ser pública y condicional; `/nueva-entrevista` recibe la pantalla de selección.
- `frontend/src/components/layout/Header.tsx` — el enlace "Nueva entrevista" apunta a `/nueva-entrevista`.
- `frontend/src/features/resultados/pages/ResultadosPage.tsx` — mismo ajuste en el botón "Nueva entrevista".
- `frontend/src/api/catalogos.ts` y `frontend/src/types/catalogos.ts` — función y tipo para el catálogo público.
- `frontend/index.html` — título y `meta description`, que hoy no existe y es lo primero que ve un buscador.
- `backend/apps/catalogos/{views,urls}.py` — la vista pública.

**Coordinación con el change en curso**

`completar-migracion-arquitectura` está en 70/84 y sus tareas pendientes incluyen verificar en el navegador que `/progreso` redirige a `/historial`. Ese comportamiento no cambia aquí. Lo que sí se solapa es la ruta `/`: su delta de `seleccion-area` no fija ninguna URL, así que no hay contradicción, pero conviene aplicar este change después de aquel para no verificar dos veces las mismas pantallas.

**Sin impacto**

- El flujo de entrevista, la evaluación, el historial y la autenticación no cambian.
- El contrato de `/api/catalogos/` se mantiene idéntico para la aplicación autenticada.
- Los 94 tests del backend siguen siendo la red de seguridad y deben continuar en verde.
