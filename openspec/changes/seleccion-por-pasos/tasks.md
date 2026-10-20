## 1. Catálogo: capas y limpieza (backend)

- [x] 1.1 Respaldo de la base local con `pg_dump -Fc` en el scratchpad. Se verifica que el archivo existe y que su tamaño no es cero.
- [x] 1.2 Cambios en `apps/catalogos`:
  - en `models.py`, `Tecnologia.capa` (D1) y quitar `Puesto.palabras_clave`;
  - en `datos.py`, `DatosTecnologia.capa`, quitar `palabras_clave`, las 7 tecnologías de Full Stack por capa y quitar las 4 combinaciones (D4).

  Se verifica con `python manage.py makemigrations --check --dry-run`, que debe mostrar solo los cambios esperados.
- [x] 1.3 Migraciones `catalogos/0010_capa_y_sin_palabras_clave` (esquema) y `0011_full_stack_por_capas` (`RunPython` reversible que copia literalmente `datos.py`) (D5). Se verifica con `migrate` en la base local, que las 14 entrevistas conserven `tecnologia_nombre` y la reversión `migrate catalogos 0009` seguida de volver a aplicar.
- [x] 1.4 Quitar `palabras_clave` de `cargar_catalogos` y de `PuestoConTecnologiasSerializer`, y exponer `capa` en `TecnologiaDePuestoSerializer`. Se verifica que `test_cargar_catalogos_coincide_con_la_migracion` pasa con el snapshot actualizado (incluye `capa`, sin `palabras_clave`).
- [x] 1.5 Eliminar `selectors.mas_practicados`, `MAXIMO_MAS_PRACTICADOS` y la clave de `PuestosView`. Ajustar `test_puestos.py`: quitar `MasPracticadosTest`, comprobar que la respuesta no trae `mas_practicados` ni `palabras_clave` y que las tecnologías de Full Stack traen `capa`. Se verifica con `python manage.py test apps.catalogos` en verde y con `grep -r "mas_practicados\|palabras_clave" backend/apps` sin resultados fuera de las migraciones.

## 2. Entrevista con dos tecnologías (backend)

- [x] 2.1 `Entrevista.segunda_tecnologia` y `tecnologia_nombre` compuesto (D2), migración `entrevistas/0008_segunda_tecnologia` y `select_related` en `_con_conteo` y `ultima_configuracion`. Se verifica con `migrate`, su reversión y un test de que `tecnologia_nombre` devuelve "React + Node.js".
- [x] 2.2 En `IniciarEntrevistaSerializer`, añadir `segunda_tecnologia` y las reglas de capa (D3); en `views.py` y `services.iniciar`, pasarla como keyword. Tests en `test_seleccion.py` para estos casos:
  - Full Stack válido → 201 con `tecnologia_display` "React + Node.js";
  - sin backend → 400;
  - capas invertidas → 400;
  - `segunda_tecnologia` en Backend → 400;
  - tecnología de otro puesto → 400.

  Se verifica que ninguno llama a la IA (espía).
- [x] 2.3 Exponer `segunda_tecnologia` en `EntrevistaSerializer` (además de `tecnologia_display` desde `tecnologia_nombre`) y en `ConfiguracionSerializer`, con la segunda tecnología a `null` si está inactiva. Tests de última configuración: una combinación antigua inactiva da `tecnologia` null, y una Full Stack nueva devuelve las dos. Se verifica con `python manage.py test apps.entrevistas` en verde.
- [x] 2.4 Test de prompt: una entrevista Full Stack con React y Node.js genera un prompt de entrevistador que contiene "React + Node.js" (espía sobre `generar_preguntas_iniciales`). Se verifica con el test en verde.

## 3. Convocatoria con lista de tecnologías

- [x] 3.1 En `analista_convocatoria.py` (D6): `OpcionDeTecnologia.capa`, `PerfilDetectado.tecnologias`, `sistema()`, `esquema()` y `parsear_perfil`, que filtra por puesto, toma una por capa y como máximo 2. Ajustar `convocatorias._opciones()` para que pase la `capa`. Se verifica con tests en `tests/integration/test_analista_convocatoria.py`:
  - Full Stack con frontend y backend;
  - dos de la misma capa → se queda la primera;
  - tecnología de otro puesto descartada;
  - puesto sin capas → una sola.
- [x] 3.2 `FakeProveedorIA.analizar_convocatoria` por capa. En `ConvocatoriaSerializer.get_perfil`, normalizar los perfiles del formato anterior y añadir `tecnologias_nombres`. Tests en `test_convocatoria.py`: aviso Full Stack → dos tecnologías; perfil guardado con `"tecnologia"` → `tecnologias` de un elemento. Se verifica con `python manage.py test` completo en verde.

