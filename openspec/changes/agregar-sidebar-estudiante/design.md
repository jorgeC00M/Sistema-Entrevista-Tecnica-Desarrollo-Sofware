## Context

Ver `proposal.md` — Why. Estado que condiciona las decisiones:

- `router/RutaProtegida.tsx` es a la vez guard y layout: decide el acceso y renderiza el shell autenticado (`Header` + `main`). El sidebar entra ahí.
- `components/layout/Header.tsx` tiene marca, dos `NavLink`, nombre del usuario y botón de salir. Usa `useAuth`.
- La landing tiene su propio `HeaderLanding` y no comparte nada con este shell, así que no se ve afectada.
- `GET /api/entrevistas/` ya devuelve el historial con `estado`, `area_display` y `fecha_inicio`. `GET /api/entrevistas/:id/` devuelve `pregunta_pendiente` y `total_preguntas`.
- `Evaluacion` guarda `puntuacion`, `fortalezas`, `debilidades` y `sugerencias`. `apps/evaluaciones/rubricas.py::banda_de()` clasifica una puntuación en una de cuatro bandas, y el serializer ya expone `banda`.
- `calcular_estadisticas` filtra por `estado=FINALIZADA`. La retroalimentación acumulada no lo hará, por la razón del proposal.
- No hay librería de componentes, ni de iconos, ni runner de tests de frontend. `features/landing/components/Icono.tsx` ya establece el patrón de SVG en línea.

La guía de `ui-ux-pro-max` para este trabajo se resume en: indicador de foco visible de al menos 2 px con contraste 3:1, el foco no debe quedar tapado por UI persistente, y el estado activo de navegación no puede depender solo del color.

## Goals / Non-Goals

**Goals:**

- Que retomar una entrevista a medias sea un clic desde cualquier pantalla, no una búsqueda.
- Que el estudiante pueda ver de un vistazo qué carencia se le repite entre entrevistas.
- Que la navegación funcione con teclado y en un teléfono sin degradarse.
- Que no haya dos sitios donde navegar a lo mismo.

**Non-Goals:**

- No se añade ninguna dependencia de npm, ni siquiera para el foco atrapado del cajón.
- No se resumen ni agrupan semánticamente los textos que genera la IA.
- No se permite editar el perfil.
- No se crean tests.
- No se separa Progreso del Historial.

## Decisions

### El sidebar vive en `RutaProtegida`, no en cada página

`RutaProtegida` ya es el layout de la zona autenticada. El sidebar entra ahí y el `<Outlet/>` pasa a ser la segunda columna. Ninguna página necesita saber que existe.

*Alternativa considerada:* un componente `LayoutPrivado` separado del guard. Se rechazó antes por la misma razón y sigue valiendo: duplicaría la jerarquía de rutas sin cambiar nada observable.

### Una sola lista de destinos, renderizada dos veces

El escritorio muestra una barra fija; el móvil, un cajón. Ambos consumen el mismo array de destinos definido una vez, para que añadir una sección no obligue a acordarse de dos sitios.

### El estado activo se marca con fondo y con barra lateral, no solo con color

La guía es explícita en que el estado activo no puede depender únicamente del color. El destino activo llevará fondo `indigo-50`, texto `indigo-700` y una barra vertical a su izquierda, además de `aria-current="page"` para quien navegue por lectura de pantalla.

### El cajón atrapa el foco con código propio, sin librería

Se necesita: cerrar con Escape, cerrar al pulsar fuera, devolver el foco al botón que lo abrió y no dejar que el tabulador se escape del cajón mientras está abierto.

Son unas treinta líneas en un hook. La alternativa es `focus-trap` o Radix, que traen entre 15 y 40 kB y un modelo de componentes que este proyecto no usa en ninguna otra parte. Se mantiene la austeridad que ya rechazó GSAP y una librería de gráficos.

Sobre la implementación: el cajón se marca con `role="dialog"` y `aria-modal="true"`, y el botón que lo abre con `aria-expanded`.

### "Continuar entrevista" se resuelve con el historial que ya se pide

El sidebar necesita saber si hay una entrevista en curso y por qué pregunta va.

Lo primero sale de `GET /api/entrevistas/`, que ya devuelve el estado de cada una. Lo segundo exigiría `GET /api/entrevistas/:id/` para leer `pregunta_pendiente`, que es una segunda petición por cada carga de cualquier pantalla.

