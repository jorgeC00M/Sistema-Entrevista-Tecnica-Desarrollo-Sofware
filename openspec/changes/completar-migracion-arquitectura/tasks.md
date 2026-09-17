## 1. Base de datos de desarrollo

- [ ] 1.1 Confirmar que `DATABASE_URL` en `backend/.env` apunta a la base de desarrollo y no a una de producción; verificar imprimiendo solo el host, sin credenciales
- [ ] 1.2 Recrear el esquema de Neon (reset de rama en su consola, o `DROP SCHEMA public CASCADE; CREATE SCHEMA public;` por `manage.py dbshell`) y verificar que `\dt` no devuelve tablas
- [ ] 1.3 Ejecutar `python manage.py migrate` y verificar que aplica las migraciones de las cinco apps sin `InconsistentMigrationHistory`
- [ ] 1.4 Verificar que el catálogo quedó sembrado: `manage.py shell` con `Area.objects.count() == 4` y `Nivel.objects.count() == 2`
- [ ] 1.5 Crear superusuario con `manage.py createsuperuser` y verificar el acceso a `/admin/`
- [ ] 1.6 Ejecutar `python manage.py test` y verificar que los 94 tests siguen en verde

## 2. Herramienta de TypeScript

- [ ] 2.1 Instalar TypeScript con `pnpm add -D typescript` y verificar que aparece en `devDependencies` de `package.json`
- [ ] 2.2 Crear `tsconfig.json` con `strict: true`, `allowJs: true`, `jsx: "react-jsx"`, `moduleResolution: "bundler"` y el alias `@/*` → `src/*`; verificar con `pnpm exec tsc --noEmit` que no hay errores de configuración
- [ ] 2.3 Crear `tsconfig.node.json` para el archivo de configuración de Vite y referenciarlo desde `tsconfig.json`
- [ ] 2.4 Renombrar `vite.config.js` a `vite.config.ts` y añadir `resolve.alias` para `@/`; verificar que `pnpm run dev` levanta en el puerto 5173
- [ ] 2.5 Crear `src/vite-env.d.ts` declarando las variables `VITE_API_URL` y `VITE_GOOGLE_CLIENT_ID` en `ImportMetaEnv`; verificar que `import.meta.env.VITE_API_URL` tipa como `string`
- [ ] 2.6 Añadir `vercel.json` con la reescritura a `/index.html` que necesita el enrutado del lado del cliente

## 3. Contrato con la API (`src/types/`)

- [ ] 3.1 Crear `types/api.ts` con `RespuestaError` y el tipo del cuerpo de error de DRF (`{detail}` y `{campo: string[]}`); verificar que cubre las dos formas que produce `extraerMensaje`
- [ ] 3.2 Crear `types/usuario.ts` con `Usuario` y los pares de tokens, derivado de `apps/usuarios/serializers.py`
- [ ] 3.3 Crear `types/catalogos.ts` con `Area`, `Nivel` y `Catalogos` (incluido `preguntas_por_entrevista`), derivado de `apps/catalogos/serializers.py`; tipar `codigo` como `string`, no como unión literal
- [ ] 3.4 Crear `types/evaluacion.ts` con `Evaluacion` y `Estadisticas` (`promedio_por_area`, `evolucion`), derivado de `apps/evaluaciones/serializers.py` y `services.py`; incluir el campo `banda`
- [ ] 3.5 Crear `types/entrevista.ts` con `Entrevista`, `Intercambio`, `EstadoEntrevista` y las respuestas de iniciar, estado, responder y resultados, derivado de `apps/entrevistas/serializers.py` y `views.py`
- [ ] 3.6 Verificar contra el backend en marcha que cada tipo coincide con la respuesta real de su endpoint

## 4. Capa de API (`src/api/`)

- [ ] 4.1 Migrar `api/cliente.js` a `api/client.ts` con `peticion<T>(): Promise<T>` y `ErrorAPI` tipada; conservar sin cambios el reintento único ante 401 con refresco, `extraerMensaje` y el parseo tolerante de cuerpo vacío
- [ ] 4.2 Migrar `api/auth.js` a `api/auth.ts` tipando las cuatro funciones; verificar que el mapeo a `nombre_completo` en snake_case se conserva
- [ ] 4.3 Migrar `api/entrevistas.js` a `api/entrevistas.ts`; verificar que las rutas mantienen la barra final (`/api/entrevistas/`, `/api/entrevistas/:id/responder/`)
- [ ] 4.4 Crear `api/catalogos.ts` con `obtenerCatalogos()` contra `GET /api/catalogos/`
- [ ] 4.5 Migrar `api/estadisticas.js` a `api/evaluaciones.ts` con `obtenerEstadisticas()` contra `GET /api/estadisticas/`
- [ ] 4.6 Verificar que las rutas de `auth` siguen sin barra final y las de `entrevistas` con ella, comparando contra `backend/config/urls.py`

