## 1. Backend: medición

- [x] 1.1 En `integrations/documentos/ats.py`:
  - `Campo.incompleto: bool = False`;
  - `_INCOMPLETOS_POR_HALLAZGO` (`formatos_de_fecha_mezclados` → Experiencia; `dos_columnas` → Experiencia, Educación y Habilidades; cada uno con su nota). `habilidades_en_graficos` se descartó con el usuario: solo salta con las habilidades sin detectar;
  - `_marcar_incompletos`, al final de `analizar()`;
  - `CAMPOS_CLAVE`;
  - `estado_del_cv(campos)`, que acepta objetos o dicts;
  - `VERSION_DE_REGLAS = 8`.
- [x] 1.2 En `tests/integration/test_ats.py`: cada regla de incompleto (documentos construidos en código), que un dato no detectado nunca queda incompleto, y `estado_del_cv` en sus tres estados (sin correo, sin ubicación, completo, campos sin `incompleto`). Verificar con `manage.py test tests.integration.test_ats`.

## 2. Backend: API e historial

- [x] 2.1 En `apps/curriculums/models.py`, `AnalisisATS.veredicto` usa `estado_del_cv(self.campos)` y el docstring se actualiza. En `serializers.py`, `CampoSerializer.incompleto = BooleanField(default=False)`.
- [x] 2.2 En `apps/curriculums/tests/test_curriculums.py`:
  - `HistorialTest` / `VeredictoTest` con los valores nuevos sobre las fixtures (una columna, dos columnas, escaneado);
  - un análisis guardado sin `incompleto`, que se publica y calcula sin error;
  - el campo `incompleto` en la respuesta.

  Verificar con la suite completa del backend.

## 3. Frontend: lógica

- [x] 3.1 En `types/curriculum.ts`, `CampoDelEspejo.incompleto?: boolean` y los valores nuevos de `NivelDeLegibilidad`. En `hallazgos.ts`:
  - `CAMPOS_CLAVE`;
  - `estadoDelCampo`;
  - `veredictoDeLegibilidad` sobre `analisis.campos`, con la regla nueva;
  - `VEREDICTOS` con las 3 claves nuevas.

  En `hallazgos.test.ts`, los mismos casos que el backend, más `estadoDelCampo` y `CAMPOS_CLAVE`. Verificar con `pnpm test`.

## 4. Frontend: pantallas

- [x] 4.1 `VeredictoDeLegibilidad.tsx`:
  - la dona de 3 tramos, con la leyenda de 3 filas y la frase `sr-only`;
  - a la derecha, la etiqueta con icono, el título, la regla y «Formato» con cada error como `Boton variante="texto"` → `onIrA(codigo)`;
  - «Ver el plan de mejora» → `onVerTodo`;
  - las props nuevas.
- [x] 4.2 `EspejoDelATS.tsx`: el estado incompleto (punto ámbar, icono `mejora`, la nota y `sr-only` «, incompleto»).
- [x] 4.3 `ResumenDelAnalisis.tsx` en una columna (línea de match, banner, espejo, tecnologías, práctica), sin `LoQueDebesHacer` ni `ConservaloAlCorregir`, pasando `onIrA` / `onVerTodo` al banner. En `ResultadoDelAnalisis.tsx`, «Plan de Mejora» abre con `ConservaloAlCorregir` titulado «Lo que ya funciona». Borrar `LoQueDebesHacer.tsx`. Verificar con tsc, lint y un `grep` de `LoQueDebesHacer`, `con_perdidas`, `'completo'` e `'ilegible'` en `frontend/src`.

## 5. Specs, documentación y verificación

- [x] 5.1 Hacer que remitan a este cambio:
  - `veredicto-con-dona` (dos estados, regla por gravedad);
  - `diferenciar-revision-y-comparacion-de-cv` (los 3 veredictos viejos);
  - `tipo-de-analisis-e-historial-en-tabla` («Estado del CV»);
  - `resumen-en-dos-columnas-y-ejemplos` (las dos columnas, «Lo que debes hacer»);
  - `pestanas-del-resultado-por-tipo` (el Resumen y «Lo que debes hacer»).

  Verificar con `openspec validate` de cada uno.
- [x] 5.2 En `CLAUDE.md`:
  - el estado por dato y `CAMPOS_CLAVE`;
  - `estado_del_cv` / `veredictoDeLegibilidad`;
  - `VERSION_DE_REGLAS` 8;
  - el Resumen en una columna;
  - «Lo que ya funciona»;
  - el historial;
  - la lista de reaperturas.
- [x] 5.3 Verificación completa:
  - la suite del backend;
  - `pnpm exec tsc --noEmit`;
  - `pnpm test`;
  - `pnpm run lint`, que debe quedar en 5 advertencias;
  - `pnpm run build`;
  - `openspec validate estado-del-cv-por-datos-clave`.

## 6. Cierre (lo hace el usuario)

- [ ] 6.1 Pruebas manuales:
  - un CV a dos columnas da «Legible con pérdidas», con incompletos en la dona y el espejo;
  - un CV sin correo da «Pérdidas importantes»;
  - un CV limpio da «Legible»;
  - los errores de «Formato» abren su corrección;
  - «Lo que ya funciona» aparece en Plan de Mejora;
  - el historial muestra los nombres nuevos;
  - un análisis viejo se ve con dos estados hasta que se vuelve a subir.
- [ ] 6.2 No hacer commit. El usuario lo hará tras revisar.
