## Why

Al iniciar sesión, el estudiante cae en «Simular entrevista» sin ver cuánto practicó, cómo le fue la última vez ni qué le conviene hacer ahora. Las gráficas de evolución están al fondo del Historial, mezcladas con la tabla. Falta un punto de partida que resuma y oriente, como el tablero de cualquier aplicación.

## What Changes

- **Nueva pantalla «Inicio»** en `/inicio`. Es la primera vista con sesión (`/` lleva ahí) y el primer destino del menú, arriba de «Continuar» y «Simular entrevista». Muestra, en este orden:
  1. el saludo «Hola, <nombre>»;
  2. **cuatro cifras**:
     - entrevistas finalizadas, con el detalle «+N sin terminar»;
     - preguntas respondidas;
     - tiempo de práctica, que suma solo las finalizadas;
     - análisis de CV, con el detalle «X generales · Y con oferta»;
  3. **«Tu siguiente paso»**: una sola recomendación con su botón, elegida por reglas entre 6 casos, de la entrevista en curso a «Repasa <área>»;
  4. **«Tu última entrevista»**: la última finalizada, con su nota, banda y prioridad;
  5. **«Tu CV»**: el estado del último análisis, los campos leídos y el puesto sugerido;
  6. **«Tu evolución»**: las 3 tarjetas por nivel, que se **mudan** del Historial.
- **El Historial** pasa a llamarse «Historial» (antes «Historial y progreso») y conserva solo la tabla, el buscador y el filtro de nivel.
- **Todo se calcula en el cliente**, con lo que la app ya carga. No hay llamadas a la IA ni endpoints nuevos.

## Capabilities

### New Capabilities
- `inicio-con-resumen`: cubre la pantalla Inicio, con sus cifras, el siguiente paso, la última entrevista, el último CV y la evolución; su lugar en el menú y en la entrada con sesión; y el Historial sin gráficas.

### Modified Capabilities
- (ninguna en `openspec/specs/`). Las deltas sin archivar que mencionan «Historial y progreso» o la evolución en el Historial (`sidebar-por-etapas`, `buscador-y-evolucion-en-historial`) se anotan.

## Impact

- **Frontend:**
  - archivos nuevos:
    - en `features/inicio/`: la página, el hook `useInicio`, `inicio.ts` con su test y 4 componentes;
    - `components/ui/TarjetaDeCifra.tsx`;
  - se mudan `EvolucionPorNivel`, `GraficoDeNivel`, `DetalleDePunto` y la parte de evolución de `historial.ts`, con sus tests, a `features/inicio/`;
  - se modifican:
    - `router/index.tsx` y `features/landing/pages/EntradaRaiz.tsx`;
    - `components/layout/destinos.ts`, `Sidebar/Sidebar.tsx` y `titulosDeRuta.ts`;
    - `features/historial/pages/HistorialPage.tsx` y `hooks/useFiltrosDeHistorial.ts`.
- **Backend:** sin cambios.
- **Docs:** `CLAUDE.md`. La tesis la actualiza Jorge: el menú y la pantalla Inicio.
