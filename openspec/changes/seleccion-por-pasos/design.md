## Context

Hoy cada `Tecnologia` pertenece a un `Puesto` (`Tecnologia.puesto`, con `CheckConstraint tecnologia_activa_con_puesto`), y `Entrevista.tecnologia` es una sola FK nullable. Full Stack tiene 4 filas que son combinaciones fijas: `full_stack_react_node`, `full_stack_react_python`, `full_stack_angular_java` y `full_stack_vue_php`.

La capa de IA solo ve el **nombre** de la tecnología como texto (`ContextoDeEntrevista.tecnologia`, que arma `Entrevista.tecnologia_nombre`). Lo usan `entrevistador._linea_tecnologia`, `Enfoque.instruccion` y `evaluador.sistema`.

El frontend de selección se apoya en `lib/busquedaDePuestos.ts`, `useBusquedaDePuestos`, `BuscadorDePuestos`, `SugerenciasDePuestos` y `ResultadosDePuestos`, más `EleccionDePuesto` para la tecnología y el nivel. El backend calcula `mas_practicados` y expone `Puesto.palabras_clave`, que solo usa el buscador. Ver proposal.md para la motivación.

## Goals / Non-Goals

**Goals:**
- Un flujo de 3 pasos cuyo estado sea **lógica pura testeable**: un reducer en TypeScript con Vitest.
- Full Stack con dos tecnologías, **guiado por el catálogo** (`capa`), sin ningún `if puesto == "full_stack"` ni en el backend ni en el frontend.
- No tocar el contrato con la IA de la entrevista.
- Eliminar todo el código que ya no tiene uso, sin dejar campos huérfanos.

**Non-Goals:**
- Más de dos capas, o capas en otros puestos (el modelo lo permitiría, pero no se carga ningún dato así).
- Cambiar el plan de 5 preguntas, las áreas, la rúbrica o las estadísticas: ninguna agrupa por tecnología.
- Tests de componentes (sigue sin haber jsdom).
- Añadir C# .NET al backend de Full Stack. Es un supuesto: las combinaciones actuales tampoco lo incluyen.

## Decisions

### D1. `capa` en `Tecnologia` en vez de un modelo nuevo
`Tecnologia.capa = CharField(choices=["", "frontend", "backend"], blank=True, default="")`. Un puesto "tiene capas" si alguna de sus tecnologías activas tiene `capa != ""`.
- **Alternativa descartada:** M2M entre `Puesto` y `Tecnologia` para reutilizar `frontend_react` y `backend_node`. Rompe la regla documentada de que cada tecnología pertenece a un puesto ("el puesto cambia lo que se pregunta sobre ella") y la restricción que la sostiene.
- **Alternativa descartada:** una tabla `CapaDeTecnologia`. Es sobreingeniería para dos valores fijos.

### D2. `Entrevista.segunda_tecnologia`, no una lista
Se añade una FK nullable con PROTECT, `related_name="entrevistas_como_segunda"`. `tecnologia` guarda la de frontend y `segunda_tecnologia` la de backend.
- `tecnologia_nombre` devuelve `" + ".join(...)` sobre las presentes, que es exactamente el texto que la IA ya recibía con las combinaciones fijas. Por eso **no cambia ningún prompt ni el `ContextoDeEntrevista`**.
- **Alternativa descartada:** M2M `tecnologias`. Pierde el orden frontend/backend, complica el `select_related` del historial (que hoy es una sola consulta) y permite N tecnologías, cuando el negocio pide como máximo dos.

### D3. Validación en `IniciarEntrevistaSerializer.validate`
Se añade `segunda_tecnologia = SlugRelatedField(..., required=False, allow_null=True)`. Las reglas, en orden y todas con 400:
1. cada tecnología enviada pertenece al puesto;
2. si el puesto tiene capas, `tecnologia.capa == "frontend"` y `segunda_tecnologia.capa == "backend"`, y la segunda es obligatoria;
3. si el puesto no tiene capas, `segunda_tecnologia` debe ser nula.

Los mensajes nombran lo que falta ("Falta la tecnología de backend de Desarrollador Full Stack."). `services.iniciar()` recibe `segunda_tecnologia=None` como keyword.

### D4. Datos: filas nuevas de Full Stack y combinaciones inactivas
`datos.py` define las 7 filas nuevas con `capa`. `DatosTecnologia` gana `capa` y `DatosPuesto` pierde `palabras_clave`.
- Las 4 combinaciones salen de `datos.py`. Como `cargar_catalogos` nunca borra, quedan en la base tal como las deje la migración: inactivas y con su puesto, lo que la restricción permite.
- La migración `catalogos/0011` crea las 7 filas, desactiva las 4 y copia literalmente los valores de `datos.py`. `test_cargar_catalogos_coincide_con_la_migracion` sigue siendo el guardián: su snapshot pasa a incluir `capa` y a excluir `palabras_clave`.

### D5. Orden de las migraciones
1. `catalogos/0010_capa_y_sin_palabras_clave`: `AddField capa` y `RemoveField palabras_clave`. Solo esquema; al revertirse, `palabras_clave` vuelve vacía (`default=list`). Esa pérdida de los sinónimos se acepta porque el dato es `datos.py`, y se documenta en la migración.
2. `catalogos/0011_full_stack_por_capas`: el `RunPython` de ida y vuelta (crear y activar contra desactivar y borrar las 7 filas nuevas). Va en una migración aparte del esquema, como en 0006/0007.
3. `entrevistas/0008_segunda_tecnologia`: depende de `catalogos/0011`. No rellena datos.

Ninguna borra filas de entrevistas ni de tecnologías antiguas. Antes de aplicarlas, se hace un respaldo de la base local con `pg_dump` en el scratchpad.

