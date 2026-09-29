## Why

Una auditoría completa del backend y del frontend encontró cuatro clases de deuda
que hoy son medibles, no hipotéticas:

1. **Corrección y coste sin acotar.** `GET /api/entrevistas/` ejecuta un N+1
   (`apps/entrevistas/services.py:125-129`, un `aggregate` por fila); no existe
   throttling en ninguna parte, así que `POST /responder/` gasta una llamada de IA
   de pago por petición sin límite por usuario ni por IP, y el campo `respuesta`
   no tiene `max_length`, de modo que el texto que va al prompt es ilimitado; el
   adaptador de Gemini no tiene timeout ni captura errores de red, lo que puede
   colgar un worker de Gunicorn y devuelve 500 en vez de 503.
2. **El patrón de capas declarado se cumple en 1 de 4 apps.** El proyecto documenta
   "views → services (escrituras) / selectors (lecturas)" como invariante;
   `evaluaciones` tiene 113 líneas de lectura dentro de `services.py`, `catalogos`
   consulta la ORM desde la vista y `usuarios` escribe dominio dentro del `post`.
3. **Dos sistemas de diseño conviviendo.** Las familias `tinta-*`/`iris-*` están
   muertas salvo una línea (`Boton.tsx:73`, que produce dos colores de foco
   distintos en el mismo producto), y `features/auth/` reimplementa a mano ~30
   literales hexadecimales que son idénticos valor por valor a los tokens
   `vidrio-*` que ya existen.
4. **Capa de datos duplicada y con un bug.** Siete hooks/páginas repiten el mismo
   ciclo fetch+useEffect+cancelado; tres derivan `cargando` como `!datos && !error`,
   lo que cuelga el spinner para siempre si el backend responde 200 con cuerpo
   vacío; y el hook del sidebar vuelve a pedir el historial completo en cada
   cambio de ruta.

El objetivo es que el sistema resista crecer: que una entrevista más no cueste una
consulta más, que un usuario no pueda agotar el presupuesto de IA, que exista un
único sistema visual y una única forma de pedir datos.

## What Changes

**Comportamiento observable (nuevo o corregido):**

- Límite de peticiones por usuario y por IP, con un cupo propio y más estricto para
  el endpoint que consume IA y para los de autenticación.
- Límite de longitud en la respuesta del candidato y en el token de Google.
- Un proveedor de IA mal configurado o caído responde 503, no 500 con traceback.
- El adaptador de Gemini deja de poder colgar el worker: gana timeout y traduce los
  fallos de red a la taxonomía de errores existente.
- Iniciar sesión con Google normaliza el correo, de modo que `Jorge@` y `jorge@`
  dejan de crear dos cuentas distintas.
- **BREAKING (contrato de API)**: `puntuacion_promedio` pasa a emitirse siempre como
  número. Hoy es la cadena `"75.00"` en `/api/entrevistas/` y el número `75.0` en
  `/api/estadisticas/`, y el frontend pinta los dos formatos en pantallas distintas.
- Un error de render deja de producir pantalla en blanco: la aplicación muestra un
  estado de error del que se puede salir.
- El campo de respuesta gana nombre accesible y el hilo de la entrevista anuncia las
  novedades y se desplaza solo.

**Refactorización sin cambio de comportamiento:**

- Lecturas movidas a `selectors.py` en `evaluaciones` y `catalogos`; alta por Google
  movida a un `services.py` en `usuarios`.
- Clase base compartida para los adaptadores de IA (hoy 38 líneas idénticas entre
  `gemini.py` y `claude.py`).
- Índices en los campos por los que realmente se filtra y ordena.
- Borrado de código muerto: `EsPropietario`, la dataclass `Intercambio`, la
  configuración de paginación inerte, `Card`/`Input`/`Modal`, `useFocusTrap`, las
  familias `tinta-*`/`iris-*` y las variantes de componente que nunca se renderizan.
- `features/auth/` pasa a consumir los tokens `vidrio-*`; `iconosAuth.tsx` se funde
  en el módulo de iconos consolidado.
- Un `usePeticion` propio (sin dependencias nuevas) reemplaza los siete ciclos de
  fetch duplicados y aporta cancelación real y caché corta.
- `docs/` y `openspec/` dejan de estar ignorados por git.

## Capabilities

### New Capabilities

- `limites-y-resiliencia`: qué debe hacer el sistema cuando alguien pide demasiado,
  cuando el proveedor de IA falla y cuando la interfaz se rompe — límites de uso,
  límites de entrada, traducción de fallos del proveedor y recuperación ante un
  error de render. Hoy ninguna de esas garantías está escrita en ninguna spec, y
  varias no existen en el código.

### Modified Capabilities

(ninguna: el resto del trabajo es refactorización interna que no altera ningún
requisito ya especificado. Los deltas existentes de `consola-entrevista`,
`historial-progreso` y `retroalimentacion-acumulada` siguen describiendo el mismo
comportamiento observable después de este cambio.)

## Impact

- **Backend**: `apps/entrevistas/{services,serializers,views,models}.py`,
  `apps/evaluaciones/` (nuevo `selectors.py`), `apps/catalogos/` (nuevo
  `selectors.py`), `apps/usuarios/` (nuevo `services.py`),
  `config/settings/base.py`, `integrations/ia/{base,gemini,claude,factory}.py`,
  más una migración de índices y tests nuevos para los huecos detectados.
- **Frontend**: nuevo `src/hooks/usePeticion.ts` y `components/ui/Tarjeta.tsx`;
  `src/api/client.ts`; los siete consumidores del ciclo de fetch; `features/auth/`
  completo (paleta e iconos); `styles/index.css`; borrado de tres componentes y de
  dos familias de tokens.
- **Sin dependencias nuevas** en ninguna de las dos mitades.
- **Contrato**: el cambio de `puntuacion_promedio` a número obliga a tocar
  `frontend/src/types/evaluacion.ts` y las dos pantallas que hoy renderizan la
  cadena cruda. Es el único cambio que rompe compatibilidad.
- **Riesgo visual acotado** en login/registro al migrar sus literales a tokens:
  requiere revisión en pantalla, no solo verificación automática.
