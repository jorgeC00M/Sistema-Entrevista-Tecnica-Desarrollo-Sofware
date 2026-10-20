## 1. Capa de IA (sin Django)

- [x] 1.1 `integrations/ia/prompts/schemas.py`:
  - `Nivel` → `PRACTICANTE`/`JUNIOR` con sus etiquetas;
  - `Puesto` + `MOVIL`, `ESCRITORIO`, `QA`;
  - `AreaTecnica` + `DESARROLLO_MOVIL`, `DESARROLLO_ESCRITORIO`;
  - eliminar el enum `Tecnologia` y pasar `ContextoDeEntrevista.tecnologia` a `str | None`;
  - `Enfoque`, `PasoDelPlan` y el `PLAN_POR_PUESTO` de la tabla de design.md D6;
  - `paso_de_la_pregunta()`.

  Verificar en `tests/integration/test_contrato_ia.py` que cada puesto tiene exactamente 5 pasos con los enfoques en orden y la tabla de áreas de D6.
- [x] 1.2 `entrevistador.py`: enfoque + área + tecnología por nombre en `sistema()` y en `sistema_de_calentamiento()`. `evaluador.py`: tecnología por nombre. Verificar en `test_prompts.py`:
  - el prompt de la pregunta 2 de Frontend + "Angular" contiene "Angular";
  - sin tecnología, se omite la línea;
  - el evaluador sigue sin historial.
- [x] 1.3 Ajustar `revisor_cv.py` (si algo depende del enum `Tecnologia`), `fake.py` y `consistencia/casos.json` (niveles `practicante`/`junior` y tecnología por nombre). Verificar con `python manage.py test tests.integration` en verde.

## 2. Catálogo y migraciones

- [x] 2.1 Modelos: `Puesto.icono` y `Puesto.palabras_clave`; `Tecnologia.puesto` (FK PROTECT, nullable). Migración `0006`. Verificar con `makemigrations --check` tras generarla.
- [x] 2.2 Crear `apps/catalogos/datos.py` con los 6 puestos, sus tecnologías y los 2 niveles, tomados del prototipo:
  - nombres, descripciones y palabras clave;
  - iconos `web`, `datos`, `marca`/capas, `movil`, `escritorio`, `pruebas`, según `Icono.tsx`.
- [x] 2.3 Migración de datos `0007` (reversible), con los datos copiados en su cuerpo:
  - puestos y tecnologías;
  - desactivar las tecnologías antiguas;
  - renombrar `basico` → `practicante` e `intermedio` → `junior` en la misma fila;
  - áreas nuevas.

  Verificar contra una copia de la base local que las 14 entrevistas conservan puesto, nivel (ahora practicante o junior), tecnología e intercambios, y que `migrate catalogos 0005` revierte.
- [x] 2.4 Migración `0008`: `CheckConstraint` "tecnología activa ⇒ con puesto". Verificar con un test que crear una tecnología activa sin puesto falla.
- [x] 2.5 Comando `cargar_catalogos` (con `update_or_create` por código, sin borrar nada). Verificar con un test que, después de las migraciones, ejecutarlo no cambia ninguna fila y que una segunda ejecución tampoco.
- [x] 2.6 Ajustar los tests de sincronía de `apps/catalogos/tests/test_catalogos.py`:
  - códigos y nombres de `Puesto`, `Nivel` y `AreaTecnica`;
  - eliminar la parte de `Tecnologia`;
  - que toda tecnología activa tenga puesto.

  Verificar con `python manage.py test apps.catalogos`.

## 3. API

- [x] 3.1 `GET /api/catalogos/puestos/` (autenticado): `PuestoConTecnologiasSerializer` con codigo, nombre, descripcion, icono, palabras_clave, areas y tecnologias (codigo, nombre), más `mas_buscados`, calculado en `selectors.py` según design.md D7. Añadir `icono` también al `PuestoSerializer` del catálogo público. Verificar con tests:
  - 6 puestos con tecnologías ordenadas;
  - 401 sin sesión;
  - "lo más practicado" con y sin entrevistas;
  - consultas acotadas (`assertNumQueries`);
  - cabecera `Cache-Control: private, max-age=300`.
- [x] 3.2 `IniciarEntrevistaSerializer`: `tecnologia` obligatoria y `validate()` de pertenencia al puesto. `Entrevista.tecnologia_enum` → `tecnologia_nombre`, y `services._contexto` usa el nombre. Verificar con tests (IA simulada):
  - 201 con una combinación válida;
  - 400 con una tecnología de otro puesto, sin crear la entrevista y sin llamar a la IA;
  - 400 sin tecnología.