### D6. Convocatoria: `tecnologias: list[str]`
- **Capa de IA:**
  - `PerfilDetectado.tecnologia: str | None` pasa a `tecnologias: tuple[str, ...]`.
  - `OpcionDeTecnologia` gana `capa`.
  - `sistema()` lista las opciones con su capa, y la regla pasa a decir "lista de códigos de ese puesto, a lo sumo uno por capa".
  - `esquema()` cambia a `{"tecnologias": {"type": "array", "items": {"type": "string"}}}`.
  - `parsear_perfil` filtra los códigos que pertenecen al puesto, se queda con el primero de cada capa y corta en 2.
- **Fake:** `FakeProveedorIA.analizar_convocatoria` busca por capa.
- **Lectura de perfiles guardados:** `ConvocatoriaSerializer.get_perfil` normaliza los perfiles en JSON del formato anterior (`"tecnologia": "x"` pasa a `["x"]`) y añade `tecnologias_nombres`. No hace falta migración de datos porque el JSON se normaliza al leerse.
- **Uso del perfil:** `Entrevista.convocatoria` solo aporta `requisitos`, así que la entrevista no depende del formato.

### D7. Estado de la pantalla: reducer puro
`features/seleccion/seleccion.ts` exporta:
- el tipo `Seleccion = { puesto: string; tecnologias: Record<Capa, string>; nivel: string; abierto: Paso | null }`, con `Capa = '' | 'frontend' | 'backend'`;
- la función `reducir(estado, accion, catalogo)` con las acciones `elegirPuesto`, `elegirTecnologia {capa, codigo}`, `elegirNivel`, `editar {paso}` y `aplicar {puesto, tecnologias, nivel}`;
- y `capasDe(puesto)`, `tecnologiaCompleta()`, `pasoPendiente()`, `estaCompleta()` y `nombreDeTecnologias()`.

Al elegir, el reducer pone `abierto = pasoPendiente()`. `aplicar` ignora los códigos inactivos o ajenos al puesto. La página usa `useReducer`; los componentes son presentacionales.
- **Por qué:** la lógica de avance, edición y descarte es lo más propenso a errores y es lo único que se puede probar sin DOM. Además, reemplaza a los tests de búsqueda que se eliminan, así que `pnpm test` sigue cubriendo algo real.

### D8. Componentes
- `PasoDeSeleccion` (genérico): sus props son `numero`, `titulo`, `estado: 'abierto' | 'plegado' | 'bloqueado'`, `resumen` y `onEditar`.
  - Es un `section` con `aria-labelledby`.
  - Plegado, muestra ✓ con el resumen y un botón "Editar <título corto>".
  - Bloqueado, muestra el título atenuado con `aria-disabled` en el encabezado, sin controles.
  - Al pasar a `abierto` enfoca el primer control, con una ref al contenedor y `querySelector('button')` en un `useEffect` que depende del estado: sincroniza con el DOM, que es el uso legítimo de un efecto.
- `TarjetaPuesto`: es `OpcionPuesto` sin `TextoResaltado`, que recibe `puesto` en lugar de `ResultadoDePuesto`.
- `EleccionDeTecnologia`: un `fieldset` por capa, con `legend` "Frontend" o "Backend"; sin capas, un solo `fieldset` sin título.
- `EleccionDeNivel`: es la mitad del `EleccionDePuesto` actual. El archivo `EleccionDePuesto` se elimina.
- `RepetirConfiguracion`, `ConvocatoriaModal` y `BarraDeResumen` solo cambian sus datos de tecnología (nombre compuesto o lista).

### D9. Qué se elimina y por qué es seguro
- Todo lo que importan solo el buscador o la librería de búsqueda. `nombreCorto` solo lo usaban los atajos y las sugerencias; `TextoResaltado` solo lo usaban la búsqueda y `OpcionPuesto`.
- `?q=` deja de leerse. Un enlace viejo con `?q=` simplemente se ignora.
- `selectors.mas_practicados` y `MAXIMO_MAS_PRACTICADOS`: su único consumidor es `PuestosView`.
- La carpeta `openspec/changes/sugerencias-bajo-el-buscador/` nunca se archivó y su código se elimina aquí.
- Cada eliminación se verifica con `grep` (que no queden referencias), `tsc`, `lint` y el build.

## Risks / Trade-offs

- [Revertir 0010 pierde `palabras_clave`] → el dato vive en `datos.py` y ya no se usa. Se documenta en la migración en lugar de fingir que la reversión es perfecta.
- [Las entrevistas antiguas de Full Stack tienen una combinación y no dos capas] → se muestran con su nombre de siempre. "Repetir última" pide la tecnología de nuevo porque la combinación está inactiva, y eso ya es el comportamiento documentado para tecnologías inactivas.
- [Cambia el formato del perfil de convocatoria] → se normaliza al leerse. La caché por hash no se invalida, porque el perfil anterior sigue sirviendo.
- [El paso bloqueado puede leerse como "roto"] → muestra un texto que explica qué falta ("Elige primero el puesto").
- [Sin tests de DOM] → el reducer está cubierto en Vitest, y el foco, el teclado y el móvil quedan en una prueba manual que esta vez debe **ejecutarse** de verdad antes de marcarla.

## Migration Plan

1. Respaldo de la base local con `pg_dump -Fc` en el scratchpad.
2. `python manage.py migrate`, y comprobar que las 14 entrevistas conservan `tecnologia_nombre`.
3. Prueba de reversión: `migrate entrevistas 0007` y `migrate catalogos 0009`, y luego volver a aplicar.
4. Desplegar el backend y el frontend juntos. El frontend nuevo espera `capa` y el antiguo espera `mas_practicados`, así que no son compatibles por separado.
5. Rollback: revertir las migraciones (paso 3) y el despliegue anterior.