Se hará así: un hook pide el historial una vez, toma la entrevista en progreso más reciente y, solo si existe, pide su estado para saber el número de pregunta. Con cero entrevistas a medias —el caso común— es una sola petición.

*Alternativa considerada:* añadir el número de pregunta pendiente al serializer del historial. Es más eficiente, pero engorda una respuesta que consume también el historial, donde ese dato no se usa. Se deja anotado por si el coste se nota.

### El sidebar no bloquea el render mientras carga

El elemento contextual aparece cuando los datos llegan; los destinos fijos se muestran desde el primer instante. Un sidebar que parpadea en cada navegación sería peor que no tenerlo.

Si la petición falla, el elemento contextual simplemente no aparece: es información de conveniencia, no un error que merezca interrumpir al usuario.

### La retroalimentación se agrega en la base de datos, salvo los textos

El reparto por banda se calcula agrupando en SQL. Django no conoce las bandas —viven en `rubricas.py`— así que se agrupa por rangos de puntuación con `Case`/`When` y se traduce a banda con la misma función `banda_de`, para que los umbrales sigan estando en un solo sitio.

Las observaciones textuales se leen tal cual, ordenadas por fecha descendente y limitadas a las 20 más recientes. Sin resumen y sin agrupación semántica: cualquiera de las dos cosas exigiría una llamada nueva a la IA por consulta, con su coste y su latencia, para una vista de consulta.

*Alternativa considerada:* pedirle al modelo que sintetice las carencias recurrentes. Es la versión ambiciosa y cabría en el proyecto, pero es una funcionalidad en sí misma y no una vista. Queda fuera.

### El límite de 20 observaciones es fijo, no paginado

DRF tiene paginación configurada globalmente, pero las vistas de este proyecto son `APIView` y no la aplican. Introducir paginación aquí obligaría a construirla también en el cliente.

Veinte observaciones cubren cuatro entrevistas completas, que es más de lo que un estudiante revisa de una sentada. Si más adelante hace falta ver el histórico completo, entonces se pagina.

## Risks / Trade-offs

**El sidebar añade una petición en cada carga de la zona autenticada** → El historial se pide para saber si hay entrevista en curso. Mitigación: es una sola petición, se hace una vez al montar el layout y no bloquea el render. Si se nota, la alternativa anotada arriba (dato en el serializer) la elimina.

**El foco atrapado escrito a mano es fácil de hacer mal** → Es exactamente el tipo de código que las librerías existen para resolver. Mitigación: el alcance es un cajón con enlaces, sin contenido anidado ni foco programático; y las tres conductas (Escape, clic fuera, retorno de foco) se verifican una por una en el grupo de accesibilidad.

**Mostrar debilidades de entrevistas abandonadas puede desconcertar** → El estudiante podría no recordar una entrevista que dejó a medias. Mitigación: cada observación indica su fecha y su área, y la vista explica que recoge todas las respuestas evaluadas.

**Quitar la navegación del header rompe la costumbre** → Quien ya usaba los enlaces del header no los encontrará. Es un cambio deliberado y de una sola vez; mantener ambos sería peor.

**Una vista que agrega texto generado por IA puede leerse como diagnóstico** → La retroalimentación acumulada da más sensación de autoridad que una evaluación suelta. Mitigación: la vista repite el mismo aviso de alcance que la landing, que el perfil exige textualmente.

## Migration Plan

1. **Backend** — agregación y endpoint. Verificar con `curl` el reparto por banda y las observaciones, el aislamiento entre usuarios y el 401 sin sesión. Correr los 94 tests.
2. **Contrato** — tipos y función de API en el frontend.
3. **Sidebar con destinos fijos** — sin elemento contextual todavía, y adelgazar el header. En este punto la navegación ya funciona.
4. **Cajón en móvil** con su hook de foco.
5. **Elemento contextual** de entrevista en curso.
6. **Páginas nuevas** — perfil y retroalimentación.
7. **Accesibilidad y responsive** como paso propio.

**Rollback**

Todo es aditivo salvo el adelgazamiento del header. `git revert` del commit lo deja como estaba; el endpoint nuevo no lo consume nadie más y la base de datos no se toca.

## Open Questions

- Si el sidebar termina pidiendo el historial en cada navegación y se nota en la latencia, habrá que mover el dato de la pregunta pendiente al serializer del historial. No se decide ahora porque depende de una medición que aún no existe, y no cambia ni las specs ni el desglose de tareas.
