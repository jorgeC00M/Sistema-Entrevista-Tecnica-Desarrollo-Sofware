## 1. Blindaje de la frontera con la capa de IA

- [x] 1.1 Crear `backend/apps/curriculums/tests/test_frontera_con_ia.py` con la
  comprobación estática: recorrer los `.py` de `apps/curriculums/` con `ast` y
  fallar si alguno importa `integrations.ia`. Verificar que pasa hoy, y que falla
  al añadir el import a mano en `services.py` (añadirlo, ver el fallo, quitarlo).
- [x] 1.2 Añadir la comprobación en ejecución: parchear
  `integrations.ia.factory.get_proveedor` para que falle si se invoca, y analizar
  un currículum con y sin convocatoria. Cubre el import indirecto que `ast` no
  seguiría. Verificar que pasa, y que falla si se llama al proveedor desde
  `services.analizar()`.
- [x] 1.3 Escribir el docstring del contrato: qué significa que este test falle
  —o el CV se envía sin anonimizar, o llegó la fase de IA— y que en ese caso se
  **reescribe** con un proveedor espía que verifique el enmascarado, no se borra.
  Verificar leyéndolo: alguien que lo encuentre en rojo debe saber qué hacer.

## 2. Historial en el frontend

- [x] 2.1 Añadir `obtenerCurriculum(id)` a `frontend/src/api/curriculums.ts`.
  Verificar con `pnpm exec tsc --noEmit`.
- [x] 2.2 Crear `features/curriculum/components/HistorialDeAnalisis.tsx`: filas
  pulsables con `<button>` —no un `<div>` con `onClick`— mostrando fecha, archivo,
  `parseabilidad` y una `EtiquetaMono` cuando el análisis llevaba convocatoria.
  Verificar con `pnpm run lint` que no aparece ningún aviso de accesibilidad.
- [x] 2.3 No renderizar nada cuando la lista está vacía. Verificar en el navegador
  con un usuario sin análisis: no debe aparecer ninguna tarjeta ni aviso de lista
  vacía en la pantalla donde se va a analizar el primero.
- [x] 2.4 En `CurriculumPage.tsx`: cargar el historial al montar y mostrarlo
  mientras no haya resultado en pantalla. Verificar en el navegador que al entrar
  se ve la lista y al analizar la reemplaza el resultado.
- [x] 2.5 Implementar `onAbrir(id)`: pedir el detalle y colocarlo en el estado
  `resultado`, el mismo que usa un análisis nuevo. Verificar en el navegador que
  abrir un análisis antiguo con convocatoria muestra su mapa de evidencia y no el
  inventario.
- [x] 2.6 Refrescar el historial tras completar un análisis, para que el nuevo
  aparezca al volver. Verificar analizando dos CV distintos y comprobando que los
  dos están en la lista.
- [x] 2.7 Manejar el error de carga del historial sin romper la pantalla: si falla,
  el usuario debe poder analizar igual. Verificar que un fallo del listado no
  impide subir un CV.

## 3. Limpieza del índice redundante

- [x] 3.1 Quitar `db_index=True` de `hash_texto` en
  `backend/apps/curriculums/models.py`, con el comentario del motivo: el índice
  compuesto de la restricción de unicidad sirve la consulta por prefijo.
- [x] 3.2 Escribir a mano la migración `0005`. Verificar con
  `makemigrations --check --dry-run` que reporta "No changes detected", y aplicarla
  y revertirla sobre la base real para confirmar que un `DROP INDEX` no choca con
  los eventos de trigger que obligaron a partir la `0002`.

## 4. Verificación

- [x] 4.1 `python manage.py test` completo sin fallos. Los **225 tests** actuales
  deben seguir en verde; los tres que cubren el listado y el detalle siguen
  valiendo tal cual, solo que ahora hay un cliente.
- [x] 4.2 `pnpm exec tsc --noEmit`, `pnpm run build`, y `pnpm run lint` en las 6
  advertencias conocidas (`react(set-state-in-effect)` ×5 y `react(refs)` ×1).
- [ ] 4.3 Recorrido manual: analizar un CV, recargar y comprobar que aparece en el
  historial; analizar el mismo con convocatoria y ver las dos filas con su
  etiqueta; pulsar el antiguo y comprobar que se carga completo; con cero análisis
  previos, comprobar que no aparece ninguna tarjeta vacía.
- [x] 4.4 Comprobar que no queda ningún endpoint de `apps/curriculums` sin cliente:
  buscar en `frontend/src/api/curriculums.ts` que las tres funciones se usen desde
  algún componente.

---

## Desviaciones y hallazgos

**1. La comprobacion en ejecucion se reescribio entera.** El plan y la primera
version parcheaban `integrations.ia.factory.get_proveedor`. Al verificar que
supiera fallar —inyectando la llamada a mano— **paso igual**: un modulo que hace
`from ... import get_proveedor` ya copio la referencia, asi que sustituirla en su
origen no intercepta nada. Es el fallo clasico de parchear donde se define en vez
de donde se busca.

Se reemplazo por un finder en `sys.meta_path` que falla si cualquier modulo
intenta importar `integrations.ia` durante el analisis. No depende de como se
obtuvo la referencia ni de cuantos adaptadores haya. Necesita vaciar `sys.modules`
ademas de instalarse, porque un modulo ya cacheado se devuelve sin consultar
`meta_path`, y en una corrida completa otros tests ya importaron la capa.

**2. Una afirmacion del plan era falsa y el experimento la refuto.** El plan decia
que la comprobacion estatica no veria un import diferido dentro de una funcion. Se
inyecto uno y **si lo vio**: `ast.walk` recorre tambien los cuerpos de las
funciones. Lo que la de ejecucion aporta de verdad es el import que ocurre
**fuera** de `apps/curriculums/`, en cualquier punto de la cadena de llamadas, que
la estatica no lee porque solo abre los archivos de la app. Los docstrings se
corrigieron.

**3. Se anadieron tres tests que el plan no preveia**, todos para que los guardias
se prueben a si mismos: que el detector estatico reconoce las dos formas de
importar, que el finder sabe fallar, que deja pasar los demas imports, y que
repone `sys.modules` al salir. La leccion del punto 1 es que un guardia sin probar
no es un guardia.

**4. El historial usa `usePeticion`, el hook propio del proyecto.** La primera
version escribia el `useEffect` a mano y levantaba una septima advertencia de lint
(`react(set-state-in-effect)`). El hook ya resuelve eso, y de paso trae el
abortado al desmontar, una cache corta y un `recargar()` que la invalida — que es
exactamente lo que hacia falta tras analizar. Era reutilizar lo que ya existia en
lugar de reimplementarlo peor.

**5. El error del historial se ignora deliberadamente.** `usePeticion` lo expone y
no se muestra: el historial es una ayuda, no un requisito. Si el listado falla, la
seccion no se renderiza y el usuario analiza igual. Es lo que pedia la tarea 2.7.

## Resultado

- **232 tests** del backend en verde (eran 225).
- Lint del frontend en las **6 advertencias** conocidas.
- Ninguna de las tres funciones de `api/curriculums.ts` queda sin cliente: no hay
  endpoints muertos en el modulo.
- La `0005` se aplica y se revierte limpiamente, a diferencia de la `0002`.

> **4.3 queda pendiente a proposito**: es el unico paso que requiere un navegador.
