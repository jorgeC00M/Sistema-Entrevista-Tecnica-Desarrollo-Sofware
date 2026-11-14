## Context

- **Campo de respuesta** (`features/entrevista/components/CampoRespuesta.tsx`):
  - guarda el texto en un `useState('')` y lo vacía al enviar;
  - el `<Textarea>` recibe `disabled={deshabilitado}`;
  - `EntrevistaPage.tsx` le pasa `deshabilitado={ocupado || vencido || respuestaGuardada}`.
  - Al pasar a `disabled`, el navegador mueve el foco al `body`, y nadie lo devuelve cuando el campo vuelve a habilitarse.
- **`components/ui/Textarea.tsx`** no acepta `ref`. Como el proyecto usa React 19, `ref` es una prop más; basta con declararla.
- **Chat** (`ChatEntrevista.tsx`): ya baja solo al final del hilo y anuncia lo nuevo con `aria-live="polite"`.
- **Burbuja** (`components/ui/BurbujaPregunta.tsx`): una columna con la etiqueta `EtiquetaMono` «IA · Entrevistador» y la burbuja, con la cola abajo a la izquierda para la IA y abajo a la derecha para el usuario. También la usa `PreguntaDeLaTranscripcion.tsx`.
- **Avatar** (`components/ui/Avatar.tsx`): muestra iniciales, pero solo en versión oscura, para el sidebar. El nombre del usuario sale de `useAuth()` (`features/auth/hooks/useAuth`, como en `SidebarPerfil.tsx`).
- **Almacenamiento:** `api/client.ts` es lo único que hoy usa `localStorage` (los tokens). `features/auth/context/AuthProvider.tsx::cerrarSesion` llama a `authApi.cerrarSesion()`, que los borra.
- **Foco de los campos** (`styles/utilidades.css`, `@utility campo`): al enfocar, el borde de 1 px pasa al acento y además se dibuja un `outline` de 2 px con `outline-offset: 2px`. Se ven dos líneas, una fina y otra gruesa, separadas por un hueco.

## Goals / Non-Goals

**Goals:**
- escribir la respuesta siguiente sin hacer clic;
- que el bloqueo se entienda;
- no perder lo escrito si se recarga;
- ver quién escribió cada mensaje.

**Non-Goals:**
- cambiar cuándo se bloquea el campo;
- guardar borradores en el servidor;
- mostrar la hora de los mensajes;
- tocar la landing.

## Decisions

### 1. Foco: solo si lo tenía y solo con puntero fino
En `manejarEnvio`, antes de `onEnviar`, se anota en un ref si el foco estaba en el textarea o en «Enviar». Un efecto con `deshabilitado` de dependencia detecta el paso de `true` a `false` comparándolo con su valor anterior, guardado en otro ref. Si el ref está anotado y `window.matchMedia('(pointer: fine)').matches`, enfoca el textarea y limpia el ref.

- **Por qué no siempre:** si el usuario salió del campo (por ejemplo, a «Abandonar»), robarle el foco sería un error.
- **Por qué no en táctil:** el teclado del celular taparía la pregunta nueva.
- **Lector de pantalla:** la pregunta nueva se sigue anunciando por la región `aria-live` del chat.

### 2. Bloqueo explicado con el placeholder
`placeholder={deshabilitado ? 'Espera la siguiente pregunta…' : 'Escribe tu respuesta…'}`. Es el lugar donde la persona ya está mirando, y no añade elementos nuevos. El botón sigue diciendo «Evaluando…».

### 3. Borrador en `localStorage`, por entrevista y pregunta
Las funciones van en `lib/borrador.ts`, puras y con Vitest:
- `claveDeBorrador(id, numero)` devuelve `borrador:<id>:<numero>`;
- `leerBorrador(clave)` devuelve el texto o `''`;
- `guardarBorrador(clave, texto)` borra la clave si el texto queda vacío;
- `borrarBorrador(clave)`;
- `borrarTodosLosBorradores()` recorre las claves con el prefijo.

