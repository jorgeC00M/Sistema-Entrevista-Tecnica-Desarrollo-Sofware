## Context

Ver proposal.md, sección «Why».

**Estado actual:**
- **`ResumenDelAnalisis.tsx`** apila: el aviso de la IA, «Frente a este aviso», el veredicto, una grilla `lg:grid-cols-5` (espejo en 3 columnas, «Lo primero que mejorar» en 2), las tecnologías legibles, «Qué ya funciona» y `PreguntasProbables`.
- **Las pestañas** son `sticky top-16` en `ResultadoDelAnalisis.tsx`.
- **`Hallazgo`** (`ats.py`) tiene `codigo, severidad, titulo, detalle, favorable, accion`. Se guarda como JSON por `asdict` en `AnalisisATS.hallazgos`, y `HallazgoSerializer` le da default a lo que falte (`accion=""`).

## Goals / Non-Goals

**Goals:**
- Que el plan y lo que hay que conservar estén siempre a la vista mientras se lee el diagnóstico.
- Que cada ejemplo sea verificable por el mismo módulo, nunca un consejo que el módulo contradiga.
- Dejar `ResumenDelAnalisis` como composición: sin lógica de listas dentro.

**Non-Goals:**
- Cambiar la pestaña Mejorar más allá de la línea «Así:». No se agrupa ni se agregan casillas.
- Citar fragmentos del CV del usuario.
- Tocar la IA o la frontera con la IA.

## Decisions

**D1. El orden del DOM es el orden del celular; la grilla lo reacomoda en computadora.**
- DOM: aviso → veredicto → columna derecha → espejo → tecnologías.
- En `lg`, la columna derecha lleva `lg:col-start-4 lg:col-span-2 lg:row-start-1 lg:row-span-3 self-start sticky`, y los bloques de la izquierda `lg:col-start-1 lg:col-span-3`.
- **Por qué:** así el celular muestra el plan después del veredicto, como se aprobó, sin JavaScript ni duplicar el bloque.
- **Lector de pantalla:** lee el plan tras el veredicto también en computadora. Es coherente, porque el veredicto nombra la causa y el plan dice qué hacer.
- **Alternativas descartadas:** CSS `order` (el orden visual y el del lector se separan sin razón) y renderizar el bloque dos veces con `hidden lg:block` (doble contenido, ids repetidos).

**D2. `row-span-3` fijo.**
- La izquierda tiene siempre tres bloques en las dos rutas:
  - con convocatoria: aviso, veredicto y espejo;
  - sin convocatoria: veredicto, espejo y tecnologías.
- Un `row-span` mayor crearía filas vacías cuyo `gap` se suma al final.
- Con convocatoria y sin requisitos reconocidos, `SinRequisitosReconocidos` ocupa el lugar del aviso, así que siguen siendo tres.

**D3. Offset del sticky.**
- La columna derecha se pega debajo de las pestañas (header `h-16` + la barra de pestañas). El valor `top-*` exacto se mide en el navegador durante el apply, con un token de Tailwind y no con un valor arbitrario.
- **Si el bloque no cabe en 768 px de alto:** solo «Lo que debes hacer» queda sticky, y «Consérvalo al corregir» queda debajo, en el flujo.

**D4. Dos componentes nuevos sacados del Resumen.**
- **`LoQueDebesHacer`:** el top 3, «y n correcciones más», las viñetas y «Ver todo». Usa `debilidadesPorGravedad`, `accionDe` y `ChipDeSeveridad`.
- **`ConservaloAlCorregir`:** las fortalezas con su detalle plegado.
- **Por qué:** `ResumenDelAnalisis` hoy mezcla composición y listas. Separarlas deja al Resumen solo decidiendo qué va dónde.
- La constante `PRIMERAS` se mueve a `LoQueDebesHacer`, junto a quien la usa.

**D5. No hay título visible para la columna izquierda.** Cada tarjeta ya tiene su `h3`, y un «Lo que ve el ATS» encima sería un nivel más de títulos sin contenido propio. «Lo que haces tú» tampoco se rotula: sus dos bloques ya se titulan solos.

**D6. `Hallazgo.ejemplo` vive en el backend, junto a `accion` y `detalle`.**
- Los tres textos de una regla se escriben en el mismo lugar (`ats.py`) y se prueban juntos.
- **Alternativa descartada:** un mapa `codigo → ejemplo` en el frontend. Funcionaría con los análisis viejos sin volver a subir el CV, pero partiría los textos de una regla en dos capas, y el test de «el ejemplo pasa sus reglas» tendría que cruzar del frontend a los detectores de Python.
- **Costo:** `VERSION_DE_REGLAS` 6 → 7. Es el mismo mecanismo de recálculo que ya existe.

**D7. Los ejemplos son texto fijo con datos inventados de Cochabamba**, nunca datos del CV del usuario.
- Copiar del CV obligaría a reformatear lo que el usuario escribió, y ahí sí podría equivocarse.
- Un texto fijo es reproducible y se puede probar.
- Los títulos de sección del ejemplo se toman de los que reconoce `secciones.TITULOS_POR_SECCION`.

**D8. `EjemploTest` pasa cada ejemplo por su detector.**
- **Fechas:** `fechas.py` y la regla de formatos mezclados no salta.
- **Secciones:** `secciones.titulo_de()` reconoce cada título.
- **Contacto:** `contacto.CORREO` y `detectar_telefono`.
- **Ubicación:** `ubicaciones`.
- **Siglas:** la regla `solo_sigla_o_solo_nombre` no salta sobre su ejemplo.

Los demás ejemplos son de formato (columnas, tablas, gráficos) y no tienen un detector de texto que los contradiga. `AccionTest` comprueba que cada código de la lista acordada traiga su ejemplo y que las fortalezas no tengan.

## Risks / Trade-offs

- **[El sticky tapa contenido o se corta en pantallas bajas]** → La columna usa `self-start`, y las fortalezas van plegadas. Se prueba en 768 px de alto y, si no cabe, se aplica el plan B de D3.
- **[Los análisis viejos no muestran «Así:»]** → Es esperado y está en la spec. Vuelven a calcularse al subir el CV de nuevo, como ocurrió con `accion`.
- **[Un ejemplo que el módulo contradice]** → Lo detecta `EjemploTest` y el test falla.
- **[El DOM no coincide con el orden visual en computadora]** → Es una decisión deliberada (D1). Se mantiene el orden lógico causa → acción.

## Migration Plan

No hay migración de base de datos: `hallazgos` es JSON. El serializer da `ejemplo: ""` a lo guardado antes, y el recálculo ocurre al volver a subir el CV (versión 7). Para volver atrás, se revierte el código. Los análisis guardados con la versión 7 seguirían leyéndose, porque un campo extra en el JSON se ignora.
