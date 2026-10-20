## Context

Estado actual, verificado en el código y en la base local:

- **Catálogo** (`apps/catalogos/models.py`): `Puesto`, `Tecnologia`, `Area` y `Nivel` heredan de `ModeloDeCatalogo` (codigo, nombre, descripcion, orden, activo). Se siembran con las migraciones de datos `0002` y `0004`. `Tecnologia` no tiene puesto: hay 3 combinaciones transversales (`python_django`, `javascript_react`, `java_spring`).
- **Entrevista** (`apps/entrevistas/models.py`): ya tiene `puesto` y `nivel` como FK PROTECT, y `tecnologia` como FK nullable. El área vive en `Intercambio.area`.
- **Datos locales:** 14 entrevistas.
  - Por nivel: 13 `basico`, 1 `intermedio`.
  - Por puesto: 3 `backend`, 11 `full_stack`.
  - Por tecnología: 11 sin tecnología, 2 `java_spring`, 1 `python_django`.
- **Capa de IA** (`integrations/ia/prompts/schemas.py`):
  - los enums `Puesto`, `Tecnologia`, `Nivel` y `AreaTecnica` son el puente por `codigo`;
  - dos tests de `apps/catalogos/tests/test_catalogos.py` obligan a que códigos y nombres coincidan;
  - `PLAN_POR_PUESTO` fija el área de cada pregunta;
  - `entrevistador.py` arma el prompt con puesto, nivel, tecnología (opcional) y "Tema de esta pregunta: <área>".
- **Usos fuera de la selección:**
  - `revisor_cv.py` sugiere un `Puesto` del enum;
  - el reporte y la página de CV enlazan a `/nueva-entrevista?puesto=&nivel=`;
  - la landing (`PuestosDisponibles.tsx`) lista los puestos con `lib/iconosPorPuesto.ts`;
  - `consistencia/casos.json` usa los códigos de nivel y de tecnología.
- **Frontend:**
  - `features/seleccion/` = `SeleccionPuestoPage`, `TarjetaPuesto`, `SelectorNivel` y `PanelDeSesion`;
  - usa `useCatalogos()` (`GET /api/catalogos/`) e `iniciarEntrevista()`;
  - `ControlSegmentado` también lo usa la retroalimentación, así que se queda.

Motivación: proposal.md. Requisitos: `specs/seleccion-de-entrevista` y `specs/plan-de-preguntas`.

## Goals / Non-Goals

**Goals:**
- Que el catálogo de puestos y tecnologías lo controle una única fuente de datos y no la interfaz.
- Migrar sin perder ninguna entrevista, nota, área ni evaluación.
- Mantener intactos el reporte, las estadísticas y la retroalimentación.

**Non-Goals:**
- Pegar la convocatoria: el enlace queda deshabilitado con el texto "Próximamente".
- La sidebar y el layout del prototipo: la app ya tiene su propio shell.
- El modo oscuro del prototipo: el sistema de diseño es claro, según DESIGN.md.
- Los colores e IBM Plex del prototipo: se usan los tokens existentes (Fraunces, Figtree, JetBrains Mono y la paleta vidrio).

## Decisions

### D1. Rutas `/api/...`, no `/api/v1/...`

Todo el proyecto usa `/api/` sin versión. Versionar solo dos rutas dejaría dos convenciones. Las rutas nuevas son:
- `GET /api/catalogos/puestos/`
- `GET /api/entrevistas/ultima-configuracion/`

### D2. Modelos: se amplían los existentes, no se crean nuevos

- `Puesto` agrega `icono` (CharField: el nombre de un icono de `components/ui/Icono.tsx`) y `palabras_clave` (JSONField, una lista de cadenas).
- `Tecnologia` agrega `puesto` (FK PROTECT, nullable) y la restricción `CheckConstraint(activo=False | puesto IS NOT NULL)`: solo las 3 tecnologías antiguas, ya inactivas, quedan sin puesto.
- `Entrevista` no cambia de esquema: ya tiene las tres FK. `tecnologia` sigue siendo nullable en la base, porque 11 entrevistas antiguas no tienen; el serializer de inicio la exige para las nuevas.

### D3. Una fuente de datos, dos caminos de carga