## 5. Componentes transversales

- [ ] 5.1 Migrar `components/comunes/Boton.jsx` a `components/ui/Boton.tsx` tipando las variantes y `cargando`
- [ ] 5.2 Migrar `components/comunes/Cargando.jsx` a `components/ui/Spinner.tsx`
- [ ] 5.3 Migrar `components/comunes/Alerta.jsx` a `components/ui/Alerta.tsx` conservando `role="alert"` y `role="status"`
- [ ] 5.4 Crear `components/ui/Input.tsx` extrayendo el patrón repetido de etiqueta más campo de los formularios de login y registro; verificar que conserva `htmlFor` y `autoComplete`
- [ ] 5.5 Crear `components/ui/Card.tsx` con el contenedor `rounded-lg bg-white ring-1` que hoy se repite inline
- [ ] 5.6 Migrar `components/comunes/Encabezado.jsx` a `components/layout/Header.tsx`; dejar solo dos secciones de navegación (nueva entrevista e historial) al desaparecer `/progreso`
- [ ] 5.7 No crear `Modal.tsx` ni `Sidebar.tsx`: ninguna pantalla abre un modal y el layout no tiene barra lateral; anotar la omisión en el resumen del cambio

## 6. Feature de autenticación

- [ ] 6.1 Migrar `context/AuthContext.jsx` a `features/auth/context/AuthContext.tsx` tipando el valor del proveedor; envolverlo en `useMemo` para evitar el re-render en cascada
- [ ] 6.2 Extraer el hook a `features/auth/hooks/useAuth.ts` y verificar que sigue lanzando error si se usa fuera del proveedor
- [ ] 6.3 Migrar `components/comunes/BotonGoogle.jsx` a `features/auth/components/BotonGoogle.tsx`; verificar los tres estados: botón renderizado, aviso sin `VITE_GOOGLE_CLIENT_ID`, y aviso si falla la carga del script
- [ ] 6.4 Extraer el formulario de `pages/Login.jsx` a `features/auth/components/FormularioLogin.tsx` y la página a `features/auth/pages/LoginPage.tsx`
- [ ] 6.5 Extraer el formulario de `pages/Registro.jsx` a `features/auth/components/FormularioRegistro.tsx` y la página a `features/auth/pages/RegistroPage.tsx`; conservar la validación de 8 caracteres mínimos
- [ ] 6.6 Verificar en el navegador el alta de una cuenta nueva, el cierre de sesión y el reingreso

## 7. Feature de selección de área

- [ ] 7.1 Crear `features/seleccion/hooks/useCatalogos.ts` que pida el catálogo al montar y exponga `{catalogos, cargando, error}`
- [ ] 7.2 Crear `features/seleccion/components/TarjetaArea.tsx` a partir del `OpcionSeleccionable` local de `SeleccionArea.jsx`
- [ ] 7.3 Crear `features/seleccion/components/SelectorNivel.tsx` para el grupo de niveles
- [ ] 7.4 Crear `features/seleccion/pages/SeleccionAreaPage.tsx` consumiendo el hook; **eliminar las constantes `AREAS` y `NIVELES` hardcodeadas**
- [ ] 7.5 Tomar el total de preguntas de `preguntas_por_entrevista` en lugar del texto fijo "5 preguntas"
- [ ] 7.6 Mostrar un mensaje de error si el catálogo no carga, en lugar de una lista vacía
- [ ] 7.7 Verificar el escenario de la spec: desactivar un área desde `/admin/`, recargar la pantalla y comprobar que desaparece de las opciones

## 8. Feature de entrevista