- [x] 3.3 `GET /api/entrevistas/ultima-configuracion/` en `selectors.ultima_configuracion(usuario)`: 200 con codigo y nombre de puesto, tecnología (nula si está inactiva o falta) y nivel, o 204. Verificar con tests:
  - 204 para un usuario nuevo;
  - devuelve la más reciente;
  - ignora las entrevistas de otros usuarios;
  - una tecnología antigua inactiva se devuelve como `null`.
- [x] 3.4 Reemplazar `"basico"`/`"intermedio"` en los tests existentes (unos 45 usos) y añadir la tecnología en cada inicio de entrevista de los tests. Ejecutar `python manage.py test` completo en verde y `makemigrations --check`.

## 4. Frontend

- [x] 4.1 Tipos en `src/types/catalogos.ts`, sin `any`: `PuestoConTecnologias`, `TecnologiaDePuesto`, `CatalogoDePuestos` (con `mas_buscados`), `UltimaConfiguracion`, y `icono` en `Puesto`. Funciones en `api/catalogos.ts` y `api/entrevistas.ts`, donde el 204 se traduce a `null`. Verificar con `pnpm exec tsc --noEmit`.
- [x] 4.2a `lib/busquedaDePuestos.ts` (design.md D10), funciones puras sin React:
  - `normalizar` con mapa de posiciones;
  - `crearIndice` con pesos;
  - `buscar` (AND, ranking por relevancia, atajos);
  - `rangosResaltado` con fusión de rangos solapados.

  Verificar con `pnpm exec tsc --noEmit`.
- [x] 4.2b Agregar Vitest como devDependency, el script `pnpm test` y `src/lib/busquedaDePuestos.test.ts`. Casos:
  - "movil" → Móvil, con el rango sobre "Móvil";
  - "c#" → Backend y Escritorio;
  - "react native" → solo Móvil;
  - "react" → Frontend antes que Full Stack;
  - atajos solo a partir de 2 caracteres y como máximo 6;
  - fusión de rangos solapados;
  - letras compuestas ("ñ", "á") bien alineadas.

  Verificar con `pnpm test` en verde y que el build no incluye Vitest.
- [ ] 4.2c `features/seleccion/hooks/useBusquedaDePuestos.ts` (`useDeferredValue` + `useMemo`) y `components/ui/TextoResaltado.tsx` (`<mark>` como elementos de React, sin `innerHTML`); anuncio en `aria-live` con 400 ms de espera; sincronización con `?q=` mediante `replace`. Verificar con `tsc`, y en el navegador que escribir rápido no se traba y que recargar conserva la búsqueda.
- [x] 4.3 Iconos `movil`, `escritorio` y `pruebas` en `components/ui/Icono.tsx`; la landing usa `puesto.icono`; eliminar `lib/iconosPorPuesto.ts`. Verificar que no queda ningún import del archivo eliminado.
- [x] 4.4 Componentes nuevos de design.md D9 y reescritura de `SeleccionPuestoPage.tsx`:
  - estados de carga y error en las dos peticiones;
  - preselección por `?puesto=&nivel=`;
  - cambiar de puesto borra la tecnología;
  - la barra fija muestra "Cubre: <áreas>";
  - el enlace de convocatoria queda deshabilitado con "Próximamente";
  - atajos "/" y Esc.

  Verificar con `tsc`, lint y build.
- [x] 4.5 Eliminar `TarjetaPuesto.tsx`, `SelectorNivel.tsx`, `PanelDeSesion.tsx` y los tipos y llamadas que queden sin uso. Verificar con un grep sin referencias y con el build en verde.
- [ ] 4.6 Accesibilidad y responsive:
  - `aria-pressed` en puestos, tecnologías y experiencia;
  - `aria-live` en los resultados;
  - foco visible;
  - recorrido completo con teclado;
  - sin scroll horizontal a 360 px.

  Verificar con `impeccable detect` en escritorio y a 390 px, y con la revisión manual del usuario a 360 px.

## 5. Verificación y documentación

- [x] 5.1 `python manage.py test`, `pnpm exec tsc --noEmit`, `pnpm run lint` (sin subir de 5 avisos) y `pnpm run build`, todo en verde.
- [ ] 5.2 Recorrido con `IA_PROVEEDOR=fake`:
  - buscar "movil", elegir Flutter y "Sin experiencia", y comenzar;
  - la entrevista arranca y su pregunta 2 menciona Flutter en el prompt (log del proveedor falso);
  - "Repetir configuración" rellena lo mismo;
  - una entrevista antigua sigue abriendo su reporte.

  La revisión visual queda a cargo del usuario.
- [x] 5.3 `CLAUDE.md`:
  - catálogo con tecnologías por puesto, `cargar_catalogos` y la equivalencia de niveles;
  - plan con enfoques (tabla);
  - rutas nuevas;
  - eliminación del enum `Tecnologia`;
  - el frontend ya tiene `pnpm test` (Vitest) para la lógica pura; se corrige la frase "No frontend test runner is configured".

  Verificar releyendo esos apartados.
