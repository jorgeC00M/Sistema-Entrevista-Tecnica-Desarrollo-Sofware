## Context

Ver `proposal.md` para la motivación. Lo que condiciona el diseño:

- **El proyecto ya tiene una taxonomía de errores buena y poco usada.**
  `integrations/ia/exceptions.py` define `ErrorTransitorio`/`ErrorPermanente`/
  `RespuestaIAInvalida`, y `apps/common/exceptions.py::manejador_de_excepciones` es
  el único sitio que las traduce a HTTP. El problema no es que falte arquitectura,
  es que tres puntos la evitan lanzando `RuntimeError` pelado.
- **El patrón de capas está declarado y parcialmente implementado.** `entrevistas`
  ya tiene `services.py` + `selectors.py` funcionando; no hay que inventar un
  patrón, hay que aplicarlo a las otras tres apps.
- **Cero dependencias de UI es una postura explícita del proyecto**, documentada en
  `components/ui/Icono.tsx:10-14` y `hooks/useFocusTrap.ts:17-19`. El usuario eligió
  mantenerla: la capa de datos se resuelve con código propio, no con TanStack Query.
- **El sistema visual `vidrio` ya está completo y en uso**; `tinta`/`iris` es
  residuo de la iteración anterior. No hay que diseñar nada nuevo, hay que borrar.
- **No hay runner de tests en el frontend** y no entra en este alcance; la
  verificación del frontend es `tsc` + `lint` + `build` + recorrido manual.

## Goals / Non-Goals

**Goals:**
- Que el coste de la IA y la superficie de abuso queden acotados por configuración,
  no por confianza.
- Que ninguna consulta crezca con el número de entrevistas del usuario.
- Un solo sistema visual, una sola forma de pedir datos, una sola fuente por
  concepto.
- Que la refactorización estructural sea invisible desde fuera: mismos endpoints,
  mismas respuestas (salvo el cambio de `puntuacion_promedio`, declarado como
  breaking).

**Non-Goals:**
- No se introduce caché de servidor, cola de trabajos ni cron: la transición
  perezosa de entrevistas abandonadas sigue ocurriendo dentro del `GET`, solo que
  en una consulta en vez de N.
- No se activa la paginación: se borra la configuración inerte. Activarla cambiaría
  la forma de la respuesta y rompería el tipo `Entrevista[]` del frontend; si algún
  día hace falta, es un cambio propio con su propia migración de contrato.
- No se rediseña nada visualmente: migrar `auth` a tokens debe dar el mismo píxel.
- No entra tooling, CI, despliegue ni actualizar `CLAUDE.md`/`docs/arquitectura.md`.

## Decisions

**Throttling con `ScopedRateThrottle`, no con las clases por defecto.**
Las tasas que hacen falta son distintas por naturaleza: evaluar una respuesta cuesta
dinero real, iniciar sesión cuesta un hash, y listar el historial no cuesta casi
nada. Un `DEFAULT_THROTTLE_RATES` global obligaría a elegir el mínimo común. Con
`ScopedRateThrottle` cada vista declara su `throttle_scope` y las tasas viven juntas
en `config/settings/base.py`, que es donde alguien las va a buscar. Alternativa
descartada: throttle propio por usuario en la base de datos — más control, pero
añade una consulta por petición para resolver un problema que DRF ya resuelve.

**Los adaptadores de IA comparten una clase base con *template method*.**
`gemini.py:40-58` y `claude.py:60-78` son idénticos carácter por carácter, igual que
su bloque de parseo de JSON. Se crea `ProveedorIAporJSON` en `base.py` con
`generar_pregunta`/`evaluar_respuesta` concretos y un único `_pedir_json` abstracto
por proveedor. Esto importa más de lo que parece: los arreglos de timeout y de
taxonomía de errores del Bloque 1 pasan a existir en un solo sitio, en vez de tener
que acordarse de aplicarlos dos veces. Alternativa descartada: dejar la duplicación
y arreglar ambos — es exactamente cómo aparecieron las divergencias actuales
(Claude tiene timeout y reintentos, Gemini no).

