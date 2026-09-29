## Context

Ver `proposal.md — Why` para la motivación. Estado actual verificado en el
código (commit `ede1305`, rama `adoptar-consola-tecnica`):

- `LoginPage.tsx` y `RegistroPage.tsx` repiten, casi carácter por carácter,
  el mismo `<div className="w-full max-w-sm rounded-superficie border
  border-tinta-100 bg-white/90 p-8 text-center shadow-xl backdrop-blur">`
  con logo, título, subtítulo, `Alerta`, el formulario, el divisor "o",
  `BotonGoogle` y el enlace de cambio de vista. Ninguna lógica compartida
  las mantiene sincronizadas — si una cambia, la otra no, por construcción.
- `Input.tsx` no tiene fondo propio en el `<input>`: solo
  `border border-tinta-300`, transparente. Confirmado leyendo el archivo
  completo en esta sesión.
- `FormularioRegistro.tsx` usa el ícono `usuario` tanto para "Nombre
  completo" como para "Carnet de identidad" — no hay ícono de
  identificación en `Icono.tsx` hoy.
- El usuario confirmó (AskUserQuestion) que "mismo color" significa que la
  tarjeta y el fondo deben leerse **fundidos** — misma base de color,
  distinguidos solo por transparencia/desenfoque/borde/sombra — no
  literalmente idénticos sin ninguna separación.

## Goals / Non-Goals

**Goals:**

- Que la tarjeta de login/registro se lea como una superficie de vidrio
  sobre el mismo fondo, no como un rectángulo blanco flotando encima.
- Que los campos de ambos formularios tengan el relleno tipo "chip" del
  mockup, sin alterar el aspecto de `Input` en el resto de la app.
- Que login y registro no puedan volver a divergir visualmente por
  accidente: la estructura de la tarjeta pasa a vivir en un solo lugar.

**Non-Goals:**

- No se rediseña el contenido de los formularios (campos, validaciones)
  otra vez — eso ya se decidió y confirmó en el cambio anterior.
- No se toca `Boton.tsx` (la prop `forma="pildora"` ya agregada es
  suficiente) ni `BotonGoogle.tsx`.
- No se persigue paridad al píxel con el mockup — se prioriza consistencia
  con los tokens `tinta`/`iris` ya establecidos.

## Decisions

### La tarjeta usa tinta-50 como base, no blanco

Hoy: `bg-tinta-50` en la página, `bg-white/90` en la tarjeta. Aunque
`tinta-50` (`#F6F7FB`) y blanco al 90% son visualmente parecidos, no son la
misma base — el resultado se lee como "una tarjeta blanca sobre un fondo
gris clarísimo", no como vidrio.

Decisión: la tarjeta pasa a `bg-tinta-100/60` (la misma familia tonal que
el fondo, con transparencia real) en vez de `bg-white/90`. Se mantiene
`backdrop-blur` para el efecto de desenfoque y `border border-tinta-100` +
`shadow-xl` para que la tarjeta siga siendo distinguible — la separación
viene de esos tres, no de un cambio de tono. Esto reproduce exactamente lo
que hace el mockup: `--card: rgba(255,255,255,.55)` sobre
`background:#e8edf5` — dos variantes translúcidas de la MISMA familia de
color, nunca blanco puro contra un fondo de otro tono.

Alternativa descartada: `bg-white/40` (más transparente, mismo blanco).
Se probó mentalmente contra el criterio del usuario ("fundidos, como en el
mockup") y no cumple — seguiría siendo blanco, solo que más tenue; el
mockup no usa blanco puro para la tarjeta, usa un blanco atenuado que en
la práctica encaja en la familia de grises del fondo. Usar `tinta-100`
(un paso de la MISMA escala neutra que `tinta-50`) es la solución
correcta dentro del sistema de tokens del proyecto — no requiere una
variable nueva.

### `Input.tsx` gana una variante opcional `relleno`, no un cambio de default

Se agrega `variante?: 'linea' | 'relleno'` (default `'linea'`, el
comportamiento actual — ningún campo existente en el resto de la app
cambia). `'relleno'` agrega `bg-white/70` al `<input>` — un blanco más
opaco que la tarjeta, igual que en el mockup (`--field:
rgba(255,255,255,.72)` es más opaco que `--card: rgba(255,255,255,.55)`),
así los campos se leen como una capa encima de la tarjeta, no al mismo
nivel. Mismo patrón ya usado para `forma` en `Boton.tsx`: prop opcional,
default = comportamiento actual, sin blast radius fuera de donde se pasa
explícitamente.

Alternativa descartada: cambiar el default de `Input` directamente. Se
rechaza — `Input` se usa en Perfil, Selección de entrevista, y en el resto
del sistema con la apariencia actual (borde sin relleno, ya validada);
cambiar el default arrastraría un cambio visual no pedido a pantallas que
no forman parte de este pulido.

### Ícono dedicado para "Carnet de identidad"

Se agrega `identificacion` a `Icono.tsx` (trazo real de Tabler `id`,
mismo método que los demás — sin aproximar a mano). `FormularioRegistro`
pasa a usar `icono="identificacion"` en el campo `carnet`, dejando
`icono="usuario"` solo en "Nombre completo".

### `TarjetaAuth`: layout compartido, no una tercera copia

Se extrae `features/auth/components/TarjetaAuth.tsx` con la estructura
común: fondo de página, tarjeta de vidrio, logo, título/subtítulo (props),
slot para el formulario (`children`), divisor, `BotonGoogle` (recibe
`onCredential`), y el enlace de cambio de vista (props `pregunta`,
`textoEnlace`, `rutaEnlace`). `LoginPage.tsx` y `RegistroPage.tsx` quedan
como composición: pasan sus props y su formulario específico como hijo.

Esto no es refactor por estética — es la corrección de la causa raíz del
reporte: dos pantallas que debían verse idénticas en su chrome y
divergieron porque nada las mantenía sincronizadas. Con un solo componente
de layout, divergir de nuevo por accidente deja de ser posible.

Alternativa descartada: dejar el marcado duplicado y solo igualar las
clases a mano esta vez. Resuelve el síntoma actual pero dejaría la misma
causa raíz para la próxima vez que se toque una de las dos pantallas.

## Risks / Trade-offs

- **`bg-tinta-100/60` puede leerse "sucio" en pantallas con mal calibrado
  de color** → Es el mismo riesgo que ya asume el resto del sistema al
  usar `tinta-100` como color de borde/fondo en todas partes; no es un
  riesgo nuevo introducido por este cambio.
- **Refactor de `TarjetaAuth` toca dos pantallas ya funcionando** → Bajo
  riesgo: es solo reestructuración de JSX/props, sin tocar `useAuth`,
  `Credenciales` ni `DatosDeRegistro`; se verifica con el mismo recorrido
  funcional de login/registro que en el cambio anterior.
- **Confundir `variante="relleno"` con el prop `opcional` existente de
  `Input`** → Nombres distintos y sin solapamiento de valores; se
  documenta en `docs/arquitectura.md` igual que `forma` de `Boton`.

## Open Questions

Ninguna — la ambigüedad sobre "mismo color" ya se resolvió con el usuario
antes de escribir este documento.
