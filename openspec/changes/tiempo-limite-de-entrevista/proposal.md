## Why

Hoy una entrevista vence tras 30 minutos **sin actividad**, contados desde la última respuesta, y eso solo se revisa al listar el historial. Esto deja tres huecos:

- quien abre `/entrevista/<id>` directamente, o deja la pestaña abierta, puede seguir respondiendo horas después;
- quien responde cada 25 minutos nunca vence;
- el abandono pasivo no escribe `fecha_fin`.

Además, abandonar da una **nota parcial**. Eso premia dejar la entrevista a medias, cuando en una entrevista técnica real lo incompleto no se califica.

## What Changes

- **Límite total de 30 minutos**, contado desde que el usuario pulsa «Comenzar» (`fecha_inicio`). El reloj sigue corriendo aunque se cierre el navegador. Reemplaza la regla de inactividad, que se elimina.
- **Nuevo estado `TIEMPO_AGOTADO` («Tiempo agotado»)** para cuando el límite vence con 1 a 4 respuestas. Si vence sin ninguna, queda `ABANDONADA`. El abandono manual sigue siendo `ABANDONADA`.
- **El backend es la autoridad.** Todo acceso a una entrevista en curso revisa el límite y la cierra si venció: el historial, el detalle, responder y los resultados. Una respuesta que llega después del límite recibe **409**. Una respuesta que llegó a tiempo se sigue evaluando aunque la IA termine después del límite, o aunque haya que reintentarla.
- **BREAKING (API):** solo una entrevista `FINALIZADA` tiene nota.
  - Se quita `puntuacion_parcial` del historial.
  - Fuera de `FINALIZADA`, `/resultados/` devuelve `resumen` y `veredicto` en `null`, y cada evaluación en modo «sin nota»: fortalezas, debilidades y sugerencias, sin `puntuacion` ni `niveles`.
  - `POST /veredicto/` responde 409 fuera de `FINALIZADA`.
- **La API publica `fecha_limite` y `ahora`,** la hora del servidor, para que el cliente cuente sin depender de su propio reloj.
- **Chat:**
  - el cronómetro ascendente (`Cronometro`, solo informativo) pasa a una **cuenta regresiva** siempre visible y discreta, con aviso a los 5 minutos y a 1 minuto;
  - en 0, el campo se bloquea y la pantalla pasa al reporte;
  - el modal de abandonar ya no promete una nota parcial.
- **Sidebar:** «Continuar · n/total · m min».
- **Reporte de una entrevista no finalizada:** el encabezado con «Respondiste k de 5. Sin nota: la entrevista no se completó.», el botón «Volver a intentarlo» y la transcripción con retroalimentación pero sin puntajes. No muestra puntuación, banda, veredicto, desglose ni plan de mejora.
- **Historial:**
  - un badge para «Tiempo agotado»;
  - la columna Nota muestra «—» fuera de `FINALIZADA` (se quita «· parcial»).
- **Veredicto:** se quita el modo «parcial» del redactor (`EntradaDeVeredicto.parcial`), porque ya solo redacta para entrevistas finalizadas.

## Capabilities

### New Capabilities
- `tiempo-limite-de-entrevista`: cubre:
  - el límite total de 30 minutos y los estados en que termina una entrevista (finalizada, tiempo agotado, abandonada);
  - que el backend lo haga cumplir en cada acceso;
  - que solo la entrevista finalizada tenga nota;
  - qué ve el usuario de una entrevista no finalizada;
  - la cuenta regresiva del chat y del sidebar.

### Modified Capabilities
- (ninguna: `simular-entrevista` cubre la pantalla de selección, que no cambia)

## Impact

- **Backend:**
  - `apps/entrevistas/`:
    - `models.py`, con un estado nuevo y la migración `0010`, que solo cambia `choices`;
    - `services.py`;
    - `views.py`;
    - `serializers.py`;
    - `selectors.py`;
    - los tests de abandono, historial, resumen y veredicto, y `apps/evaluaciones/tests/test_formula_api.py`.
  - En `integrations/ia/`, `prompts/veredicto.py`, `fake.py` y la copia fijada de prompts (se regeneran los `.txt`).
- **Frontend:**
  - `types/entrevista.ts`, `lib/estados.ts` y `components/ui/Badge.tsx`;
  - `features/entrevista/`: la lógica nueva `tiempo.ts` con su test, el reloj, `useEntrevista` y `EntrevistaPage`;
  - `components/ui/Cronometro.tsx`, que se elimina;
  - `components/layout/useEntrevistaEnCurso.ts` y `SidebarAccionPrincipal.tsx`;
  - `features/resultados/`: `ResultadosPage`, `PuntuacionGlobal`, `PreguntaDeLaTranscripcion` y `useVeredicto`;
  - `features/historial/components/TablaDeEntrevistas.tsx` y los tests de historial y reporte.
- **Datos:** las entrevistas `ABANDONADA` que ya existen no se reclasifican. Conservan sus evaluaciones, pero ya no muestran nota.
- **Docs:** las secciones de `CLAUDE.md` sobre abandono y nota parcial. La tesis también cambia, en las reglas de negocio y los estados de la entrevista; eso lo hace Jorge.
