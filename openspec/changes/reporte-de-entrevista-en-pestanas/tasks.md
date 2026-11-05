## 1. Capa de IA (sin Django)

- [x] 1.1 Crear `integrations/ia/prompts/guardas.py` con `_CONCLUYE_APTITUD`, el patrón de notas (`%`, `/100`, «sobre 100», «N puntos») y el comparador sin tildes. Hacer que `revisor_cv.py` lo importe. Verificar que `LecturaTest` sigue en verde.
- [x] 1.2 Crear `integrations/ia/prompts/veredicto.py`:
  - `RespuestaEvaluada`, `EntradaDeVeredicto`, `sistema()`, `usuario(entrada)`, `ESQUEMA` y `parsear_veredicto()` (vacío, más de 600 caracteres, nota o porcentaje, aptitud → `RespuestaIAInvalida`);
  - la entrada no lleva el texto de las respuestas.
- [x] 1.3 En `base.py`:
  - agregar `Protocol RedactorDeVeredicto` (`redactar_veredicto`);
  - implementarlo en `ProveedorIAporJSON` con `_pedir_json`;
  - en `fake.py`, un texto determinista neutro;
  - en `cadena.py`, intentar solo con los eslabones capaces;
  - en `factory.py`, `get_redactor_de_veredicto()`, sin filtro de datos personales.
- [x] 1.4 Tests en `tests/integration/` del parser (cada guarda, incluido que «aptitudes» sobrevive), del fake y de la cadena. Agregar la copia del prompt en `tests/fixtures/prompts/` y su caso en `test_prompts_estables.py`.

## 2. Backend de entrevistas

- [x] 2.1 Agregar `Entrevista.veredicto_ia` (`JSONField(null=True, blank=True)`) con la migración `0009_veredicto_ia`.
- [x] 2.2 En `services.py`:
  - `redactar_veredicto(entrevista, proveedor)` arma la entrada desde las evaluaciones guardadas, llama al redactor, guarda `{"estado","texto","version"}` y convierte `ErrorProveedorIA` en `no_disponible`;
  - `responder()` la llama **después** del `transaction.atomic()` solo si la entrevista quedó `FINALIZADA`;
  - `pedir_veredicto(usuario, pk)`: 404, 409 si está en progreso, y devuelve el `ok` guardado sin llamar a la IA.
- [x] 2.3 En `views.py` y `urls.py`, `POST /api/entrevistas/<id>/veredicto/` con el throttle `veredicto` en `base.py`. En `ResultadosView`, la clave `veredicto` (`null` mientras la entrevista está `EN_PROGRESO`).
- [x] 2.4 Tests:
  - la última respuesta redacta una sola vez y las anteriores ninguna;
  - con el redactor fallando, la respuesta es 200, la entrevista queda `FINALIZADA` con su nota y el veredicto `no_disponible`;
  - el endpoint da 404 si es ajena, 409 en progreso, y con uno `ok` no llama a la IA (espía);
  - una abandonada recibe su veredicto;
  - `/resultados/` oculta el veredicto en progreso;
  - el test del espía de `resumen_de` sigue sin IA.
- [x] 2.5 Ejecutar la suite completa del backend (`manage.py test --noinput`).

## 3. Frontend

- [x] 3.1 Tipos y API:
  - `Veredicto` en `types/entrevista.ts` y `veredicto` en la respuesta de resultados;
  - `pedirVeredicto(id)` en `api/entrevistas.ts`;
  - `responder()` con `timeoutMs: 90_000`.
- [x] 3.2 Reglas puras en `features/resultados/reporte.ts`: `fortalezasYDebilidades`, `temasARepasar`, `consejoDeComunicacion`, `practicaRecomendada` y `veredictoPorReglas`, con su `reporte.test.ts` (empates, abandonada con 1 respuesta, «Sólido» en Junior y en Senior). En `rubricaPorDefecto.ts`, agregar `NOMBRE_EN_PANTALLA`.
- [x] 3.3 El hook `useVeredicto`: pedido automático una vez, `reintentar` y anuncio `aria-live`.
- [x] 3.4 Componentes:
  - `PuntuacionGlobal`, `VeredictoDeLaIA` (rótulo «Generado por IA» y nota al pie solo con `ok`), `DesgloseDeLaEvaluacion`, `FortalezasYDebilidades`, `PlanDeMejora` y `PreguntaDeLaTranscripcion` (`<details>` con burbujas y «Análisis IA», reutilizando `DesgloseDeNota` y `ListaRetroalimentacion`);
  - íconos con `Icono`.
- [x] 3.5 `ResultadosPage`:
  - el encabezado con «Ver historial»;
  - `Pestanas` («Resumen», «Plan de mejora», «Transcripción», `repartir`);
  - las filas `lg:grid-cols-[1fr_2fr]`, `lg:grid-cols-2` y `lg:grid-cols-3`, con `gap-6`.
- [x] 3.6 Eliminar `ResumenFinal.tsx` y `PanelCualitativo.tsx` y todo lo que quede sin uso. Comprobar con `grep` que no queden importaciones.
- [x] 3.7 En el chat, el texto de espera de la última pregunta: «Evaluando tu última respuesta y escribiendo tu veredicto…».
- [x] 3.8 Ejecutar `pnpm exec tsc --noEmit`, `pnpm test` (con `estilos.test.ts`), `pnpm run lint` (deben quedar 5 advertencias) y `pnpm run build`.

## 4. Documentación

- [x] 4.1 En `CLAUDE.md`:
  - el reporte en pestañas;
  - el redactor del veredicto como rol separado del evaluador (dónde se llama, sus guardas, el endpoint y que son 10 llamadas);
  - `guardas.py`;
  - `NOMBRE_EN_PANTALLA`;
  - la migración `0009`.
- [x] 4.2 Ejecutar `openspec validate reporte-de-entrevista-en-pestanas`.

## 5. Cierre (lo hace el usuario)

- [ ] 5.1 Pruebas manuales a 1280, 800 y 375 px:
  - una entrevista completa con el proveedor real: la espera del último «Enviar» y el veredicto;
  - una con la IA caída: se cierra igual y aparecen las reglas con «Reintentar»;
  - una abandonada;
  - una anterior a este cambio;
  - las tres pestañas con el teclado.
- [ ] 5.2 Actualizar el perfil de tesis: el redactor del veredicto y las 10 llamadas.
- [ ] 5.3 No hacer commit; lo hace el usuario.
