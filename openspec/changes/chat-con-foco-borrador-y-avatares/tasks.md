## 1. Borrador

- [x] 1.1 Crear `lib/borrador.ts` con `claveDeBorrador`, `leerBorrador`, `guardarBorrador`, `borrarBorrador` y `borrarTodosLosBorradores`, todas con `try/catch`.
- [x] 1.2 Crear `lib/borrador.test.ts` (Vitest) que cubra:
  - la clave;
  - guardar y leer;
  - que un texto vacío borre la clave;
  - que se borren todas las claves del prefijo y no las demás;
  - que un almacenamiento que lanza error se comporte como vacío.
- [x] 1.3 `features/auth/context/AuthProvider.tsx`: `cerrarSesion` llama a `borrarTodosLosBorradores`. Va aquí, y no en `api/client.ts`, para que la capa de API no dependa de nada fuera de ella.

## 1b. Foco de los campos con una sola línea

- [x] 1b.1 `styles/utilidades.css` (`@utility campo`): al enfocar, el anillo de 2 px se dibuja sobre el borde (`outline-offset: -1px`) en lugar de separado 2 px. Queda una sola línea gruesa y no el borde fino más el anillo.

## 2. Campo de respuesta

- [x] 2.1 `components/ui/Textarea.tsx`: aceptar `ref` y pasarlo al `<textarea>`.
- [x] 2.2 `features/entrevista/components/CampoRespuesta.tsx`:
  - recibe `claveBorrador`;
  - el texto inicial es el borrador; se guarda al escribir y se borra al enviar;
  - el placeholder dice «Espera la siguiente pregunta…» mientras está deshabilitado;
  - el foco vuelve al habilitarse, si lo tenía y con `(pointer: fine)`.
- [x] 2.3 `features/entrevista/pages/EntrevistaPage.tsx`: pasar `claveBorrador` a `CampoRespuesta`, armada con el id de la entrevista y la pregunta actual. No se usa `key`: el campo carga el borrador de la pregunta nueva sin remontarse, así conserva el ref del foco.

## 3. Avatares

- [x] 3.1 `components/ui/Avatar.tsx`: agregar `tono` (`oscuro` por defecto, `claro`) y actualizar su comentario.
- [x] 3.2 `components/ui/BurbujaPregunta.tsx`:
  - pasa a una fila con el avatar junto a la cola: la marca para la IA y las iniciales, o el icono `usuario`, para el usuario;
  - recibe la prop `nombreUsuario`;
  - lleva el autor en `sr-only` y quita `EtiquetaMono`.
- [x] 3.3 `features/entrevista/components/ChatEntrevista.tsx` y `features/resultados/components/PreguntaDeLaTranscripcion.tsx`: pasan `nombreUsuario`, tomado de `useAuth()`.

## 4. Verificación

- [x] 4.1 `pnpm exec tsc --noEmit`, `pnpm test`, `pnpm run lint` y `pnpm run build`.
- [x] 4.2 En el navegador, con el usuario demo y la IA `fake`:
  - enviar con Enter y escribir la respuesta siguiente sin hacer clic;
  - escribir, recargar y ver que el texto sigue;
  - enviar y ver que se borró;
  - cerrar sesión y ver que no queda ninguna clave `borrador:`.
- [x] 4.3 Capturas del chat en 1440 px y 390 px (también mientras evalúa) y de la Transcripción del reporte.
- [x] 4.4 `openspec validate chat-con-foco-borrador-y-avatares --strict`.

## 5. Cierre (lo hace Jorge)

- [ ] 5.1 Revisar y hacer el commit; no lo hace Claude.