**Los fallos de construcción del proveedor heredan de `ErrorProveedorIA`.**
`ProveedorNoDisponible` pasa a heredar de la base de la taxonomía en vez de
`RuntimeError`, con lo que `manejador_de_excepciones` lo traduce a 503 sin tocar la
vista. Es el arreglo más barato del lote: cambia una línea de herencia y elimina una
clase entera de 500 con traceback.

**`COERCE_DECIMAL_TO_STRING = False` en vez de cambiar el tipo de campo.**
Resuelve la asimetría `"75.00"` vs `75.0` en un solo ajuste de configuración, sin
migración ni pérdida de precisión en la base (el campo sigue siendo `DecimalField`).
Alternativa descartada: formatear en el frontend — deja el contrato inconsistente y
obliga a recordar el formateo en cada pantalla nueva.

**`usePeticion` propio, con caché por clave y `AbortSignal`.**
Un hook de ~40 líneas que expone `{datos, cargando, error, recargar}`, deriva
`cargando` de un estado explícito (no de `!datos && !error`, que es el bug actual) y
guarda el resultado en un `Map` module-level con marca de tiempo. Eso cubre las tres
cosas que hoy fallan: el spinner colgado, la doble petición al entrar a `/historial`
y la cancelación que hoy no cancela nada. La caché es corta y con `recargar`
explícito, lo que respeta el razonamiento de `useCatalogos.ts:13-18` (dar de baja un
área debe retirarla de la interfaz) sin pagar una petición por navegación.

**El aviso de sesión perdida es un callback registrado, no un import.**
`api/client.ts` no puede importar el contexto de auth sin crear un ciclo. Se expone
un `alPerderSesion(callback)` que `AuthProvider` registra al montarse; cuando el
refresh falla, `client.ts` lo invoca y el proveedor limpia el usuario. Hoy los
tokens se borran y el usuario se queda en el dashboard viendo errores hasta recargar.

**`features/auth` migra a tokens, y se acepta que el aislamiento era ficticio.**
`docs/arquitectura.md` presenta los literales hexadecimales de auth como aislamiento
deliberado, pero los valores coinciden uno a uno con los tokens `vidrio-*`: el
aislamiento no protege de nada y obliga a editar dos sitios. Tras la migración, el
argumento real que queda en pie —que auth usa componentes propios (`CampoAuth`) en
vez de los compartidos— sigue siendo válido y se conserva.

**Se borra `Card`/`Input`/`Modal` en vez de conservarlos "por si acaso".**
`docs/arquitectura.md:230-234` ya documenta que nadie los usa. Conservar componentes
sin consumidor significa mantener vivas dos familias de tokens y varias variantes
muertas solo para que esos tres archivos compilen. `useFocusTrap` se va con `Modal`,
que es su único consumidor.

## Risks / Trade-offs

- **[Migrar la paleta de auth cambia píxeles sin querer]** → Los valores son
  idénticos, así que la sustitución debería ser neutra; aun así es el único cambio
  que exige revisión visual en pantalla de login y registro antes de darlo por bueno.
- **[Activar `jsx-a11y` va a producir hallazgos nuevos de golpe]** → Se activa al
  final del bloque de accesibilidad y se triará lo que aparezca: lo del flujo de
  entrevista se arregla, el resto se anota. El objetivo es que el linter sostenga lo
  arreglado, no arreglar todo lo que detecte en este change.
- **[Borrar la configuración de paginación cierra la puerta a paginar]** → No la
  cierra: la reabre bien. Hoy la configuración está puesta y no hace nada, lo que es
  peor que no tenerla, porque sugiere una garantía inexistente y rompería el
  frontend en silencio el día que alguien migre una vista a `ListAPIView`.
- **[El throttling puede molestar durante las pruebas manuales]** → Las tasas se
  definen en `base.py` y `local.py` puede relajarlas; conviene fijar el cupo de
  evaluación con holgura suficiente para un recorrido completo de 5 preguntas.
- **[`COERCE_DECIMAL_TO_STRING` es global]** → Afecta a todo `DecimalField`
  serializado. Hoy el único es `puntuacion_promedio`, así que el radio es el
  esperado; queda anotado por si mañana aparece otro.

## Open Questions

- Las tasas concretas de throttling (peticiones por minuto/hora y por scope) se
  fijarán al implementar, con holgura para un recorrido completo de entrevista.
  No cambian el enfoque ni el desglose de tareas.
