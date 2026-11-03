## 1. Backend: el ejemplo de cada corrección

- [x] 1.1 Agregar `ejemplo: str = ""` a `Hallazgo` en `integrations/documentos/ats.py` y documentarlo junto a `accion`. Verifica que `asdict` lo incluya.
- [x] 1.2 Escribir el ejemplo fijo de cada regla acordada:
  - `dos_columnas`;
  - las zonas (crítico y parcial);
  - `sin_correo`, `sin_telefono` y `sin_ubicacion`;
  - `secciones_no_reconocidas`, con títulos de `TITULOS_POR_SECCION`;
  - `antiguedad_no_calculable` y `formatos_de_fecha_mezclados`;
  - `contiene_tablas` y `habilidades_en_graficos`;
  - `solo_sigla_o_solo_nombre`.

  Quedan vacíos `contiene_imagenes`, `texto_oculto`, `demasiadas_paginas`, `idioma_distinto` y `sin_capa_de_texto`. Verifica con `python manage.py test tests.integration.test_ats`.
- [x] 1.3 Subir `VERSION_DE_REGLAS` de 6 a 7 y actualizar su comentario. Verifica que el test de recálculo con `VERSION_DE_REGLAS - 1` siga en verde.
- [x] 1.4 Agregar `ejemplo = serializers.CharField(default="")` en `HallazgoSerializer`. Verifica con un test en `apps/curriculums/tests/test_curriculums.py`: un análisis guardado sin `ejemplo` se serializa con `ejemplo: ""`.
- [x] 1.5 Ampliar `AccionTest` en `tests/integration/test_ats.py`:
  - cada código de la lista acordada trae un ejemplo no vacío;
  - las fortalezas, ninguno.

  Verifica que pase.
- [x] 1.6 Crear `EjemploTest`: cada ejemplo pasa su propio detector, según design D8 (fechas, secciones, contacto, ubicación, siglas). Para comprobar que el test sirve, rompe a propósito un ejemplo y mira que falle.
- [x] 1.7 Correr `python manage.py test` completo y confirmar que todo pasa, incluida la frontera con la IA.

## 2. Frontend: «Así:» en Mejorar

- [x] 2.1 Agregar `ejemplo?: string` a `Hallazgo` en `types/curriculum.ts`, con un comentario sobre los análisis de reglas < 7. Verifica con `pnpm exec tsc --noEmit`.
- [x] 2.2 En `ListaDeHallazgos.tsx`, después del detalle y solo si hay ejemplo, mostrar «Así:» con el ejemplo en `font-mono-vidrio` sobre `bg-vidrio-field rounded-control`. Va sin rótulo de IA. Verifica que tsc y `estilos.test.ts` pasen.

## 3. Frontend: el Resumen en dos columnas

- [x] 3.1 Crear `components/LoQueDebesHacer.tsx` con lo que está hoy en `ResumenDelAnalisis`:
  - el título «Lo que debes hacer»;
  - el top 3 con `accionDe` y `ChipDeSeveridad` como enlace;
  - «y n correcciones más» si hay más de 3;
  - las viñetas, «Ver todo en Mejorar» y el mensaje sin correcciones;
  - `PRIMERAS` se mueve aquí.

  Verifica con tsc.
- [x] 3.2 Crear `components/ConservaloAlCorregir.tsx`: las fortalezas con su título a la vista y el detalle en `<details>`, y nada si no hay fortalezas. Verifica con tsc.
- [x] 3.3 Reescribir `ResumenDelAnalisis.tsx` como composición, según design D1–D3:
  - grilla `lg:grid-cols-5`;
  - DOM en este orden: aviso → veredicto → columna derecha (sticky, `lg:col-start-4 lg:col-span-2 lg:row-start-1 lg:row-span-3 self-start`) → espejo → tecnologías;
  - `PreguntasProbables` a todo el ancho al final;
  - borrar los imports sin uso y actualizar el docstring.

  Verifica que tsc, `pnpm test`, `pnpm run lint` (5 advertencias) y `pnpm run build` pasen.
- [ ] 3.4 Medir en el navegador el `top-*` del sticky bajo las pestañas. Comprobar en 768 px de alto que la columna derecha cabe; si no cabe, aplicar el plan B de design D3. Verifica a ojo que no tape las pestañas.
- [x] 3.5 Buscar restos con `grep` y confirmar que no aparecen «Lo primero que mejorar» ni «Qué ya funciona» en `frontend/src`, ni imports sin uso (lint).

## 4. Specs y documentación

- [x] 4.1 En la delta de `correcciones-accionables-y-menos-pestanas/specs/revision-de-cv/spec.md`, cambiar «Lo primero que mejorar» por «Lo que debes hacer». Verifica con `openspec validate correcciones-accionables-y-menos-pestanas`.
- [x] 4.2 Actualizar la sección del CV en `CLAUDE.md`:
  - el Resumen en dos columnas y su orden por ruta, con el celular;
  - `LoQueDebesHacer` y `ConservaloAlCorregir`;
  - `Hallazgo.ejemplo` y `EjemploTest`;
  - la versión 7 y por qué;
  - este cambio en la lista de veces que se reabrió la pantalla.

  Verifica con `grep` que no quede «Lo primero que mejorar» ni «Qué ya funciona».
- [x] 4.3 Correr `openspec validate resumen-en-dos-columnas-y-ejemplos` y confirmar que el cambio es válido.

## 5. Cierre

- [ ] 5.1 Pruebas manuales (las hace el usuario):
  - computadora con convocatoria: el aviso arriba a la izquierda y la columna derecha fija al bajar;
  - computadora sin convocatoria: veredicto, ficha y tecnologías;
  - celular: el plan justo después del veredicto;
  - Mejorar con fechas mezcladas: aparece «Así:»;
  - un análisis viejo del historial: sin «Así:» y sin errores.
- [ ] 5.2 No hacer commit. El usuario lo hará tras revisar.