## 4. Frontend: estado y tipos

- [x] 4.1 Tipos y API:
  - en `types/catalogos.ts`, `TecnologiaDePuesto.capa`, quitar `palabras_clave`, `ComboPracticado` y `mas_practicados`, y `PerfilDetectado.tecnologias` + `tecnologias_nombres`;
  - en `types/entrevista.ts`, `segunda_tecnologia` en `Entrevista`, `UltimaConfiguracion` y `DatosIniciarEntrevista`;
  - en `api/entrevistas.ts`, el body con `segunda_tecnologia` cuando la hay.

  Se verifica con `pnpm exec tsc --noEmit`, cuyos errores deben quedar solo en los componentes que se reescriben en 5.x.
- [x] 4.2 Crear `features/seleccion/seleccion.ts` (reducer y funciones puras, D7) y `seleccion.test.ts`, que cubre:
  - elegir puesto abre la tecnología;
  - Full Stack incompleto con solo frontend;
  - completo → `abierto` nulo;
  - editar nivel conserva el resto;
  - cambiar de puesto descarta la tecnología y conserva el nivel;
  - `aplicar` ignora una tecnología inactiva y abre el paso 2;
  - `nombreDeTecnologias` da "React + Node.js".

  Se verifica con `pnpm test` en verde.

## 5. Frontend: pasos y eliminación del buscador

- [x] 5.1 Crear los componentes de D8:
  - `PasoDeSeleccion.tsx` (con foco al abrirse);
  - `TarjetaPuesto.tsx` (renombrar y simplificar `OpcionPuesto`, sin resaltado);
  - `EleccionDeTecnologia.tsx` (un `fieldset` por capa);
  - `EleccionDeNivel.tsx`.

  Se verifica con `tsc` sin errores en esos archivos.
- [x] 5.2 Reescribir `SeleccionPuestoPage.tsx`:
  - `useReducer`, con los 3 pasos y sus resúmenes;
  - `repetir`, `usarConvocatoria` y la preselección por `?puesto=&nivel=` despachan `aplicar`;
  - `comenzar` envía `segunda_tecnologia`;
  - el anuncio en `aria-live` se mantiene;
  - "Repetir última" y el enlace de la convocatoria se mantienen.

  Adaptar también `BarraDeResumen` (nombre compuesto), `RepetirConfiguracion` y `ConvocatoriaModal` (1 o 2 tecnologías). Se verifica con `tsc` sin errores.
- [x] 5.3 Eliminar:
  - `BuscadorDePuestos.tsx`, `SugerenciasDePuestos.tsx`, `ResultadosDePuestos.tsx`, `OpcionPuesto.tsx` y `EleccionDePuesto.tsx`;
  - `hooks/useBusquedaDePuestos.ts`;
  - `lib/busquedaDePuestos.ts` y su `.test.ts`;
  - `components/ui/TextoResaltado.tsx`;
  - y la lectura de `?q=`.

  Se verifica que `grep -rE "busquedaDePuestos|TextoResaltado|nombreCorto|useBusqueda|masPracticados|palabras_clave|ComboPracticado" frontend/src` no da resultados, junto con `tsc`, `pnpm run lint` (sin avisos nuevos en `features/seleccion`), `pnpm test` y `pnpm run build`, todos en verde.

## 6. Limpieza, documentación y prueba manual

- [x] 6.1 Borrar `openspec/changes/sugerencias-bajo-el-buscador/`. En `CLAUDE.md`:
  - reescribir los párrafos del buscador y de "Lo más practicado" por el flujo de pasos;
  - documentar `Tecnologia.capa`, `Entrevista.segunda_tecnologia` y el nombre compuesto;
  - corregir el número de tests;
  - quitar "Próximamente".

  Se verifica con `openspec list`, que ya no debe mostrar el cambio borrado, y con `grep` de "buscador", "Próximamente" y "mas_practicados" en `CLAUDE.md`, que solo debe quedar como historia.
- [ ] 6.2 Prueba manual **ejecutada** con `runserver` + `pnpm run dev`, que cubra:
  - los 3 pasos y la edición con ✎ de cada uno;
  - cambiar de puesto descarta la tecnología;
  - Full Stack: React + Node.js → iniciar la entrevista, y que la cabecera, el historial y los resultados muestren "React + Node.js";
  - "Repetir última" con una entrevista Full Stack antigua pide la tecnología;
  - convocatoria Full Stack → los pasos completos;
  - `?puesto=backend&nivel=senior`;
  - solo teclado;
  - el móvil a 375 px.

  Se verifica anotando el resultado de cada punto. Si no se puede ejecutar, la tarea queda **sin marcar** y se informa.
