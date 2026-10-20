## 1. Estructura y conteo

- [x] 1.1 En `hallazgos.ts`, cambiar `porMejorar()` por `correccionesMedidas()` y `sugerenciasDeIA()`, con sus tests, y añadir a `SEVERIDADES` el color del icono (D2, D5).
- [x] 1.2 En `ResultadoDelAnalisis.tsx`:
  - "Mejorar" sin el espejo y con la línea "n correcciones medidas · m sugerencias de IA";
  - la pestaña sin número;
  - la convocatoria sin requisitos como aviso, sin `role="alert"`;
  - "Subir otro archivo" en el CV ilegible;
  - el `h2` con el anuncio de los campos (D1, D2, D4, D6).
- [x] 1.3 En `ResumenDelAnalisis.tsx` y `ListaDeHallazgos.tsx`:
  - las correcciones principales enlazan a `#hallazgo-<codigo>`, con foco y `scroll-margin-top`;
  - la cifra de viñetas sale del espejo;
  - la lista lleva título real, sin borde ámbar, con iconos por severidad (D1, D5).

## 2. Ruta y robustez

- [x] 2.1 Añadir la ruta `/mi-cv/:id` en `router/index.tsx` y su título en `titulosDeRuta.ts`. En `CurriculumPage`:
  - el resultado depende de `useParams`, con `usePeticion` y `vigenciaMs: 0`;
  - navegar al analizar o abrir; "Analizar otro" vuelve a `/mi-cv`;
  - un 404 muestra el aviso y la entrada;
  - un estado de carga al abrir;
  - `useRevisionDelCv` adaptado al dato cargado (D3).
- [x] 2.2 La subida:
  - estado `aria-live` bajo el botón;
  - el error general junto al botón (prop `errorGeneral` en `EntradaDelAnalisis`);
  - el mensaje de tiempo agotado o red con `refrescarHistorial()` (D4).

## 3. Sistema, accesibilidad y móvil

- [x] 3.1 Títulos y superficies (D5):
  - "Tu currículum" pasa a `headline-md` serif y "Tus análisis anteriores" a `headline-sm`;
  - el plural y "campos" en el historial;
  - fuera la etiqueta sobre el `h1`;
  - `PreguntasProbables` con `Tarjeta`.
- [x] 3.2 Accesibilidad (D6):
  - `dl` válida en `EspejoDelATS` (sin la prop `compacto`, siempre con su párrafo);
  - `aria-describedby` en `ZonaDeArchivo`;
  - la instrucción visible en `CampoConvocatoria`.
- [x] 3.3 Móvil y menores (D7):
  - `Pestanas` con `repartir` y `sticky top-16`;
  - el rótulo corto "Términos" por debajo de `sm`;
  - el aviso "La IA no encontró nada que sugerir";
  - `ZonaDeArchivo` reducida a la fila del archivo con uno elegido, y "Arrastra" solo con `hover`;
  - el ejemplo de viñeta de tesis.

## 4. Verificación, documentación y cierre

- [x] 4.1 Ejecutar `pnpm exec tsc --noEmit`, `pnpm test` (incluida la guarda de estilos), `pnpm run lint` (sin avisos nuevos) y `pnpm run build`, todos en verde. El backend no cambia.
- [x] 4.2 Actualizar `CLAUDE.md`, en la sección de la pantalla del CV: "Mejorar" sin espejo y sin número, las dos cifras, la ruta `/mi-cv/:id`, los errores junto a su causa y el criterio de terminado (D8).
- [ ] 4.3 Prueba manual que cubra:
  - analizar, recargar en `/mi-cv/:id` y abrir desde el historial;
  - un id ajeno;
  - "Analizar otro";
  - un error de red simulado;
  - el CV ilegible ("Subir otro archivo");
  - los enlaces del Resumen a "Mejorar";
  - el lector de pantalla al terminar;
  - 320, 375 y 1440 px.

  Si no se puede ejecutar, queda **sin marcar**.
- [ ] 4.4 Crítica de verificación (D8): ejecutar `/impeccable critique` sobre la pantalla. Se da por terminada si es **≥ 30/40, sin P0/P1 y con el detector en 0**. Lo P2/P3 que aparezca va a `pendientes.md` y no abre un cambio nuevo.
