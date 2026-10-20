## Context

- `features/seleccion/pages/SeleccionPuestoPage.tsx::repetir()` hoy fija el puesto, la tecnología (o `''`) y el nivel, y borra la búsqueda. No desplaza ni mueve el foco.
- `components/ui/Modal.tsx` guarda `document.activeElement` al montarse y le devuelve el foco al desmontarse. Ese es el comportamiento correcto para Cancelar, pero tras "Confirmar" deja el foco en "Repetir última", lejos del siguiente paso.
- La pantalla ya desplaza con `desplazarSuave()`, que respeta `prefers-reduced-motion`, cuando se elige un puesto o un atajo.

Motivación: proposal.md. Requisitos: `specs/repetir-configuracion/spec.md`.

## Goals / Non-Goals

**Goals:**
- Un cuerpo de modal mínimo: solo la configuración que se va a aplicar.
- Que confirmar deje al usuario a un paso de empezar, o justo donde le falta elegir.

**Non-Goals:**
- Iniciar la entrevista directamente al confirmar. Sería un segundo efecto, y caro, porque gasta una llamada a la IA, escondido detrás de un botón que dice "Confirmar".
- Deshacer la aplicación: elegir otro puesto es un clic.

## Decisions

### D1. `focoAlCerrar` en `Modal`

> **Ajuste al implementar:** `focoAlCerrar` es una **función** `() => HTMLElement | null` evaluada al cerrar, no una ref. Con una ref fija, Cancelar también habría movido el foco al siguiente paso; con la función, `RepetirConfiguracion` devuelve el destino solo si se confirmó, y `null` (volver al botón) si se canceló.

`Modal` acepta una propiedad opcional `focoAlCerrar?: RefObject<HTMLElement | null>`, que `ModalDeConfirmacion` reenvía.
- Al desmontarse, si `focoAlCerrar.current` existe, el foco va ahí.
- Si no, vuelve al elemento que abrió el modal, como hoy.

Se lee la referencia al desmontar, no al montar, porque el destino puede renderizarse recién después de confirmar: la lista de tecnologías aparece al elegirse el puesto.

- *Alternativa:* enfocar desde la página con `setTimeout` después de cerrar. Se descarta porque compite con la restauración del propio `Modal` y depende del orden de los efectos. Que el `Modal` sepa adónde ir es lo explícito.

### D2. Destino del foco decidido al confirmar

La página calcula el destino con los datos de la última entrevista, sin esperar al re-render:
- si la tecnología anterior está entre las activas del puesto, el destino es el botón "Comenzar entrevista" (referencia expuesta por `BarraDeResumen` con `forwardRef` o una prop `refBoton`);
- si no, el destino es la primera tecnología (referencia expuesta por `EleccionDePuesto`).

`RepetirConfiguracion` recibe el destino como `focoAlCerrar` y lo pasa al modal. Con el foco puesto en un elemento del paso, el navegador lo desplaza a la vista; además se llama a `desplazarSuave()` para centrarlo con la misma animación que el resto de la pantalla.

### D3. Anuncio

Se reutiliza una región `aria-live="polite"` de la página: "Configuración anterior aplicada" o "Configuración anterior aplicada; falta elegir la tecnología". El cambio de foco por sí solo no explica qué ocurrió a quien no ve la pantalla.

### D4. Limpieza

`RepetirConfiguracion` pierde `seleccionActual`, `busqueda` y la función `loQueSeReemplaza()`. La página pierde el cálculo de `seleccionActual`. No queda código muerto.

## Risks / Trade-offs

- [El destino aún no existe al cerrar (por ejemplo, la lista de tecnologías no terminó de renderizarse)] → `Modal` cae a su comportamiento actual (vuelve al botón que lo abrió). Peor caso: lo de hoy, no un foco perdido.
- [`forwardRef` en dos componentes de la pantalla] → Es el patrón estándar de React para esto; con React 19 basta una prop `ref`.
