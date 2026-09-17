## Context

Ver `proposal.md` — Why. Estado actual relevante para las decisiones de abajo:

- El backend ya está reestructurado y verde (94 tests). No se toca en este cambio.
- `GET /api/catalogos/` ya existe y devuelve `{areas, niveles, preguntas_por_entrevista}`, con `codigo` como clave estable.
- El frontend son 27 archivos y ~1.400 líneas en `src/`, sin ningún test. Todo está commiteado, así que cada paso es reversible con git.
- La API se consume desde un único envoltorio de `fetch` (`src/api/cliente.js`), que ya resuelve el refresco de token ante 401 y la normalización de errores de DRF. Esa lógica es correcta y está en uso.
- Hay lógica sutil ya resuelta y no documentada fuera del código: reanudar una entrevista tras recargar la página, deshacer el mensaje optimista cuando falla el envío, y la degradación en tres estados del botón de Google.
- Las rutas de `auth` van sin barra final y las de `entrevistas` con barra final. Es asimétrico pero correcto y está verificado contra el backend.

## Goals / Non-Goals

**Goals:**

- Que el contrato con la API deje de ser implícito: hoy no existe ningún tipo para las respuestas del backend, y ese es el mayor foco de errores del frontend.
- Que la aplicación compile y funcione en cada paso intermedio, no solo al final.
- Conservar sin reescribir la lógica que ya está resuelta y probada a mano.
- Dejar la base de desarrollo en un estado que `migrate` acepte.

**Non-Goals:**

- No se introduce un runner de tests de frontend. Sigue sin haberlo y este cambio no lo añade.
- No se cambia el aspecto visual ni la paleta. La migración es estructural y de tipos.
- No se añade gestor de estado, cliente HTTP ni librería de gráficos. El gráfico sigue siendo el SVG hecho a mano.
- No se genera el cliente de API a partir de un esquema OpenAPI.

## Decisions

### Migrar archivo por archivo, no reescribir

Vite compila `.jsx` y `.tsx` mezclados. Se activa `allowJs: true` en `tsconfig.json` y se renombra un archivo a la vez, con la aplicación corriendo.

*Alternativa considerada:* reescribir el frontend desde cero en TypeScript. Son solo 1.400 líneas, así que el volumen no asusta — pero la reescritura pierde precisamente lo que no se ve en un vistazo: la reanudación de entrevista, el rollback del mensaje optimista, y la asimetría de barras finales en las rutas. Reescribir reintroduce esos tres bugs para no ganar nada.

### `strict: true` desde el primer commit

Se activa el modo estricto desde el inicio, no al final. Empezar permisivo y endurecer después obliga a revisar dos veces los mismos archivos, y el valor del tipado está justamente en `strictNullChecks`: la mayoría de los estados del frontend son `Dato | null` mientras carga.

*Consecuencia aceptada:* mientras queden archivos `.jsx` sin migrar, conviven sin tipar. Es temporal y visible.

### Los tipos se escriben a mano desde los serializers

`src/types/` se deriva leyendo `apps/*/serializers.py`. No se añade generación automática.

*Alternativa considerada:* `drf-spectacular` para publicar un esquema OpenAPI y generar el cliente. Es lo correcto en un proyecto con varios consumidores, pero aquí añade una dependencia al backend, un paso de build y un esquema que mantener, para un único consumidor con diez endpoints. El costo supera al beneficio en este tamaño.

### Los códigos de área y nivel se tipan como `string`, no como unión literal

`type CodigoArea = string`, no `'programacion' | 'bases_de_datos' | ...`.

Es deliberado y puede parecer un retroceso. La razón de haber normalizado el catálogo a tablas es que un área se pueda dar de alta desde el admin sin tocar código; una unión literal en el frontend reintroduciría exactamente el acoplamiento que la normalización eliminó, y obligaría a desplegar el frontend para añadir un área. El catálogo es dato en tiempo de ejecución, no un tipo.

### El catálogo se pide al montar la pantalla, sin caché global

Un hook `useCatalogos` en `features/seleccion/hooks/` hace la petición al montar. No se guarda en `AuthContext` ni en `localStorage`.

*Alternativa considerada:* cachearlo al iniciar sesión. Son seis filas y una sola pantalla lo consume; cachearlo introduce el problema de invalidarlo cuando se da de baja un área, que es justo el caso que este cambio quiere soportar.

### `peticion<T>()` tipa la respuesta pero no la valida

La función genérica devuelve `Promise<T>` mediante aserción. No se valida en tiempo de ejecución.

*Alternativa considerada:* validar con Zod. Da seguridad real ante un backend que cambie, pero añade peso al bundle y duplica la definición de cada tipo. Aquí el contrato lo protegen los 94 tests del backend y el hecho de que frontend y backend se despliegan juntos. Queda anotado como riesgo abajo.

