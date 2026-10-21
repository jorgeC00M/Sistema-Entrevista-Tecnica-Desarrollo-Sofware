## Context

**Cómo está hoy**

- `HistorialPage` recibe todas las entrevistas del usuario de `GET /api/entrevistas/` (sin paginar) mediante `useHistorial`, en la caché `historial` que comparte con el "Continuar" del sidebar.
- Las pinta con `ListaEntrevistas`: una `Tarjeta` con filas `Link` separadas por `Divisor`.
- `EntrevistaSerializer` ya expone:
  - `puesto_display`, `nivel_display`, `tecnologia_display`;
  - `estado`/`estado_display`, `fecha_inicio`, `puntuacion_promedio` (solo las finalizadas);
  - `preguntas_calificadas`/`preguntas_previstas`, que `selectors._con_conteo` anota en la misma consulta.
- La nota parcial de una abandonada hoy solo se calcula en `/resultados/` (`resumen_de`).

**Restricciones del sistema de estilos (CLAUDE.md)**

- Un `<button` solo puede vivir en `components/ui/`; `estilos.test.ts` lo vigila.
- Nada de radios, sombras ni colores escritos a mano.
- Las acciones son pastillas y los controles usan `rounded-control`.
- El foco se marca con `foco-anillo`.

## Goals / Non-Goals

**Goals:**
- Que la tabla y la paginación sean componentes reutilizables y que el historial solo declare sus columnas.
- Que la lógica de qué páginas mostrar sea una función pura probada con Vitest (el frontend no tiene tests de componentes).
- Que la nota parcial llegue sin una consulta por fila y sin filtrar notas de entrevistas en curso.

**Non-Goals:**
- Paginar en el servidor.
- Ordenar por columna o filtrar.
- Cambiar los gráficos.

## Decisions

**D1. La paginación es del lado del cliente.**

El endpoint ya devuelve la lista completa, porque el sidebar la necesita entera para encontrar la entrevista en curso, y un estudiante acumula decenas de entrevistas, no miles. Paginar en el servidor cambiaría el contrato que usa el sidebar y obligaría a otra petición por página.

Alternativa descartada: `?page=` en DRF. Habría que separar el endpoint del sidebar y no hay volumen que lo justifique.

**D2. Componentes y dónde viven.**

- **`lib/paginacion.ts`:** función pura `paginasVisibles(actual, total): number[]`.
  - Devuelve una ventana de como máximo 3 páginas consecutivas (`MAXIMO_NUMEROS = 3`), centrada en la actual y desplazada en los extremos para que siempre muestre 3 cuando existan.
  - No usa «…» ni primera o última fija: así lo pidió el usuario al aplicar el cambio (21-10-2026).

  Va con `lib/paginacion.test.ts`, que cubre 1 página, 7, 12 en la 1, 12 en la 6 y 12 en la 12. Ahí mismo vive `recortar(pagina, total)` para normalizar `?pagina=`.
- **`components/ui/Paginacion.tsx`:**
  - props `pagina`, `totalPaginas`, `totalElementos`, `porPagina` y `onCambiar(pagina)`;
  - pinta `nav aria-label="Paginación"`, el rango a la izquierda (`aria-live="polite"`) y los botones a la derecha (`justify-between`; en móvil el rango queda arriba y los botones debajo, a la derecha);
  - números de 40 px con `rounded-control`, con la actual en `bg-vidrio-acento text-white` y `aria-current="page"`;
  - ‹ y › son `BotonIcono` con `aria-label` «Página anterior» y «Página siguiente», deshabilitados en los extremos;
  - no se pinta si `totalPaginas <= 1`.
- **`components/ui/Tabla.tsx`:** genérica, `Tabla<T>({ columnas, filas, claveDeFila, tarjeta, titulo, refInicio })`.
  - `columnas` es `{ clave, titulo, celda: (fila: T) => ReactNode, alinear?: 'inicio' | 'fin' }[]`.
  - Desde `sm` (640 px) pinta `<table>`:
    - `<caption className="sr-only">` con `titulo`;
    - `<th scope="col">` en `EtiquetaMono`;
    - filas separadas por `border-vidrio-linea`, con `hover:bg-vidrio-field`.
  - Por debajo de 640 px pinta una `<ul>` y, en cada `<li>`, `tarjeta(fila)`.
  - Las dos vistas se ocultan con `hidden sm:table` y `sm:hidden`: CSS, no `useMediaQuery`, para que no haya salto al montar. Las dos están en el DOM, pero solo una es visible y accesible, porque `hidden` usa `display: none`.
  - `refInicio` apunta al contenedor (`tabIndex={-1}`), que recibe el foco al cambiar de página.