- [ ] 8.1 Migrar `components/entrevista/Mensaje.jsx` a `features/entrevista/components/BurbujaPregunta.tsx`
- [ ] 8.2 Migrar `components/entrevista/CampoRespuesta.jsx` a `features/entrevista/components/CampoRespuesta.tsx`; conservar el envío con Enter y el salto de línea con Shift+Enter
- [ ] 8.3 Migrar `components/entrevista/IndicadorProgreso.jsx` a `features/entrevista/components/BarraProgreso.tsx`
- [ ] 8.4 Extraer el estado de `pages/Entrevista.jsx` a `features/entrevista/hooks/useEntrevista.ts`; **conservar íntegras** la reconstrucción del historial al montar, el `append` optimista y su rollback ante error, y el flag `cancelado` que evita el `setState` tras desmontar
- [ ] 8.5 Crear `features/entrevista/components/ChatEntrevista.tsx` con la lista de mensajes y el indicador "Evaluando tu respuesta…"
- [ ] 8.6 Crear `features/entrevista/pages/EntrevistaPage.tsx` componiendo el hook y los componentes
- [ ] 8.7 Verificar la reanudación: iniciar una entrevista, responder dos preguntas, recargar la página y comprobar que vuelve a la pregunta pendiente con el historial completo
- [ ] 8.8 Verificar el rollback: con el backend detenido, enviar una respuesta y comprobar que el mensaje optimista desaparece y aparece el botón de reintentar con el texto conservado

## 9. Feature de resultados

- [ ] 9.1 Migrar `components/resultados/TarjetaEvaluacion.jsx` a `features/resultados/components/PanelCualitativo.tsx` (fortalezas, debilidades y sugerencias)
- [ ] 9.2 Crear `features/resultados/components/TarjetaResumen.tsx` con la cabecera de puntuación promedio
- [ ] 9.3 Crear `features/resultados/components/TablaPuntuaciones.tsx` con la puntuación por pregunta; usar el campo `banda` del backend en lugar de repetir los umbrales 80/60 en el cliente
- [ ] 9.4 Crear `features/resultados/pages/ResultadosPage.tsx`
- [ ] 9.5 Verificar completando una entrevista de 5 preguntas que el panel muestra las cinco evaluaciones y el promedio

## 10. Feature de historial y progreso (fusionadas)

- [ ] 10.1 Migrar `pages/Historial.jsx` a `features/historial/components/ListaEntrevistas.tsx`; conservar el enlace condicional según estado y el formato de fecha `es-BO`
- [ ] 10.2 Migrar `components/resultados/GraficoEvolucion.jsx` a `features/historial/components/GraficoProgreso.tsx`; conservar el SVG accesible con `role="img"` y `aria-label`
- [ ] 10.3 Migrar `components/resultados/ComparativaAreas.jsx` a `features/historial/components/ComparativaAreas.tsx`
- [ ] 10.4 Crear `features/historial/pages/HistorialPage.tsx` que combine listado, gráfico y comparativa en una sola vista, pidiendo el historial y las estadísticas en paralelo
- [ ] 10.5 Implementar los tres estados vacíos de la spec: sin entrevistas, una sola entrevista finalizada (aviso en lugar de gráfico), y fallo de carga
- [ ] 10.6 Eliminar `pages/Progreso.jsx`
- [ ] 10.7 Verificar los escenarios de la spec de `historial-progreso` recorriendo la pantalla con cero, una y dos entrevistas finalizadas

## 11. Enrutado y raíz

- [ ] 11.1 Migrar `routes/RutaProtegida.jsx` a `router/RutaProtegida.tsx`, manteniéndolo como *layout route* con `<Outlet/>`
- [ ] 11.2 Crear `router/index.tsx` con las rutas; añadir la redirección explícita de `/progreso` a `/historial` y conservar el comodín hacia `/`
- [ ] 11.3 Migrar `App.jsx` a `App.tsx` delegando las rutas en `router/index.tsx`
- [ ] 11.4 Migrar `main.jsx` a `main.tsx`
- [ ] 11.5 Verificar que navegar a `/progreso` aterriza en `/historial` y no en la pantalla de nueva entrevista

## 12. Cierre

- [ ] 12.1 Quitar `allowJs` de `tsconfig.json` y verificar que `pnpm exec tsc --noEmit` pasa sin errores
- [ ] 12.2 Borrar los directorios vacíos `src/pages/`, `src/components/comunes/`, `src/components/entrevista/`, `src/components/resultados/`, `src/context/` y `src/routes/`; verificar que no queda ningún `.jsx` con `git ls-files "*.jsx"`
- [ ] 12.3 Eliminar `public/icons.svg` si sigue sin referenciarse desde ningún componente
- [ ] 12.4 Sustituir el `README.md` boilerplate de create-vite por uno que describa el proyecto y los comandos de pnpm
- [ ] 12.5 Actualizar la sección de frontend de `CLAUDE.md` con la estructura por features y el hecho de que el catálogo se lee de la API
- [ ] 12.6 Ejecutar `pnpm run lint` y `pnpm run build` y verificar que ambos terminan sin errores
- [ ] 12.7 Recorrido completo en el navegador con `IA_PROVEEDOR=fake`: registro, login, selección, cinco preguntas, resultados, historial con gráfico, cierre de sesión