### Estructura por features, con `components/` solo para lo transversal

`features/{auth,seleccion,entrevista,resultados,historial}/` contiene páginas, componentes y hooks propios de cada flujo. `components/ui/` y `components/layout/` quedan para lo que usan varias features.

Regla para decidir dónde va un componente: si lo usa una sola feature, vive dentro de ella; en cuanto lo usa una segunda, sube a `components/ui/`.

### `RutaProtegida` sigue siendo guard y layout a la vez

Hoy es una *layout route* con `<Outlet/>` que decide el acceso y además renderiza el shell autenticado. Se conserva así y no se añade un `LayoutPrivado` aparte: separarlos duplicaría la jerarquía de rutas sin cambiar nada observable.

### El reset de Neon se hace recreando el esquema, no con `flush`

`manage.py flush` borra filas pero conserva las tablas y el historial de `django_migrations`, que es justo lo que está inconsistente. Hace falta eliminar el esquema.

Se prefiere la función de reset de rama de Neon si está disponible, porque deja la operación registrada en su consola y es reversible desde allí. Si no, se ejecuta el DDL equivalente por `manage.py dbshell`.

## Risks / Trade-offs

**El tipado no protege ante un cambio del backend** → Los tipos son una aserción, no una validación: si el backend renombra un campo, TypeScript sigue compilando y el fallo aparece en tiempo de ejecución. Mitigación: los tipos se derivan de los serializers en el mismo cambio, frontend y backend se despliegan juntos, y los 94 tests del backend fallan si el contrato cambia sin querer.

**Perder lógica sutil al migrar** → Los tres puntos frágiles son la reanudación de entrevista, el rollback del mensaje optimista y las barras finales de las rutas. Mitigación: migrar por renombrado y ajuste de tipos, nunca reescribiendo el cuerpo de la función; y recorrer el flujo completo en el navegador al terminar.

**Fusionar Historial y Progreso rompe enlaces existentes a `/progreso`** → Mitigación: la ruta comodín ya redirige a `/`; se añade además una redirección explícita de `/progreso` a `/historial` para que un marcador guardado no aterrice en la pantalla equivocada.

**El vaciado de Neon es irreversible** → Se pierden las entrevistas de prueba. Mitigación: es una decisión ya tomada y los datos son desechables; no hay usuarios reales. El catálogo se resiembra solo por migración de datos, así que la base queda utilizable sin pasos manuales.

**La aplicación queda a medio tipar durante la migración** → Mientras haya `.jsx` conviviendo con `.tsx`, `pnpm run build` no garantiza cobertura de tipos. Mitigación: el orden de migración va de la raíz del contrato hacia las hojas (tipos → cliente → api → features), de modo que lo más valioso queda tipado primero; y el paso final elimina `allowJs`.

## Migration Plan

**Fase 1 — Base de datos (antes de tocar el frontend)**

1. Confirmar que `DATABASE_URL` apunta a la base de desarrollo y no a producción.
2. Recrear el esquema: reset de rama en la consola de Neon, o `DROP SCHEMA public CASCADE; CREATE SCHEMA public;` vía `manage.py dbshell`.
3. `python manage.py migrate` — debe aplicar las migraciones de las cinco apps y sembrar el catálogo.
4. `python manage.py createsuperuser` para recuperar acceso al admin.
5. Verificar con `python manage.py test` que los 94 tests siguen en verde.

**Fase 2 — Frontend, de la raíz del contrato hacia las hojas**

Cada paso deja la aplicación compilando y usable:

1. Herramienta: `typescript`, `tsconfig.json` con `strict` y `allowJs`, `vite.config.ts` con alias `@/`.
2. `src/types/` — el contrato con la API.
3. `src/api/` — `client.ts` tipado, más los cinco módulos por endpoint.
4. `components/ui/` y `components/layout/` — las hojas sin dependencias.
5. `features/` — una feature completa a la vez: auth, seleccion, entrevista, resultados, historial.
6. `router/`, `App.tsx`, `main.tsx`.
7. Quitar `allowJs` y borrar los directorios `pages/` y `components/{comunes,entrevista,resultados}/` ya vacíos.

**Rollback**

Todo el árbol está commiteado. Revertir el frontend es `git revert` del commit correspondiente. La base de datos no se revierte: se vuelve a aplicar `migrate` sobre un esquema limpio, que es el mismo procedimiento de la Fase 1.

## Open Questions

- El dominio real del frontend en Vercel y el del backend en Render todavía no están fijados, así que `vercel.json` y `CORS_ALLOWED_ORIGINS` se dejan con los valores de desarrollo. Se resuelve al desplegar, sin afectar a las specs ni al desglose de tareas.