- **`features/historial/components/TablaDeEntrevistas.tsx`** reemplaza a `ListaEntrevistas.tsx`.
  - Declara las 7 columnas y la tarjeta móvil, y corta las `filas` de la página.
  - Lee y escribe `?pagina=` con `useSearchParams`, usando `replace: false` para que "atrás" funcione entre páginas. Así la página sobrevive al volver de unos resultados.

Alternativa descartada: solo un componente de historial sin `Tabla` genérica. Funcionaría, pero el usuario pidió componentes, y la Retroalimentación o el historial de CV son candidatos naturales a reusarla.

**D3. La nota parcial se calcula en SQL, junto al conteo.**

- `selectors._con_conteo` añade `promedio_calificado=Avg("intercambios__evaluacion__puntuacion")` en la misma anotación que `preguntas_calificadas`. Usa el mismo join, así que sigue siendo una consulta para todo el historial.
- `EntrevistaSerializer.get_puntuacion_parcial` devuelve:
  - `round(promedio, 2)` solo si `estado == ABANDONADA` y hay al menos una calificada;
  - `None` en cualquier otro caso, en particular `EN_PROGRESO`.
- Fuera del listado, por ejemplo en el detalle (que usa `_con_conteo` vía `entrevista_del_usuario`), vale la misma regla.
- Si la anotación no está, por ejemplo con un objeto recién creado, se calcula con una consulta, igual que hace `get_preguntas_calificadas`.

La media coincide con la de `resumen_de`, porque las dos son la media simple de las evaluaciones guardadas. Un test lo fija comparando ambos valores.

**D4. Qué se muestra en cada columna.**

- **Fecha:** `toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric' })`. Antes era fecha y hora; la hora deja de mostrarse en la tabla.
- **Puesto:** `puesto_display`. Si es largo, se parte (`break-words`).
- **Puntuación:**
  - `Math.round(puntuacion_promedio)` en mono si está finalizada;
  - `Math.round(puntuacion_parcial)` más « · parcial» en `text-meta text-vidrio-muted` si hay parcial;
  - «—» en otro caso, con `aria-label="Sin nota"`.
- **Estado:** `Badge` con `TONO_POR_ESTADO`, como ahora.
- **Acción:** un `Link` de texto en `text-vidrio-acento`, con la flecha en `aria-hidden`.
  - El nombre accesible incluye la entrevista: «Ver resultados de Desarrollador Backend del 21/10/2026». Así siete enlaces «Ver resultados» no suenan iguales.
  - La fila entera deja de ser un enlace, porque no se puede anidar un `<a>` en una fila con un `<a>` dentro.
- **Tarjeta móvil:**
  - arriba, «Puesto · Tecnología»;
  - debajo, «Nivel · Fecha»;
  - y una fila con la puntuación, el `Badge` y la acción alineada a la derecha.

**D5. Foco y anuncio.**

Al cambiar de página:
- `onCambiar` actualiza la URL;
- tras el render, el foco va al contenedor de la tabla (`refInicio`), con `scrollIntoView` que respeta `prefiereMovimientoReducido` de `lib/movimiento.ts`;
- el rango se anuncia con su `aria-live`.

## Risks / Trade-offs

- **[Dos vistas en el DOM]** → El costo es pequeño (10 filas). Ocultar con `display: none` las saca del árbol de accesibilidad, así que no se leen dos veces.
- **[La fecha pierde la hora]** → Dos entrevistas del mismo día ya no se distinguen por la hora. El orden se mantiene (de más reciente a más antigua) y la hora sigue en el reporte. Si se echa de menos, se añade como `title` de la celda.
- **[Una consulta más pesada]** → `Avg` y `Count` sobre el mismo join no añaden consultas. `test_consultas_acotadas` del historial (si existe) o un `assertNumQueries` nuevo lo fijan.
- **[Nota parcial y privacidad]** → La regla de `EN_PROGRESO` va en el serializer, no en la interfaz, y la fija un test de API. Es el mismo principio que `con_evaluacion=False` en `/resultados/`.

## Migration Plan

Sin migración de base de datos. `puntuacion_parcial` es un campo nuevo y aditivo, así que el frontend viejo lo ignora. Para hacer rollback se revierte el commit.
