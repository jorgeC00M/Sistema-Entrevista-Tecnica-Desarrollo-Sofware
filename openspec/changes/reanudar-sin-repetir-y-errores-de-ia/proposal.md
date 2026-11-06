## Why

La entrevista tiene tres fallos que un usuario final notaría, y en la defensa pueden aparecer con solo 2 o 3 personas a la vez.

**El servidor atiende una sola petición a la vez.** Según `backend/build.sh`, arranca con `gunicorn config.wsgi:application`, sin opciones: un proceso que atiende de a una petición y la corta a los 30 s. Mientras la IA evalúa la respuesta de una persona, las demás esperan. Si la IA tarda más de 30 s, la evaluación se corta a la mitad.

**Una pregunta ya respondida se vuelve a pedir.** Pasa al recargar mientras la IA evalúa, o cuando la evaluación falló:
- La «pregunta pendiente» es la primera **sin evaluar**, aunque ya tenga respuesta, así que el chat la vuelve a mostrar como nueva.
- Lo que el usuario escriba ahí se ignora.
- Tras recargar, «Reintentar» no hace nada: la respuesta solo estaba en memoria.
- Dos envíos a la vez sobre la misma pregunta terminan en un error 500.

**Los errores de la IA no tienen formato.** Llegan como un texto suelto. El frontend no sabe qué pasó ni si el usuario perdió algo.

**El reloj se puede desviar.** Calcula el tiempo restante con una hora del servidor que puede venir de una caché de hasta 30 s. Además, cuenta con el reloj del dispositivo, que salta si alguien cambia la hora del sistema.

## What Changes

- **Servidor:** el comando de inicio documentado pasa a `--workers 2 --threads 8 --timeout 120`. Así atiende unas 16 peticiones a la vez y no corta una evaluación lenta.
- **Reanudar sin repetir:**
  - **Pregunta respondida sin evaluar:** recargar muestra la pregunta y la respuesta una sola vez, con «Evaluando tu respuesta…». El chat consulta el estado sin reenviar nada, hasta que aparece la siguiente pregunta.
  - **Evaluación fallida:** si el servidor agotó sus intentos y la marcó como fallida, el chat dice «Tu respuesta está guardada» y ofrece [Reintentar], que reenvía la respuesta guardada en el servidor.
  - **Sin noticias:** si pasan 2 minutos sin evaluación ni marca de fallo (por ejemplo, porque el servidor se reinició), el chat la trata como fallida.
  - **Envíos simultáneos:** dos envíos sobre la misma pregunta dejan una sola evaluación y ningún error.
  - **JSON inválido:** cuando la IA responde un JSON que no sirve, el servidor reintenta una vez antes de rendirse.
- **Errores de IA claros:**
  - toda respuesta de error de la IA trae un `codigo`: `ia_ocupada`, `ia_rechazo` o `ia_respuesta_invalida`;
  - la interfaz los muestra con un único aviso rojo: qué pasó, qué se conserva y qué hacer;
  - se usa en el chat, al iniciar una entrevista y al analizar una convocatoria;
  - nunca se muestra el nombre del proveedor.
- **Reloj:**
  - se ancla al momento en que **llegó** la respuesta del servidor;
  - cuenta con un reloj monotónico, que no salta si alguien cambia la hora del sistema;
  - se resincroniza con el servidor al volver a la pestaña.
- **Escalabilidad, para la defensa:**
  - una prueba de carga reproducible con Locust, sobre el proveedor falso con una latencia configurable;
  - la sección «Escalabilidad y trabajo futuro», con las estimaciones, las etapas de crecimiento y la arquitectura de cola y workers;
  - no se implementa Redis ni una cola.

## Capabilities

### New Capabilities
- `reanudar-sin-repetir`: qué ve y qué hace la entrevista cuando la pregunta pendiente ya tiene respuesta (en evaluación o con la evaluación fallida), y la garantía de una sola evaluación por respuesta.
- `errores-de-ia`: el código de cada fallo de la IA y cómo se presenta al usuario.

### Modified Capabilities
- `tiempo-limite-de-entrevista` (delta aún sin archivar): se agrega un requisito, que el reloj no dependa de la hora del dispositivo.

## Impact

- **Backend:**
  - `apps/entrevistas/`: `models.py` (`Intercambio.evaluacion_fallida_en`), la migración `0013`, `services.responder`, `views.py` (`pregunta_pendiente` con `respuesta`, `respondido_en` y `evaluacion_fallida`) y sus tests;
  - `apps/common/exceptions.py` (`codigo`);
  - `integrations/ia/base.py` (un reintento ante un JSON inválido) y `fake.py` (`IA_FAKE_LATENCIA_MS`);
  - `build.sh`, `requirements/local.txt` (`locust`) y `tests/carga/`.
- **Frontend:**
  - en `features/entrevista/`: `reanudar.ts` (nuevo), `tiempo.ts`, `hooks/useEntrevista.ts` y `pages/EntrevistaPage.tsx`;
  - `lib/erroresDeIA.ts` y `components/ui/AlertaDeIA.tsx` (nuevos);
  - `hooks/usePeticion.ts` (`recibidoEn`), `components/layout/useEntrevistaEnCurso.ts`, `features/seleccion/pages/SeleccionPuestoPage.tsx`, `ModalDeInicio.tsx` y `PanelDeConvocatoria.tsx`.
- **API:**
  - la forma de `pregunta_pendiente` crece, sin romper nada;
  - los errores 502 y 503 de la IA suman `codigo`;
  - no se rompe ningún contrato.
- **Despliegue:** Jorge actualiza el comando de inicio en Render y aplica la migración.
- **Tesis:** la arquitectura de escalabilidad va en «Limitaciones y trabajo futuro».