Todas van envueltas en `try/catch`. Si el almacenamiento falla (modo privado, bloqueado), se comportan como si no hubiera borrador.

`CampoRespuesta` recibe `claveBorrador`. Inicializa el texto con `leerBorrador`, guarda en cada cambio y borra al enviar. Cuando `claveBorrador` cambia porque llegó otra pregunta, el campo carga el borrador de la nueva, normalmente vacío. Lo hace ajustando su estado durante el render, el patrón de React para «estado que depende de una prop», y no remontándose con `key`: al remontarse perdería el ref que recuerda si había que devolver el foco.

- **Por qué `localStorage` y no `sessionStorage`:** `sessionStorage` no sobrevive a cerrar la pestaña, y ese era uno de los casos pedidos.
- **Por qué se borran al cerrar sesión:** en un laboratorio de la universidad, el siguiente usuario no debe encontrar respuestas ajenas.
  - La llamada va en `AuthProvider.cerrarSesion` y no en `api/client.ts`: la capa de API no debe depender de otros módulos.
  - El módulo va en `lib/` y no en `features/entrevista/`, porque `auth` no puede importar otra feature (solo `inicio` lo hace).
  - Cuando la sesión se pierde porque el token vence, no se borran: es el mismo usuario y vuelve a entrar.
- **Si se reenvía:** si una respuesta ya está guardada en el servidor (`respuestaGuardada`), el campo está deshabilitado. El borrador se borró al enviar, así que no compite con «Reintentar».

### 4. Avatar en la burbuja
`BurbujaPregunta` pasa a ser una fila `flex items-end gap-2`:
- IA: `[avatar][burbuja]`;
- usuario: `[burbuja][avatar]`, con `justify-end`.

Avatares:
- **IA:** círculo de 32 px `bg-vidrio-acento text-white` con `Icono nombre="marca"`.
- **Usuario:** `Avatar` con un `tono` nuevo `'claro'` (`bg-vidrio-acento-suave text-vidrio-acento`) y tamaño `sm`. Sin `nombreUsuario`, se muestra `Icono nombre="usuario"` en el mismo círculo. El comentario de `Avatar` deja de decir que solo vive en el sidebar.
- **Accesibilidad:** los dos son `aria-hidden`. Dentro de la burbuja, un `<span className="sr-only">` dice «Entrevistador: » o «Tú: ».

Se quita `EtiquetaMono` y su import si queda sin uso.

`nombreUsuario` es una prop opcional. `ChatEntrevista` y `PreguntaDeLaTranscripcion` la toman de `useAuth()`.

**Por qué no lo lee la burbuja:** es un componente de `ui/` y no debe depender de una feature.

El ancho de la burbuja (`max-w-[85%] sm:max-w-[75%] lg:max-w-prose`) no cambia.

### 5. Foco de los campos: una sola línea gruesa
En `@utility campo`, el `outline` de foco pasa a `outline-offset: -1px`. El anillo de 2 px cubre el borde de 1 px y se ve una sola línea gruesa en el color de acento, pegada al campo.

**Por qué `outline` y no `box-shadow`:** el `outline` sigue visible en el modo de alto contraste de Windows, y la sombra no. El estado de error no cambia.

## Risks / Trade-offs

- **[El avatar quita espacio en celular]** → Son 32 px más 8 px de separación. La burbuja sigue limitada al 85 % del espacio restante.
- **[Un borrador queda huérfano si se abandona la entrevista sin enviar]** → Es texto propio en el navegador propio, y se borra al cerrar sesión. Como mejora, al cargar una entrevista que ya no está en curso se puede borrar su borrador; se hace solo si es trivial en `useEntrevista`.
- **[El efecto de foco se dispara al reintentar]** → Reintentar pasa por un clic en el botón de la alerta, así que el ref no queda anotado y el foco no se mueve.

## Migration Plan

Sin datos que migrar. Los borradores son nuevos y locales. Para revertir, se deshacen los archivos listados.