`apps/catalogos/datos.py` define, como tuplas de datos sin dependencia de modelos:
- los 6 puestos (código, nombre, descripción, icono, palabras clave del prototipo y orden);
- sus tecnologías (código `<puesto>_<slug>`, nombre y orden);
- los 2 niveles.

La usan dos caminos:
- **migración `0007`** (RunPython): los tests y cualquier despliegue nuevo nacen con el catálogo, igual que hoy con `0002` y `0004`;
- **comando `cargar_catalogos`:** re-sincroniza con `update_or_create` por `codigo`, sin borrar nada, para corregir textos o añadir tecnologías sin escribir otra migración.

La migración copia los datos en su cuerpo en lugar de importar `datos.py`, porque una migración no debe depender de código que evoluciona.

### D4. Niveles renombrados en el mismo registro

La migración `0007` actualiza la fila `basico` a `codigo=practicante, nombre=Practicante` y la fila `intermedio` a `codigo=junior, nombre=Junior`, con descripciones "Sin experiencia" y "Menos de 2 años". Como las FK apuntan al id, las 14 entrevistas quedan con su nivel sin tocar `entrevistas_entrevista`. Es reversible.

El enum `Nivel` de la capa de IA pasa a `PRACTICANTE`/`JUNIOR`, con etiquetas "Practicante (sin experiencia)" y "Junior (menos de 2 años)", que es lo que lee el modelo.

**Para la tesis:** el Alcance dice "básico e intermedio". Se documenta la equivalencia en `CLAUDE.md` y se recomienda anotarla en el documento.

### D4b. Tres niveles: Junior, Semi-Senior, Senior (decisión posterior del usuario)

Después de implementar D4, el usuario pidió tres niveles: Junior (Inicial), Semi-Senior (Intermedio) y Senior (Avanzado), y eligió actualizar el perfil de tesis, que solo preveía "básico e intermedio" y excluía el avanzado. La migración `0009` renombra en el mismo registro (junior → semi_senior y después practicante → junior, para no chocar con la unicidad) y crea `senior`. Es reversible mientras ninguna entrevista use Senior (FK PROTECT).

### D5. Tecnologías: del enum a un nombre

Hoy `Tecnologia` es un enum de 3 valores sincronizado con el catálogo. Con unas 23 tecnologías por puesto y un comando que las da de alta, mantener un enum gemelo no aporta nada: la IA solo necesita el **nombre** ("React", "Kotlin (Android)").

- `ContextoDeEntrevista.tecnologia` pasa a ser `str | None`, el nombre visible.
- Se elimina el enum `Tecnologia` y su parte de los tests de sincronía.
- `Entrevista.tecnologia_enum` pasa a ser `tecnologia_nombre`.
- Las entrevistas antiguas con `java_spring` siguen funcionando con su nombre.

`Puesto` sí sigue siendo enum: el plan de preguntas depende de él. Se agregan `MOVIL`, `ESCRITORIO` y `QA`, y los tests de sincronía siguen protegiendo códigos y nombres.

### D6. Plan de preguntas: enfoque + área

`PLAN_POR_PUESTO` pasa de un `tuple[AreaTecnica]` a un `tuple[PasoDelPlan]`, donde `PasoDelPlan(enfoque, area)` y `Enfoque ∈ {FUNDAMENTOS, TECNOLOGIA, DATOS, PROFUNDIDAD, CASO_PRACTICO}`. `area_de_la_pregunta()` se mantiene, de modo que el orquestador y el resto no cambian, y se agrega `paso_de_la_pregunta()`.

| Puesto | 1 Fundamentos | 2 Tecnología | 3 Datos | 4 Profundidad | 5 Caso práctico |
|---|---|---|---|---|---|
| Frontend | Programación | Desarrollo Web | Estructuras de Datos | Desarrollo Web | Desarrollo Web |
| Backend | Programación | APIs | Bases de Datos | APIs | APIs |
| Full Stack | Programación | Desarrollo Web | Bases de Datos | APIs | APIs |
| Móvil | Programación | Desarrollo Móvil* | Estructuras de Datos | Desarrollo Móvil | Desarrollo Móvil |
| Escritorio | Programación | Desarrollo de Escritorio* | Estructuras de Datos | Desarrollo de Escritorio | Desarrollo de Escritorio |
| QA | Programación | Pruebas | Bases de Datos | Pruebas | Pruebas |

\* Áreas nuevas en `AreaTecnica` y en el catálogo (migración `0007`).

