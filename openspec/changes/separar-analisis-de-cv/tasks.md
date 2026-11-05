## 1. Rutas y tipo

- [x] 1.1 En `hallazgos.ts`, agregar `rutaDelAnalisis(conConvocatoria, id?)`, con su test en `hallazgos.test.ts` para los 4 casos.
- [x] 1.2 En `router/index.tsx`, reemplazar `/mi-cv` y `/mi-cv/:id` por `/mi-cv/analisis`, `/mi-cv/analisis/:id`, `/mi-cv/oferta` y `/mi-cv/oferta/:id`, todas con `CurriculumPage`. Las rutas viejas se borran, sin redirección.
- [x] 1.3 En `CurriculumPage`:
  - derivar `tipo` de la ruta y quitar `setTipo`;
  - navegar con `rutaDelAnalisis` tras analizar;
  - corregir con `replace` un id abierto en la ruta del otro tipo;
  - hacer que `volverA` reciba la ruta (para «Analizar otro», «Compara con una convocatoria» y «Subir otro»);
  - el `h1` `sr-only` según el tipo.

## 2. Entrada e historial

- [x] 2.1 En `EntradaDelAnalisis`, quitar `Pestanas`, el `tabpanel`, `TIPOS`, `onTipo` y los `useId`. `tipo` queda como prop de solo lectura y la fila 2fr/1fr no cambia. Reescribir el docstring.
- [x] 2.2 En `HistorialDeAnalisis`:
  - recibir `tipo` y filtrar por `con_convocatoria` antes de paginar;
  - quitar la columna «Tipo de análisis», el componente `Tipo` y su uso en la tarjeta;
  - «Ver» con `rutaDelAnalisis`;
  - quitar los imports sin uso.

## 3. Menú y encabezado

- [x] 3.1 En `destinos.ts`, agregar `prefijo?: boolean` a `Destino` y los destinos «Analizar CV» (`/mi-cv/analisis`, `resultados`, `prefijo: true`) y «Comparar con oferta» (`/mi-cv/oferta`, `documento`, `prefijo: true`). En `SidebarNavItem`, `end={!destino.prefijo}`.
- [x] 3.2 En `titulosDeRuta.ts`, reemplazar las entradas de `/mi-cv` por `/mi-cv/oferta/*` y `/mi-cv/analisis/*`, con sus títulos y subtítulos.
- [x] 3.3 Actualizar el comentario de `SECCIONES_CON_ESTADO_COMPARTIDO` en `LimiteDeError.tsx`.

## 4. Documentación y verificación

- [x] 4.1 `CLAUDE.md`:
  - la sección de la pantalla de CV: dos destinos, rutas simétricas, `/mi-cv` y `/mi-cv/:id` eliminadas, sin pestañas de entrada, historial por tipo sin columna de tipo;
  - el sidebar («Prepararte» con dos destinos por prefijo).
- [x] 4.2 Anotar en las deltas sin archivar `tipo-de-analisis-en-pestanas` y `sidebar-por-etapas` que `separar-analisis-de-cv` reemplazó las pestañas de entrada y «Revisar mi CV».
- [x] 4.3 Hacer dos `grep` en `frontend/src`:
  - `Revisar mi CV|onTipo|setTipo`: no debe quedar nada;
  - `'/mi-cv'` y `` `/mi-cv/ ``: solo deben quedar `rutaDelAnalisis`, el router, `destinos.ts`, `titulosDeRuta.ts` y `LimiteDeError`, sin ninguna ruta vieja.
- [x] 4.4 Ejecutar `pnpm exec tsc --noEmit`, `pnpm test` (con `estilos.test.ts`), `pnpm run lint` (deben quedar 5 advertencias) y `pnpm run build`.
- [x] 4.5 Ejecutar `openspec validate separar-analisis-de-cv`.

## 5. Cierre (lo hace Jorge)

- [ ] 5.1 Pruebas manuales:
  - el menú desplegado, plegado y en celular, con el destino actual en las entradas y en los resultados;
  - analizar en cada destino;
  - el historial de cada uno;
  - «Compara con una convocatoria» con el CV conservado;
  - «Analizar otro»;
  - abrir `/mi-cv` y `/mi-cv/<id>` y llegar a `/simular-entrevista`.
- [ ] 5.2 Revisar si alguna figura o texto de la tesis describe la entrada con pestañas.
- [ ] 5.3 No hacer commit; lo hace Jorge.
