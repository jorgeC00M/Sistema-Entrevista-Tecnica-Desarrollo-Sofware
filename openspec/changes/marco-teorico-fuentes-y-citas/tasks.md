## 0. Preparación

- [x] 0.1 Copiar `docs/marco-teorico-borrador.md` al scratchpad antes de editar, porque no está en git. (La copia se borró al terminar, a pedido de Jorge.)

## 1. Fuente de tablas y figuras

- [x] 1.1 Quitar la autoría de los pies de las Tablas 3 a 9 y de las Figuras 2 a 7. El pie queda solo con el título.
- [x] 1.2 Reescribir o agregar la línea «*Fuente:*» bajo cada tabla y figura, según la tabla de `design.md` (síntesis, diagrama propio o tomada tal cual).
- [x] 1.3 Agregar las referencias y fichas de los logotipos de React (Meta) y Django (Django Software Foundation), comprobando su URL.

## 2. Referencias de libros

- [x] 2.1 Generador: sumar «Páginas» a `CAMPOS_DE_FICHA`. `escribir_ficha` lo imprime solo si el tipo de fuente es Libro.
- [x] 2.2 Borrador: agregar la columna «Páginas» a la tabla «Fichas de cita».
- [x] 2.3 Libros de acceso abierto (Chacon y Straub, Jurafsky y Martin, Fielding, Van Rossum y Drake):
  - completar la editorial;
  - comprobar que la URL abre el texto;
  - anotar la página de lo citado.
- [x] 2.4 Libros comerciales (Pressman y Maxim, Sommerville, Russell y Norvig, Beck y Andres, Manning y Schütze):
  - completar o confirmar la editorial;
  - quitar el ISBN;
  - poner la URL de préstamo de Internet Archive de esa edición o, si no hay, la de la editorial;
  - marcar `[VERIFICAR página]`.
- [x] 2.5 Marcar `[VERIFICAR enlace]` en los enlaces que el servidor rechace a una petición automática, y sumar todas las marcas a «Para revisar manualmente».

## 3. Obras ya citadas

- [x] 3.1 Generador: `con_fichas` emite la ficha solo en la primera aparición de cada obra y, en las siguientes, `("seleccion", clave)`.
- [x] 3.2 Generador: `escribir_docx` pinta `seleccion` como «Selecciona la cita: Autor (año)», y el resumen de la consola lo cuenta aparte.

## 4. Posición de las citas

- [x] 4.1 Revisar los párrafos con cita, sección por sección, y corregir los que no siguen la regla de narrativa al inicio, en medio o parentética al final.
- [x] 4.2 En los párrafos que sintetizan varias fuentes, enlazarlas con conectores naturales.
- [x] 4.3 Dejar en la nota «> Cambios» de cada sección los párrafos tocados.

## 5. Verificación

- [x] 5.1 Ejecutar `generar_marco_teorico.py --estilo` (Word de trabajo) y `--sin-fichas` (Word de entrega). El cruce de citas, referencias y fichas pasa sin problemas y no aparecen avisos de estilo nuevos.
- [x] 5.2 Recuento en el Word de trabajo: una ficha completa por obra y una línea «Selecciona la cita» por cada repetición.
- [x] 5.3 Revisar en los dos Word:
  - los pies y las líneas «Fuente:» de las 14 tablas y figuras;
  - las referencias de los libros;
  - las marcas pendientes.
- [x] 5.4 Ejecutar `openspec validate marco-teorico-fuentes-y-citas --strict`.

## 6. Cierre (lo hace Jorge)

- [ ] 6.1 Abrir en el navegador los enlaces marcados `[VERIFICAR enlace]` y completar las páginas `[VERIFICAR página]`.
- [ ] 6.2 No se hace commit: la tesis no va a git.
