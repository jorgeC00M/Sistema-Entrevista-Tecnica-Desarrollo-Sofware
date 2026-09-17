## Why

El backend ya se reestructuró a `apps/` + `integrations/` y las áreas y niveles pasaron de ser constantes en Python a tablas reales expuestas en `GET /api/catalogos/`. Quedan dos consecuencias sin resolver: la base de datos de desarrollo en Neon conserva el historial de migraciones anterior y rechaza `migrate`, y el frontend sigue en JavaScript duplicando por su cuenta la lista de áreas, los niveles y el número de preguntas por entrevista.

Esa duplicación ya es un riesgo real: dar de baja un área desde el admin no la retira de la pantalla de selección, y el usuario podría iniciar una entrevista en un área que el backend rechaza con 400.

## What Changes

**Base de datos de desarrollo**

- Se vacía el esquema de Neon y se vuelve a migrar desde cero. **BREAKING**: se pierden las entrevistas de prueba almacenadas. Los datos son desechables y no hay usuarios reales todavía.
- La migración `catalogos.0002_datos_iniciales` deja sembradas las 4 áreas y 2 niveles sin intervención manual.

**Frontend**

- Migración completa de React JavaScript (`.jsx`) a TypeScript (`.tsx`/`.ts`) con `strict: true`. Gestor de paquetes: pnpm.
- Reorganización de `pages/` + `components/` por capas a `features/{auth,seleccion,entrevista,resultados,historial}/`, más `components/{ui,layout}/` para lo transversal.
- Nueva capa `src/types/` que tipa las respuestas de la API. Hoy no existe ningún tipado del contrato con el backend.
- La pantalla de selección deja de hardcodear áreas y niveles: los lee de `GET /api/catalogos/`. Un área desactivada en el admin desaparece de la interfaz.
- El total de preguntas por entrevista se lee de la misma respuesta en vez de asumirse 5.
- **BREAKING** (navegación): las páginas `Historial` y `Progreso` se fusionan en una sola. El menú pasa de tres secciones a dos y la ruta `/progreso` deja de existir.
- Se conserva el inicio de sesión con Google, incluida la degradación cuando `VITE_GOOGLE_CLIENT_ID` está vacío.
- Se añade `vercel.json` para el despliegue del frontend.

## Capabilities

### New Capabilities

- `seleccion-area`: elección del área técnica y el nivel de dificultad antes de iniciar una entrevista, con el catálogo servido por el backend como única fuente de verdad.
- `historial-progreso`: consulta unificada del historial de entrevistas del usuario y de su evolución de desempeño a lo largo del tiempo.

### Modified Capabilities

<!-- Ninguna: el proyecto todavía no tiene specs publicadas en openspec/specs/. -->

## Impact

**Código afectado**

- `frontend/` completo: 27 archivos en `src/` (~1.400 líneas) se renombran a `.ts`/`.tsx` y se reubican. Se elimina `src/pages/` y `src/components/{comunes,entrevista,resultados}/`.
- `frontend/src/api/cliente.js` → `src/api/client.ts`, tipado genérico. Se conserva sin cambios funcionales el reintento único ante 401 con refresco de token y la extracción de mensajes de error de DRF.
- Se añaden `src/api/catalogos.ts` y `src/api/evaluaciones.ts`, que antes no tenían endpoint detrás.
- `frontend/vite.config.js` → `vite.config.ts`, con alias `@/`.

**Dependencias**

- Nuevas en `devDependencies`: `typescript`. Ya están presentes `@types/react` y `@types/react-dom`.
- Sin cambios en dependencias de producción: se mantienen React 19, react-router-dom 7 y Tailwind 4.

**Base de datos**

- Esquema de Neon recreado. No afecta a la suite de tests, que ya crea y destruye su propia base temporal en cada ejecución.

**Sin impacto**

- El backend no cambia. El contrato de la API se mantiene: `area` y `nivel` se siguen serializando como `codigo` en texto, no como id numérico.
- Los 94 tests del backend siguen siendo la red de seguridad y deben continuar en verde.
