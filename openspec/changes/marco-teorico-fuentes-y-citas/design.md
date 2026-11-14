## Context

- **Cómo se genera:** el Capítulo II se escribe en `docs/marco-teorico-borrador.md`. `docs/herramientas/generar_marco_teorico.py` toma solo los bloques «Después» y escribe dos Word:
  - el de trabajo, que lleva una ficha bajo cada línea «*Fuente:*»;
  - el de entrega, con `--sin-fichas`.
- **Qué comprueba el generador antes de escribir:** cruza las citas del texto con las referencias y las fichas, y se detiene si algo no cuadra.
- **Estado medido:**
  - 7 tablas con su pie después de la tabla, en formato «*Tabla N. Título (Elaboración Propia…)*»;
  - 7 figuras: 3 pendientes de imagen, 2 logotipos y 2 diagramas propios;
  - 48 referencias y 146 párrafos;
  - 54 líneas «Fuente:» y 88 fichas, de las que 38 repiten una obra.
- **Datos de las fichas:** la tabla «Fichas de cita» del borrador tiene los campos de `CAMPOS_DE_FICHA`: tipo, modo de acceso, título, sitio, autores, fecha, resumen y URL. No tiene páginas.

## Goals / Non-Goals

**Goals:**
- las cuatro reglas de Jorge aplicadas en todo el capítulo;
- el generador sigue pasando el cruce de citas.

**Non-Goals:**
- cambiar lo que el texto afirma;
- tocar el Capítulo I o el perfil;
- dibujar las figuras pendientes;
- cambiar el formato APA de los artículos.

## Decisions

### 1. Autoría de tablas y figuras
El pie queda solo con el título («*Tabla 3. Clasificación de los agentes conversacionales*»). La autoría va en la línea «*Fuente:*» que sigue, que se reescribe así: el texto de autoría primero y, a continuación, la lista de enlaces que hoy usan las fichas.

| Elemento | Origen | Línea «Fuente:» |
|---|---|---|
| Tablas 3, 4, 5, 6, 8 y 9 | Síntesis de las obras de su sección | Elaboración propia con base en … |
| Tabla 7 (rúbrica) | Síntesis de la rúbrica del sistema y de sus fuentes | Elaboración propia con base en … |
| Figura 2 (ATS) | Síntesis de Workday (2023) y Greenhouse (2026) | Elaboración propia con base en … |
| Figura 3 (Transformer) | Esquema simplificado de una obra | Elaboración propia con base en Vaswani et al. (2017) |
| Figuras 4 y 7 | Diagramas del propio sistema | Elaboración propia |
| Figuras 5 y 6 (logotipos) | Imagen tomada tal cual | Meta (s. f.) · Django Software Foundation (s. f.) |

- **Logotipos:** se agregan las referencias que falten, por ejemplo la página de marca de React o la de Django, cada una con su ficha.
- **Figura 3:** queda como elaboración propia y no como «tomada de», porque es un esquema simplificado, no la figura original.
- **Qué obras se nombran en las síntesis:** las que el texto que acompaña a la tabla ya cita. Así no aparecen fuentes nuevas.

### 2. Referencias de libros
El formato es «Autor, A., & Autor, B. (año). *Título* (N.ª ed.). Editorial. URL», sin ISBN, que APA 7 no usa.

El acceso al libro depende de su tipo:

| Tipo de libro | Libros | Acceso | Página |
|---|---|---|---|
| Acceso abierto legal | Chacon y Straub (Pro Git), Jurafsky y Martin, Fielding (tesis), Van Rossum y Drake | La URL abre el texto | Se verifica con el texto en la mano |
| Comercial | Pressman y Maxim, Sommerville, Russell y Norvig, Beck y Andres, Manning y Schütze | Préstamo en Internet Archive (`archive.org/details/…`) si existe esa edición; si no, la página de la editorial | `[VERIFICAR página]` |

Cada enlace se comprueba en el apply.

- **Los que rechazan peticiones automáticas** (MIT Press responde 403) quedan con una marca `[VERIFICAR enlace]` para abrirlos en el navegador.
- **La editorial de Beck** se confirma; se espera Addison-Wesley.
- **Páginas:**
  - en `CAMPOS_DE_FICHA` se suma «Páginas»;
  - `escribir_ficha` solo lo imprime cuando el «Tipo de fuente» es Libro;
  - la columna se agrega a la tabla «Fichas de cita» y queda vacía en las obras que no son libros.

### 3. «Selecciona la cita» para las obras repetidas
`con_fichas` ya recorre las líneas «Fuente:» en orden. Lleva un conjunto `mostradas`:
- si la clave no está, emite `("ficha", …)` y la agrega;
- si ya está, emite `("seleccion", clave)`.

`escribir_docx` pinta `seleccion` como un párrafo sombreado de 9 pt: «Selecciona la cita: Autor (año)».

El resumen de la consola cuenta `seleccion` aparte de `ficha`. El Word de entrega no cambia, porque no llama a `con_fichas`.

### 4. Posición de las citas
Cada párrafo con cita se lee y se clasifica:
- ¿destaca al autor? Entonces la cita es narrativa y va al inicio;
- ¿conecta una idea del autor con una propia? Entonces va en medio;
- ¿importa el dato? Entonces es parentética y va al final.

Solo se reescribe lo que no cumple, con el mismo contenido. En los párrafos que combinan obras se agrega un conector («Por su parte», «En la misma línea», «En contraste», «Asimismo») cuando faltan.

El borrador se edita en sus bloques «Después», el formato con el que ya trabaja Jorge: cada sección tocada recibe su nota «> Cambios» con el motivo. Después se ejecuta `--estilo`, para no introducir fórmulas genéricas, y el cruce de citas.

## Risks / Trade-offs

- **[Las páginas de los libros comerciales no se pueden verificar]** → Quedan `[VERIFICAR página]`, resaltadas en amarillo y listadas para revisar a mano. Inventarlas sería peor.
- **[Un cambio de posición altera el sentido]** → Solo se reordena la cita y se agregan conectores. Cada párrafo tocado queda en la nota «> Cambios» de su sección, para que Jorge lo revise.
- **[El cruce de citas no reconoce una forma nueva]** → `citas_en` ya reconoce las narrativas («Autor (año)»), las parentéticas y las de varios autores. Se ejecuta después de cada bloque de cambios.

## Migration Plan

No hay datos que migrar. El borrador y los Word anteriores no están en git, así que antes de editar se hace una copia del borrador en el scratchpad.
