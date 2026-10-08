## 1. Carrusel genérico

- [ ] 1.1 Convertir `components/CarruselAreas.tsx` en
  `components/CarruselDeTarjetas.tsx` (genérico `<T>`, `elementos`, `clave`,
  `etiqueta`, `renderTarjeta(t, actual)`), conservando medición, gesto táctil,
  flechas, indicadores y `useCarrusel`. Eliminar `CarruselAreas.tsx` tras
  confirmar con búsqueda que no tiene más usos. Verificar con
  `pnpm exec tsc --noEmit`.

## 2. Secciones

- [ ] 2.1 `sections/AreasTecnicas.tsx` → `sections/PuestosDisponibles.tsx`
  (id `puestos`, índice 04): tarjeta con icono de `ICONO_POR_PUESTO`, nombre,
  descripción y áreas como chips (nombres desde `catalogos.areas`). Verificar en
  el navegador: 3 tarjetas sin flechas en escritorio, 1 con navegación en móvil.
- [ ] 2.2 Crear `sections/RevisaTuCV.tsx` (id `cv`, índice 03): tres tarjetas
  (qué ve el ATS, frente a una convocatoria, sugerencias de IA) y la nota "sin
  puntaje". Verificar que aparece aunque el catálogo falle.
- [ ] 2.3 `sections/Hero.tsx`: corregir errata del título, nuevo subtítulo y
  rastros ("Nota al terminar"). Verificar leyendo la página que no queda
  "área que elijas" ni "al instante".
- [ ] 2.4 `sections/ComoFunciona.tsx`: paso 1 puesto y nivel; paso 2 con la
  adaptación desde la tercera pregunta.
- [ ] 2.5 `sections/QueRecibes.tsx`: frase de la rúbrica veraz y tarjeta "Tu
  progreso" (historial, estadísticas por tema, retroalimentación acumulada).

## 3. Componentes y composición

- [ ] 3.1 `components/FranjaDatos.tsx`: puestos · preguntas · áreas · niveles;
  eliminar `PUNTOS_MAXIMOS`.
- [ ] 3.2 `components/VistaPreviaEntrevista.tsx`: encabezado por puesto y
  resultado rotulado "Al terminar la entrevista".
- [ ] 3.3 `components/HeaderLanding.tsx` y `components/FooterLanding.tsx`:
  enlaces Inicio · Cómo funciona · Qué recibes · Revisión de CV · Puestos.
  Verificar que el enlace activo se marca al recorrer cada sección.
- [ ] 3.4 `pages/LandingPage.tsx`: nuevo orden de secciones y props de
  `FranjaDatos`; `PuestosDisponibles` solo si hay puestos.

## 4. Cierre

- [ ] 4.1 `pnpm exec tsc --noEmit`, `pnpm run lint` (sin subir de 6
  advertencias) y `pnpm run build`.
- [ ] 4.2 Revisión en el navegador de `/` en escritorio y móvil, y con el
  backend apagado (las secciones del catálogo se omiten sin romper la página).
