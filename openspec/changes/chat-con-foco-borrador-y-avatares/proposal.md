## Why

Cada vez que Jorge envía una respuesta, tiene que volver a hacer clic en el campo para escribir la siguiente. Mientras se evalúa, el campo se deshabilita, y al deshabilitarse el navegador le quita el foco; cuando se habilita otra vez, nada se lo devuelve.

El bloqueo es correcto: todavía no hay pregunta que responder y así se evitan envíos dobles. Pero sin el foco cada pregunta cuesta un clic. Además, el campo gris no dice por qué está bloqueado, y si la página se recarga a mitad de una respuesta se pierde lo escrito.

De paso, Jorge quiere que cada mensaje muestre quién lo escribe, como en un chat de mensajería.

## What Changes

- **El foco vuelve solo al campo** cuando llega la siguiente pregunta, si el usuario lo estaba usando al enviar. Solo pasa en dispositivos con puntero fino (mouse o trackpad): en el celular abriría el teclado y taparía la pregunta antes de leerla.
- **El campo explica su bloqueo:** mientras se evalúa, el placeholder dice «Espera la siguiente pregunta…».
- **Borrador por pregunta:**
  - lo que se escribe se guarda en el navegador y vuelve si se recarga la página o se cierra la pestaña;
  - se borra al enviar la respuesta;
  - al cerrar sesión se borran todos los borradores.
- **Avatares en el chat y en la Transcripción del reporte:**
  - cada burbuja lleva un avatar junto a la esquina de su cola: la marca de la app para la IA, abajo a la izquierda, y las iniciales del usuario, abajo a la derecha;
  - la etiqueta visible «IA · ENTREVISTADOR» desaparece, porque el avatar ya lo dice;
  - el lector de pantalla sigue oyendo «Entrevistador:» y «Tú:».
- **Fuera de alcance:**
  - cambiar cuándo se bloquea el campo;
  - la vista previa de la landing;
  - mostrar la hora de cada mensaje.

## Capabilities

### New Capabilities
- `sistema-visual`: la burbuja del chat con el avatar del autor. Es la misma capacidad que crean los cambios de diseño anteriores, que aún no están archivados.

### Modified Capabilities
- `simular-entrevista`: agrega requisitos sobre el campo de respuesta durante la entrevista (foco, bloqueo explicado y borrador). No cambia los requisitos que ya tiene.

## Impact

- **Frontend:**
  - `features/entrevista/components/CampoRespuesta.tsx`, `ChatEntrevista.tsx` y `pages/EntrevistaPage.tsx`;
  - el archivo nuevo `lib/borrador.ts`, con su test;
  - `components/ui/Textarea.tsx`, que acepta `ref`;
  - `components/ui/BurbujaPregunta.tsx` y `Avatar.tsx`;
  - `features/resultados/components/PreguntaDeLaTranscripcion.tsx`;
  - `features/auth/context/AuthProvider.tsx`, que limpia los borradores al cerrar sesión;
  - `styles/utilidades.css`: al enfocar un campo se ve una sola línea gruesa, sin el borde fino al lado.
- **Datos:** el borrador queda solo en el navegador (`localStorage`). No se envía al servidor.
- **Sin cambios** en el backend ni en la API.
