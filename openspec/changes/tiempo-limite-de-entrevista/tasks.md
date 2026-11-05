## 1. Modelo y migración

- [x] 1.1 En `apps/entrevistas/models.py`:
  - agregar `Estado.TIEMPO_AGOTADO = "tiempo_agotado", "Tiempo agotado"`;
  - agregar la propiedad `fecha_limite`, que lee `MINUTOS_DE_ENTREVISTA` sin importar `services` (vive en el modelo o en un módulo de constantes);
  - actualizar el comentario del índice que nombra `marcar_abandonadas`.
- [x] 1.2 Crear la migración `0010` (solo `choices`), con una nota sobre cómo revertir si hay filas `tiempo_agotado`.

## 2. Servicios

- [x] 2.1 Cambiar `MINUTOS_PARA_ABANDONO` por `MINUTOS_DE_ENTREVISTA = 30`, ahora como límite total.
- [x] 2.2 Reemplazar `marcar_abandonadas` por `cerrar_vencidas(usuario)`:
  - dos `update` de costo constante: 0 respuestas → `ABANDONADA`, ≥ 1 → `TIEMPO_AGOTADO`;
  - `fecha_fin` es el límite.
- [x] 2.3 Agregar `cerrar_si_vencio(entrevista) -> bool`: `update` condicionado a `EN_PROGRESO` y `refresh_from_db()`.
- [x] 2.4 Excepción `TiempoAgotado`. En `responder()`:
  - si el pendiente no tiene respuesta y venció, cerrar y lanzarla;
  - tras evaluar una respuesta guardada, si venció y no era la última, cerrar como `TIEMPO_AGOTADO` sin generar la siguiente.
- [x] 2.5 `pedir_veredicto`: lanzar `EntrevistaNoFinalizada` (reemplaza a `EntrevistaEnCurso`) fuera de `FINALIZADA`.
- [x] 2.6 `_entrada_de_veredicto`: quitar `parcial`.
- [x] 2.7 Reescribir los docstrings de `abandonar` y del cierre.

## 3. Vistas, serializers y selectors

- [x] 3.1 Llamadas al cierre:
  - `EntrevistaListCreateView.get` llama a `cerrar_vencidas`;
  - `EntrevistaDetailView`, `ResponderView` y `ResultadosView` llaman a `cerrar_si_vencio` antes de mirar el estado.
- [x] 3.2 `ResponderView`: `TiempoAgotado` → 409 «Se acabó el tiempo de esta entrevista.»
- [x] 3.3 `ResultadosView`:
  - contexto `evaluacion`: `"completa"` en `FINALIZADA`, `"sin_nota"` en `TIEMPO_AGOTADO` y `ABANDONADA`, `None` en `EN_PROGRESO`;
  - `resumen` y `veredicto` solo para `FINALIZADA`;
  - reescribir el comentario.
- [x] 3.4 `VeredictoView`: 409 con `EntrevistaNoFinalizada`.
- [x] 3.5 `IntercambioSerializer`: reemplazar `con_evaluacion` por `evaluacion`. `sin_nota` devuelve solo `fortalezas`, `debilidades` y `sugerencias`.
- [x] 3.6 `EntrevistaSerializer`:
  - agregar `fecha_limite` y `ahora`;
  - quitar `puntuacion_parcial` y su método;
  - reescribir el comentario de `preguntas_calificadas`.
- [x] 3.7 `selectors`:
  - quitar `promedio_calificado` de `_con_conteo` si queda sin uso;
  - quitar las ramas y comentarios de «parcial» en `resumen_de`.

## 4. Capa de IA

- [x] 4.1 Quitar `EntradaDeVeredicto.parcial` y su rama, tanto en `integrations/ia/prompts/veredicto.py` como en `fake.py`.
- [x] 4.2 Quitar el caso `parcial=True` de `tests/integration/test_prompts_estables.py`.
- [x] 4.3 Regenerar las copias con `python -m tests.integration.test_prompts_estables` y revisar que el diff solo quite lo parcial.
- [x] 4.4 Ajustar `tests/integration/test_veredicto.py`: quitar el caso «no se terminó».

## 5. Tests del backend

- [x] 5.1 Reemplazar `test_abandonadas.py` por `test_tiempo_limite.py`. Debe cubrir:
  - que el límite sea total: responder no lo extiende;
  - el cierre por 0 respuestas o por 1 a 4;
  - que `fecha_fin` quede en el límite;
  - que una abandonada vieja no se reclasifique;
  - el cierre al abrir el detalle o los resultados por enlace directo;
  - el 409 al responder vencido, sin guardar el texto;
  - el reintento de una respuesta guardada a tiempo, que se evalúa y cierra sin generar otra pregunta;
  - que el abandono manual siga en `ABANDONADA`, con 409 si ya está cerrada;
  - que el cierre no pise una `FINALIZADA`.
- [x] 5.2 Sin nota fuera de `FINALIZADA`:
  - `/resultados/` sin `puntuacion` ni `niveles` y sin `resumen` ni `veredicto`;
  - el historial sin `puntuacion_parcial`;
  - el veredicto con 409 y sin llamar a la IA.
