## Why

Hoy se puede iniciar una segunda entrevista mientras otra sigue en curso. Cuando eso pasa:
- la primera sigue corriendo sin que se vea;
- vence sola como «Tiempo agotado», sin que el usuario lo haya decidido;
- el calentamiento de la nueva gasta llamadas a la IA.

En una entrevista real nadie está en dos a la vez.

Además, «Continuar» del sidebar se calcula una sola vez por sesión:
- no aparece al empezar una entrevista hasta recargar la página;
- sigue visible después de terminar o abandonar;
- su «3/5» queda congelado.

## What Changes

- **Una sola entrevista en curso por usuario,** garantizada en la base de datos con un índice único parcial.
  - **BREAKING (API):** `POST /api/entrevistas/` responde **409** si ya hay una en curso, con esa entrevista en el cuerpo (`entrevista_en_curso`).
  - Una entrevista vencida no bloquea: se cierra antes de comprobar.
- **Nueva opción `abandonar_en_curso: true` al iniciar.** Abandona la anterior y crea la nueva en una sola transacción. Si la IA falla al crear la nueva, la anterior queda intacta.
- **«Simular entrevista» muestra un aviso** cuando hay una en curso: «Tienes una entrevista en curso: Backend · quedan 4 min [Continuarla]». La pantalla no se bloquea.
- **El modal de inicio, con una en curso,** ofrece:
  - «Continuar la de <puesto>», que es la opción por defecto, con el foco;
  - «Abandonarla y empezar», en estilo de peligro, con la consecuencia dicha: sin nota y sin poder retomarla.
- **Sidebar:**
  - «Continuar · m min», sin «n/total»;
  - en ámbar en los últimos 5 minutos;
  - se actualiza al empezar, terminar o abandonar, sin recargar la página.
- **Caché del frontend:** invalidar una clave hace que las pantallas montadas con esa clave vuelvan a pedir el dato.
- **Datos viejos:** una migración cierra como «Abandonada» las entrevistas en curso sobrantes de un mismo usuario y deja la más reciente.

## Capabilities

### New Capabilities
- `una-entrevista-en-curso`: cubre:
  - que solo haya una entrevista en curso por usuario;
  - abandonar y empezar en un paso;
  - el aviso y el modal de «Simular entrevista»;
  - el botón «Continuar» del sidebar, siempre al día.

### Modified Capabilities
- (ninguna en `openspec/specs/`) El requisito «“Continuar” dice cuánto queda» vive en la delta sin archivar de `tiempo-limite-de-entrevista`, y se corrige allí: quita «n/total».

## Impact

- **Backend:**
  - en `apps/entrevistas/`:
    - `models.py`, con el índice y la migración `0011`, que primero limpia las sobrantes;
    - `services.iniciar`;
    - `IniciarEntrevistaSerializer`;
    - `EntrevistaListCreateView.post`;
    - los tests nuevos y los que creaban varias entrevistas en curso.
- **Frontend:**
  - `hooks/usePeticion.ts` (oyentes de invalidación);
  - `components/layout/useEntrevistaEnCurso.ts` y `Sidebar/SidebarAccionPrincipal.tsx`;
  - en `features/seleccion/`, `SeleccionPuestoPage` y `ModalDeInicio`;
  - en `features/entrevista/`, `useEntrevista` y `EntrevistaPage` (invalidar al terminar o abandonar);
  - `api/entrevistas.ts` y `types/entrevista.ts`.
- **Docs:** `CLAUDE.md`. La tesis la actualiza Jorge con la regla «una entrevista en curso a la vez».