`POO` y `Control de Versiones` dejan de aparecer en los planes nuevos, pero se conservan en el catálogo: tienen intercambios históricos que las estadísticas siguen mostrando.

Los prompts reemplazan "Tema de esta pregunta: <área>" por "Enfoque: <instrucción del enfoque>" más "Área: <área>". Por ejemplo, para el caso práctico: "plantea un escenario realista del trabajo de <puesto> con <tecnología> y pide cómo lo resolvería". El calentamiento (preguntas 1 y 2, pedidas juntas) lista los dos pasos.

### D7. "Lo más practicado" en el servidor

Se calcula en el selector del catálogo: `Entrevista` agrupada por `(puesto, tecnologia)` activos, ordenada por cantidad, con un máximo de 5, y completada con la primera tecnología de cada puesto en orden. Así el prototipo, que lo tenía escrito a mano, no obliga a escribir puestos en el frontend, y la lista refleja el uso real.

### D8. Validación tecnología–puesto en el serializer

`IniciarEntrevistaSerializer.validate()` comprueba `tecnologia.puesto_id == puesto.id`, antes de que la vista llame al servicio. Por tanto, una combinación inválida no crea la entrevista ni gasta una llamada a la IA.

### D9. Frontend

- `features/seleccion/pages/SeleccionPuestoPage.tsx` se reescribe y orquesta tres hooks:
  - `usePuestos()`: `GET /api/catalogos/puestos/`, con `usePeticion`;
  - `useUltimaConfiguracion()`: maneja el 204 como `null`;
  - el estado local de la elección.
- La búsqueda se detalla en D10: un módulo puro `lib/busquedaDePuestos.ts`, el hook `useBusquedaDePuestos` y el componente `TextoResaltado`.
- Componentes nuevos en `features/seleccion/components/`:
  - `UltimaEntrevista`;
  - `BuscadorDePuestos` (con atajos "/" y Esc);
  - `ResultadosDePuestos` (lista, recuento `aria-live`, atajos, "Lo más practicado" y estado vacío);
  - `OpcionPuesto` (con `aria-pressed`);
  - `EleccionTecnologia`;
  - `EleccionExperiencia`;
  - `BarraDeResumen` (fija, con `Boton` de `components/ui`).
- Se reutilizan `Boton`, `Alerta`, `Spinner`, `Icono`, `Tarjeta`, `EtiquetaMono` y los tokens existentes.
- Se eliminan `TarjetaPuesto`, `SelectorNivel`, `PanelDeSesion` y `lib/iconosPorPuesto.ts`. La landing pasa a usar `puesto.icono`, que también llega en `/api/catalogos/publico/`.
- Las áreas del puesto (objetivo específico 2 del perfil) se muestran en la barra de resumen ("Cubre: …"), para no perder esa visibilidad que hoy da `PanelDeSesion`.
- Iconos nuevos en `Icono.tsx`: `movil`, `escritorio` y `pruebas`, dibujados con el mismo trazo que el resto.

### D10. Buscador: en el cliente, detrás de un contrato

**Dónde se busca.** El catálogo pesa unos 2 KB (6 puestos y ~23 tecnologías). Buscar en el navegador da 0 ms de red, funciona con mala conexión (PRODUCT.md) y no consume CPU del plan gratuito de Render. Pedir al servidor en cada tecla sería más lento y más caro.

La interfaz conoce solo el hook `useBusquedaDePuestos`. Si el catálogo superara unos 500 puestos o 200 KB, se cambia la implementación del hook por `GET /api/catalogos/puestos/?q=` con Postgres (`unaccent` + `pg_trgm`), **sin tocar los componentes**. Ese camino no se construye ahora.

**Sin librería.** Fuse.js o MiniSearch serían una dependencia de producción para 6 filas. La búsqueda tolerante a errores de tipeo queda fuera a propósito: con nombres cortos produce falsos positivos ("java" ≈ "lava").

**Módulo puro `lib/busquedaDePuestos.ts`** (sin React, probado con Vitest):

1. **`normalizar(texto)`:**
   - NFD, se quitan las marcas diacríticas y se pasa a minúsculas;
   - conserva `#`, `+` y `.` dentro de las palabras, para que "c#", "node.js" y "c# .net" funcionen;
   - devuelve además un **mapa de posiciones** normalizado→original, así el resaltado nunca se desalinea con "ñ" o "á".
