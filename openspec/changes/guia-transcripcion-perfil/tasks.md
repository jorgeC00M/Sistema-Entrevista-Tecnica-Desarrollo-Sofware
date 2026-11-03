## 1. Preparación

- [x] 1.1 Extrae el diff de la copia del perfil sin las líneas de imágenes en base64. Arma una lista de control con cada bloque, para tacharlos a medida que tengan su entrada.
- [x] 1.2 Escribe el encabezado de la guía:
  - cómo usarla;
  - las condiciones para tomar capturas (D3);
  - cómo exportar los diagramas (D4);
  - un índice de entradas.

## 2. Capítulo I

- [x] 2.1 **Entradas de 1.1:** LinkedIn, el Foro Económico Mundial, Interviewing.io y la **Tabla 1**, con su propósito, columnas, contenido y pie.
- [x] 2.2 **Entradas de 1.2, 1.2.1 y 1.3:** párrafo introductorio, **Figura 1** (contenido, referente `arbol-de-problemas.mmd` y pie), gramática y doble espacio.
- [x] 2.3 **Entradas de 1.5 Alcance.** Una por cada viñeta que se reemplaza, agrega o elimina, en el orden en que quedan.
- [x] 2.4 **Entradas de 1.6:** las dos viñetas técnicas y la **Tabla 2**.

## 3. Capítulo II

- [x] 3.1 **Entradas de 2.1:** 2.1.2, 2.1.5 y 2.1.6, más **2.1.8**, con la fórmula y la **Tabla 3**, y **2.1.9**.
- [x] 3.2 **Entradas de 2.2:** el pie de la **Tabla 4**, la lista de fases y la **Figura 2**.
- [x] 3.3 **Entradas de 2.3:**
  - los textos de React y Django;
  - las **Figuras 3 y 4** (logotipos y fuente);
  - la **Figura 5** (arquitectura), con la alternativa de D5.
- [x] 3.4 **Entradas de 2.4:** definición, características, la **Tabla 5** y `jsonb`.
- [x] 3.5 **Entradas de 2.5.4 y 2.5.5**, y la unificación de las citas de Pressman y Sommerville en todo el documento.

## 4. Capítulo III

- [x] 4.1 **Entradas de 3.1 y 3.2:** las marcas de verificación, las cinco definiciones corregidas y las cinco nuevas (3.2.13 a 3.2.17).
- [x] 4.2 **Entradas de 3.3:**
  - la introducción;
  - las **Figuras 6 y 7**, que reemplazan a las imágenes antiguas;
  - **3.3.3** con la **Figura 8**.
- [x] 4.3 **Entradas de 3.4 y 3.4.1:**
  - el párrafo «kardex»;
  - la **Figura 9** (diagrama entidad-relación);
  - las **Tablas 6 a 9**: qué campo cambia en cada una frente a la versión anterior;
  - las **Tablas 10 a 14**.
- [x] 4.4 **Entradas de 3.4.2:** los 10 formularios y paneles, cada uno con su **Figura** (10 a 19: ruta, estado y datos de la captura) y su **Tabla** (15 a 24).

## 5. Cierre

- [x] 5.1 **Índices:** el de figuras y el de tablas finales, y las secciones nuevas para la tabla de contenido. Agrega los pasos de Word: Referencias → Insertar título, y Actualizar tabla.
- [x] 5.2 **Marcas pendientes:** cada `[VERIFICAR]` y `[CONFIRMAR]` del documento, con su ubicación y la fuente que hay que consultar.
- [x] 5.3 **Verificación cruzada:**
  - cada bloque de la lista de control tiene su entrada;
  - 19 figuras y 24 tablas, con el mismo número y pie que el documento;
  - `openspec validate guia-transcripcion-perfil` pasa.
- [ ] 5.4 No hagas commit. El usuario lo hará tras revisar.

## 6. Generar el Word y el Markdown, y comprobarlos

- [x] 6.1 **Escribe `docs/herramientas/generar_guia.py`** (D7).
  - Las entradas se definen como una lista de datos.
  - Escribe el `.docx` con `python-docx` (encabezados, recuadro sombreado, tablas «Table Grid») y el `.md`.
  - Se ejecuta con `backend/.venv/Scripts/python.exe`.
- [x] 6.2 **Genera los dos archivos.** Comprueba con `python-docx`:
  - que el `.docx` abre;
  - que tiene las 24 tablas del perfil;
  - que hay un encabezado de nivel 2 por entrada;
  - que coincide con el número de entradas del `.md`.
- [x] 6.3 **Agrega al principio de la guía la sección «Cómo usar esta guía»**, con los pasos de la propuesta: ver en paralelo, panel de navegación, pegar con «Mantener solo texto», Insertar título, mermaid.live, Win+Shift+S y Actualizar tabla.