- [x] 5.3 Ajustar `test_historial_tabla.py`, `test_resumen.py`, `test_veredicto.py`, `test_entrevistas.py` y `apps/evaluaciones/tests/test_formula_api.py`.
- [x] 5.4 Ejecutar `python manage.py makemigrations --check` y `python manage.py test` (suite completa, Postgres).

## 6. Frontend: tipos y lógica

- [x] 6.1 En `types/entrevista.ts`:
  - el estado agrega `'tiempo_agotado'`, con `fecha_limite` y `ahora`;
  - se va `puntuacion_parcial`;
  - en la evaluación de la transcripción, `puntuacion` y `niveles` pasan a opcionales;
  - reescribir los comentarios.
- [x] 6.2 Crear `features/entrevista/tiempo.ts` con `segundosRestantes`, `formatoReloj`, `tramoDelReloj` y `minutosRestantes`, y `tiempo.test.ts` (desfase de reloj, bordes 300, 60 y 0, redondeo).
- [x] 6.3 `lib/estados.ts` y `Badge`: tono de `tiempo_agotado`.

## 7. Frontend: chat y sidebar

- [x] 7.1 Crear `features/entrevista/components/RelojDeEntrevista.tsx`:
  - la misma píldora, con tramos de color por tokens;
  - `aria-live` una vez por tramo.
- [x] 7.2 Eliminar `components/ui/Cronometro.tsx`.
- [x] 7.3 `useEntrevista`:
  - expone el límite y el desfase;
  - en 0, bloquea el campo y vuelve a pedir el estado, que lleva al reporte;
  - un 409 al responder también va al reporte.
- [x] 7.4 `EntrevistaPage`:
  - usar `RelojDeEntrevista`;
  - texto bajo la cabecera, «Tienes 30 minutos para las N preguntas…»;
  - modal de abandonar, «no tendrá nota»;
  - `CampoRespuesta` deshabilitado al vencer.
- [x] 7.5 `useEntrevistaEnCurso`:
  - agregar `segundosRestantes`;
  - `null` si venció;
  - refrescar cada minuto;
  - reescribir el docstring (ya no «marca abandonadas», cierra vencidas).
- [x] 7.6 `SidebarAccionPrincipal`: «Continuar · n/total · m min», también en el tooltip plegado.

## 8. Frontend: reporte e historial

- [x] 8.1 Crear `features/resultados/components/ReporteSinNota.tsx`:
  - la tarjeta con «Respondiste k de N. Sin nota: la entrevista no se completó.»;
  - «Volver a intentarlo» (`clasesDeBoton` + `Link` a `/simular-entrevista?puesto=&nivel=`);
  - la transcripción.
- [x] 8.2 `ResultadosPage`:
  - fuera de `finalizada`, usar `ReporteSinNota`, sin pestañas;
  - quitar la rama «no tiene respuestas calificadas».
- [x] 8.3 `PreguntaDeLaTranscripcion`: sin `puntuacion`, omitir el puntaje y la operación.
- [x] 8.4 Quitar «Nota parcial» de `PuntuacionGlobal`. `useVeredicto` solo para `finalizada`.
- [x] 8.5 `TablaDeEntrevistas`: quitar el bloque `puntuacion_parcial`; fuera de `finalizada`, «—».
- [x] 8.6 Ajustar `historial.test.ts` y `reporte.test.ts`.

## 9. Documentación y verificación

- [x] 9.1 Actualizar `CLAUDE.md`:
  - «Two ways an interview becomes ABANDONADA» pasa a límite total y tres estados de cierre;
  - «The grade is not published…» y «An interview's grade…»: sin nota parcial, y `/resultados/` en modo `sin_nota`;
  - el párrafo del redactor: sin modo parcial;
  - el párrafo del sidebar: «Continuar · n/total · m min».
- [x] 9.2 En `DESIGN.md`, si describe la cabecera del chat o el cronómetro, cambiar a la cuenta regresiva.
- [x] 9.3 `grep` de restos en `backend/` y `frontend/src`: `puntuacion_parcial`, `MINUTOS_PARA_ABANDONO`, `marcar_abandonadas`, `con_evaluacion`, `Cronometro`, `Nota parcial`, `EntrevistaEnCurso`. No debe quedar ninguno.
- [x] 9.4 Ejecutar `pnpm exec tsc --noEmit`, `pnpm test` (con `estilos.test.ts`), `pnpm run lint` (deben quedar 5 advertencias) y `pnpm run build`.
- [x] 9.5 Ejecutar `openspec validate tiempo-limite-de-entrevista`.

## 10. Cierre (lo hace Jorge)

- [ ] 10.1 `python manage.py migrate` (aplica 0010).
- [ ] 10.2 Pruebas manuales, con `MINUTOS_DE_ENTREVISTA` reducido localmente:
  - vencer sin responder → Abandonada;
  - vencer con 2 respuestas → Tiempo agotado, con retroalimentación sin puntajes;
  - con la pestaña abierta tras vencer, responder → al reporte;
  - recargar → el reloj continúa;
  - avisos de 5 y 1 minutos con el lector de pantalla;
  - sidebar «Continuar · m min»;
  - historial con «—».
- [ ] 10.3 En la tesis, actualizar las reglas de negocio y los estados: límite total de 30 minutos, «Tiempo agotado» y solo las finalizadas con nota.
- [ ] 10.4 No hacer commit; lo hace Jorge.