2. **`crearIndice(puestos)`:**
   - se calcula **una vez por catálogo** (`useMemo` sobre la respuesta de la API), no en cada tecla, a diferencia del prototipo;
   - guarda cada campo normalizado con su peso: nombre 4, tecnología 3, palabra clave 2, descripción 1;
   - indexa aparte las tecnologías, para los atajos.
3. **`buscar(indice, consulta)`:**
   - divide la consulta en palabras (por espacios o comas) y exige que coincidan **todas** (AND);
   - la puntuación de un puesto es la suma, por palabra, del peso del mejor campo donde aparece, más un extra si coincide al inicio de una palabra;
   - ordena por puntuación y, con empate, por el orden del catálogo;
   - devuelve `{ puestos, atajos }`, con los rangos a resaltar en el nombre y la descripción;
   - los atajos son hasta 6 tecnologías, a partir de 2 caracteres, con las coincidencias de prefijo primero.
4. **`rangosResaltado`:** resalta **todas** las palabras de la consulta (el prototipo, solo la primera) y fusiona los rangos que se solapan.

**React:**
- `useBusquedaDePuestos(puestos, consulta)` usa `useDeferredValue` (React 19) y `useMemo`: escribir nunca se traba mientras se recalcula la lista.
- `<TextoResaltado texto rangos />` renderiza los `<mark>` como elementos de React, **nunca `innerHTML`** (el prototipo concatenaba HTML), así que un texto del catálogo con `<` no puede inyectar nada. El color de `mark` sale de un token existente.
- El recuento se anuncia en `aria-live="polite"` **con 400 ms de espera**: la lista visual se actualiza al instante, pero el lector de pantalla no repite el número en cada tecla.
- El input es `type="search"`. "/" lo enfoca, salvo que el foco ya esté en otro campo, y Esc lo borra manteniendo el foco.
- La consulta se sincroniza con `?q=` usando `replace`: recargar o volver atrás conserva la búsqueda sin llenar el historial.

**Sinónimos sin código.** `palabras_clave` vive en la base y se edita con `cargar_catalogos`. Agregar "kotlin multiplataforma" a Móvil no requiere desplegar el frontend.

**Caché.** `GET /api/catalogos/puestos/` responde con `Cache-Control: private, max-age=300`, y `usePeticion` evita repetir la petición al navegar.

## Risks / Trade-offs

- [Renombrar niveles choca con el texto del perfil] → La equivalencia queda documentada; el rigor del evaluador no cambia, porque calibra "para el nivel indicado".
- [Entrevistas EN_PROGRESO durante el despliegue] → Sus preguntas restantes toman el plan nuevo por número; el área se guarda por pregunta, así que el historial queda coherente.
- [La tecnología pasa a ser obligatoria] → Romper la API es aceptable: el único cliente es este frontend, que se despliega junto.
- [La validación de áreas nuevas en `revisor_cv` y `consistencia`] → El enum `Puesto` crece solo; `casos.json` se actualiza a los códigos nuevos.
- [El catálogo crece mucho y la búsqueda en el cliente deja de ser óptima] → El hook es la única frontera: se cambia por la búsqueda en el servidor (D10) con el umbral documentado, sin tocar los componentes.
- [El comando y la migración pueden divergir] → Un test verifica que, después de migrar, ejecutar `cargar_catalogos` no cambia ninguna fila (idempotencia y coincidencia).

## Migration Plan

1. `catalogos/0006`: `Puesto.icono`, `Puesto.palabras_clave` (default `[]`) y `Tecnologia.puesto` (nullable).
2. `catalogos/0007` (datos, reversible):
   - actualizar backend, frontend y full_stack y crear movil, escritorio y qa;
   - crear las tecnologías por puesto;
   - desactivar las 3 tecnologías antiguas;
   - renombrar los niveles;
   - crear las áreas `desarrollo_movil` y `desarrollo_escritorio`.
3. `catalogos/0008`: `CheckConstraint` de tecnología activa con puesto. Va en su propia migración por la lección de `curriculums`: no mezclar datos y restricciones en la misma transacción de Postgres.
4. Revertir: `migrate catalogos 0005` deshace las tres migraciones, y los niveles vuelven a `basico`/`intermedio`.
