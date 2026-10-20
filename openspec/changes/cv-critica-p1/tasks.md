## 1. Lógica compartida

- [x] 1.1 En `features/curriculum/hallazgos.ts`, añadir `CODIGO_SIN_CAPA_DE_TEXTO`, `esIlegible(analisis)` (D1) y `SEVERIDADES` con "Impide la lectura" / "Resta visibilidad" / "Detalle" (D4). Ampliar `hallazgos.test.ts` con el CV ilegible sí/no y las tres etiquetas. Se verifica con `pnpm test` en verde.

## 2. Componentes

- [x] 2.1 En `ListaDeHallazgos.tsx`, usar `SEVERIDADES` (borrar `POR_SEVERIDAD`) y poner el chip como texto aparte con un prefijo `sr-only` (D4). Si `favorable` deja de usarse, simplificarlo.
- [x] 2.2 En `EspejoDelATS.tsx`, añadir la variante `compacto`: sin el párrafo largo, filas que se parten en móvil y sin el `w-28` fijo en esa variante (D2).
- [x] 2.3 Reescribir `ResumenDelAnalisis.tsx` (D2):
  - el espejo compacto con la línea de cifras;
  - "Lo primero que mejorar" (top 3 con `SEVERIDADES`) al lado desde `lg`;
  - "Qué ya funciona" con el detalle en `<details>`;
  - "Ver todo en Qué mejorar".
- [x] 2.4 En `ResultadoDelAnalisis.tsx` (D1, D3):
  - el panel único cuando `esIlegible`;
  - 4 pestañas, con "Qué mejorar (n)" que junta el espejo completo, las debilidades, las viñetas y la redacción;
  - sin fortalezas en esa pestaña;
  - sin el valor `vinetas`.
- [x] 2.5 En `EntradaDelAnalisis.tsx`, poner la etiqueta "PDF o DOCX · máx. 2 MB" (desde `MAXIMO_BYTES`) y la nota de privacidad con el icono `candado` bajo la zona (D5).

## 3. Verificación y documentación

- [x] 3.1 Verificar que `grep -rnE "POR_SEVERIDAD|'Crítico'|Importante'|'Menor'" frontend/src/features/curriculum` no da resultados. Ejecutar `pnpm exec tsc --noEmit`, `pnpm test` (incluida la guarda de estilos), `pnpm run lint` (sin avisos nuevos) y `pnpm run build`, todos en verde.
- [x] 3.2 Actualizar `CLAUDE.md`, en la sección de la pantalla del CV: las 4 pestañas, el Resumen con el espejo, el panel único para el CV ilegible, la nota de privacidad y las severidades por efecto.
- [ ] 3.3 Prueba manual que cubra:
  - un CV legible con y sin convocatoria;
  - un PDF escaneado con convocatoria (panel único, sin culpar a la convocatoria);
  - el Resumen a 1440 y a 375 px;
  - las severidades leídas con un lector de pantalla;
  - la nota de privacidad visible antes de subir.

  Al terminar, volver a ejecutar `/impeccable critique` sobre la pantalla para comparar con el 25/40. Si no se puede ejecutar, queda **sin marcar**.
