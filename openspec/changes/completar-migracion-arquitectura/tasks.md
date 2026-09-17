## 1. Base de datos de desarrollo (PostgreSQL local)

Desarrollo trabaja contra PostgreSQL local administrado con pgAdmin4. Neon queda
reservado para producción y se configura en el grupo 13.

- [x] 1.1 Confirmar que `DATABASE_URL` en `backend/.env` apunta a la base local y no a una remota; verificar imprimiendo solo host y nombre de base, sin credenciales
- [x] 1.2 Respaldar la base local con `pg_dump` antes de tocar el esquema y verificar que el archivo existe en `backups/`
- [x] 1.3 Añadir `backups/`, `*.sql` y `*.dump` al `.gitignore` raíz; verificar con `git check-ignore` que el volcado no se versiona, porque contiene correos y hashes
- [x] 1.4 Recrear el esquema con `DROP SCHEMA public CASCADE; CREATE SCHEMA public;` y verificar que no quedan tablas
- [x] 1.5 Ejecutar `python manage.py migrate` y verificar que aplica las migraciones de las cinco apps sin `InconsistentMigrationHistory`
- [x] 1.6 Verificar que el catálogo quedó sembrado por migración: `Area.objects.count() == 4` y `Nivel.objects.count() == 2`
- [x] 1.7 Crear superusuario con `manage.py createsuperuser` y verificar el acceso a `/admin/`
- [x] 1.8 Ejecutar `python manage.py test` y verificar que los 94 tests pasan contra PostgreSQL local

## 2. Herramienta de TypeScript

- [x] 2.1 Instalar TypeScript con `pnpm add -D typescript` y verificar que aparece en `devDependencies` de `package.json`
- [x] 2.2 Crear `tsconfig.json` con `strict: true`, `allowJs: true`, `jsx: "react-jsx"`, `moduleResolution: "bundler"` y el alias `@/*` → `src/*`; verificar con `pnpm exec tsc --noEmit` que no hay errores de configuración
- [x] 2.3 Crear `tsconfig.node.json` para el archivo de configuración de Vite y referenciarlo desde `tsconfig.json`
- [x] 2.4 Renombrar `vite.config.js` a `vite.config.ts` y añadir `resolve.alias` para `@/`; verificar que `pnpm run dev` levanta en el puerto 5173
- [x] 2.5 Crear `src/vite-env.d.ts` declarando las variables `VITE_API_URL` y `VITE_GOOGLE_CLIENT_ID` en `ImportMetaEnv`; verificar que `import.meta.env.VITE_API_URL` tipa como `string`
- [x] 2.6 Añadir `vercel.json` con la reescritura a `/index.html` que necesita el enrutado del lado del cliente

## 3. Contrato con la API (`src/types/`)

- [x] 3.1 Crear `types/api.ts` con `RespuestaError` y el tipo del cuerpo de error de DRF (`{detail}` y `{campo: string[]}`); verificar que cubre las dos formas que produce `extraerMensaje`
- [x] 3.2 Crear `types/usuario.ts` con `Usuario` y los pares de tokens, derivado de `apps/usuarios/serializers.py`
- [x] 3.3 Crear `types/catalogos.ts` con `Area`, `Nivel` y `Catalogos` (incluido `preguntas_por_entrevista`), derivado de `apps/catalogos/serializers.py`; tipar `codigo` como `string`, no como unión literal
- [x] 3.4 Crear `types/evaluacion.ts` con `Evaluacion` y `Estadisticas` (`promedio_por_area`, `evolucion`), derivado de `apps/evaluaciones/serializers.py` y `services.py`; incluir el campo `banda`
- [x] 3.5 Crear `types/entrevista.ts` con `Entrevista`, `Intercambio`, `EstadoEntrevista` y las respuestas de iniciar, estado, responder y resultados, derivado de `apps/entrevistas/serializers.py` y `views.py`
- [x] 3.6 Verificar contra el backend en marcha que cada tipo coincide con la respuesta real de su endpoint

## 4. Capa de API (`src/api/`)

- [x] 4.1 Migrar `api/cliente.js` a `api/client.ts` con `peticion<T>(): Promise<T>` y `ErrorAPI` tipada; conservar sin cambios el reintento único ante 401 con refresco, `extraerMensaje` y el parseo tolerante de cuerpo vacío
- [x] 4.2 Migrar `api/auth.js` a `api/auth.ts` tipando las cuatro funciones; verificar que el mapeo a `nombre_completo` en snake_case se conserva
- [x] 4.3 Migrar `api/entrevistas.js` a `api/entrevistas.ts`; verificar que las rutas mantienen la barra final (`/api/entrevistas/`, `/api/entrevistas/:id/responder/`)
- [x] 4.4 Crear `api/catalogos.ts` con `obtenerCatalogos()` contra `GET /api/catalogos/`
- [x] 4.5 Migrar `api/estadisticas.js` a `api/evaluaciones.ts` con `obtenerEstadisticas()` contra `GET /api/estadisticas/`
- [x] 4.6 Verificar que las rutas de `auth` siguen sin barra final y las de `entrevistas` con ella, comparando contra `backend/config/urls.py`

## 5. Componentes transversales

- [x] 5.1 Migrar `components/comunes/Boton.jsx` a `components/ui/Boton.tsx` tipando las variantes y `cargando`
- [x] 5.2 Migrar `components/comunes/Cargando.jsx` a `components/ui/Spinner.tsx`
- [x] 5.3 Migrar `components/comunes/Alerta.jsx` a `components/ui/Alerta.tsx` conservando `role="alert"` y `role="status"`
- [x] 5.4 Crear `components/ui/Input.tsx` extrayendo el patrón repetido de etiqueta más campo de los formularios de login y registro; verificar que conserva `htmlFor` y `autoComplete`
- [x] 5.5 Crear `components/ui/Card.tsx` con el contenedor `rounded-lg bg-white ring-1` que hoy se repite inline
- [x] 5.6 Migrar `components/comunes/Encabezado.jsx` a `components/layout/Header.tsx`; dejar solo dos secciones de navegación (nueva entrevista e historial) al desaparecer `/progreso`
- [x] 5.7 No crear `Modal.tsx` ni `Sidebar.tsx`: ninguna pantalla abre un modal y el layout no tiene barra lateral; anotar la omisión en el resumen del cambio

## 6. Feature de autenticación

- [x] 6.1 Migrar `context/AuthContext.jsx` a `features/auth/context/AuthContext.tsx` tipando el valor del proveedor; envolverlo en `useMemo` para evitar el re-render en cascada
- [x] 6.2 Extraer el hook a `features/auth/hooks/useAuth.ts` y verificar que sigue lanzando error si se usa fuera del proveedor
- [x] 6.3 Migrar `components/comunes/BotonGoogle.jsx` a `features/auth/components/BotonGoogle.tsx`; verificar los tres estados: botón renderizado, aviso sin `VITE_GOOGLE_CLIENT_ID`, y aviso si falla la carga del script
- [x] 6.4 Extraer el formulario de `pages/Login.jsx` a `features/auth/components/FormularioLogin.tsx` y la página a `features/auth/pages/LoginPage.tsx`
- [x] 6.5 Extraer el formulario de `pages/Registro.jsx` a `features/auth/components/FormularioRegistro.tsx` y la página a `features/auth/pages/RegistroPage.tsx`; conservar la validación de 8 caracteres mínimos
- [ ] 6.6 Verificar en el navegador el alta de una cuenta nueva, el cierre de sesión y el reingreso

## 7. Feature de selección de área

El incremento 2 ya se cerró sobre `pages/SeleccionArea.jsx`: la pantalla consume
`GET /api/catalogos/`, no quedan constantes hardcodeadas y el total de preguntas
sale del backend. Este grupo ya no inventa esa lógica — la mueve a `features/` y
la tipa.

- [x] 7.1 Crear `features/seleccion/hooks/useCatalogos.ts` que pida el catálogo al montar y exponga `{catalogos, cargando, error}`
- [x] 7.2 Crear `features/seleccion/components/TarjetaArea.tsx` a partir del `OpcionSeleccionable` local de `SeleccionArea.jsx`
- [x] 7.3 Crear `features/seleccion/components/SelectorNivel.tsx` para el grupo de niveles
- [x] 7.4 Mover `pages/SeleccionArea.jsx` a `features/seleccion/pages/SeleccionAreaPage.tsx` tipando el catálogo; la carga y el borrado de constantes ya están hechos
- [x] 7.5 Verificar que el total de preguntas sigue saliendo de `preguntas_por_entrevista` tras la migración
- [x] 7.6 Verificar que el error de carga del catálogo sigue mostrándose tras la migración
- [ ] 7.7 Verificar en el navegador el escenario de la spec: desactivar un área desde `/admin/`, recargar la pantalla y comprobar que desaparece (el contrato ya está verificado contra la API)

## 8. Feature de entrevista

- [x] 8.1 Migrar `components/entrevista/Mensaje.jsx` a `features/entrevista/components/BurbujaPregunta.tsx`
- [x] 8.2 Migrar `components/entrevista/CampoRespuesta.jsx` a `features/entrevista/components/CampoRespuesta.tsx`; conservar el envío con Enter y el salto de línea con Shift+Enter
- [x] 8.3 Migrar `components/entrevista/IndicadorProgreso.jsx` a `features/entrevista/components/BarraProgreso.tsx`
- [x] 8.4 Extraer el estado de `pages/Entrevista.jsx` a `features/entrevista/hooks/useEntrevista.ts`; **conservar íntegras** la reconstrucción del historial al montar, el `append` optimista y su rollback ante error, y el flag `cancelado` que evita el `setState` tras desmontar
- [x] 8.5 Crear `features/entrevista/components/ChatEntrevista.tsx` con la lista de mensajes y el indicador "Evaluando tu respuesta…"
- [x] 8.6 Crear `features/entrevista/pages/EntrevistaPage.tsx` componiendo el hook y los componentes
- [ ] 8.7 Verificar la reanudación: iniciar una entrevista, responder dos preguntas, recargar la página y comprobar que vuelve a la pregunta pendiente con el historial completo
- [ ] 8.8 Verificar el rollback: con el backend detenido, enviar una respuesta y comprobar que el mensaje optimista desaparece y aparece el botón de reintentar con el texto conservado

## 9. Feature de resultados

- [x] 9.1 Migrar `components/resultados/TarjetaEvaluacion.jsx` a `features/resultados/components/PanelCualitativo.tsx` (fortalezas, debilidades y sugerencias)
- [x] 9.2 Crear `features/resultados/components/TarjetaResumen.tsx` con la cabecera de puntuación promedio
- [x] 9.3 Crear `features/resultados/components/TablaPuntuaciones.tsx` con la puntuación por pregunta; usar el campo `banda` del backend en lugar de repetir los umbrales 80/60 en el cliente
- [x] 9.4 Crear `features/resultados/pages/ResultadosPage.tsx`
- [ ] 9.5 Verificar completando una entrevista de 5 preguntas que el panel muestra las cinco evaluaciones y el promedio

## 10. Feature de historial y progreso (fusionadas)

- [x] 10.1 Migrar `pages/Historial.jsx` a `features/historial/components/ListaEntrevistas.tsx`; conservar el enlace condicional según estado y el formato de fecha `es-BO`
- [x] 10.2 Migrar `components/resultados/GraficoEvolucion.jsx` a `features/historial/components/GraficoProgreso.tsx`; conservar el SVG accesible con `role="img"` y `aria-label`
- [x] 10.3 Migrar `components/resultados/ComparativaAreas.jsx` a `features/historial/components/ComparativaAreas.tsx`
- [x] 10.4 Crear `features/historial/pages/HistorialPage.tsx` que combine listado, gráfico y comparativa en una sola vista, pidiendo el historial y las estadísticas en paralelo
- [x] 10.5 Implementar los tres estados vacíos de la spec: sin entrevistas, una sola entrevista finalizada (aviso en lugar de gráfico), y fallo de carga
- [x] 10.6 Eliminar `pages/Progreso.jsx`
- [ ] 10.7 Verificar los escenarios de la spec de `historial-progreso` recorriendo la pantalla con cero, una y dos entrevistas finalizadas

## 11. Enrutado y raíz

- [x] 11.1 Migrar `routes/RutaProtegida.jsx` a `router/RutaProtegida.tsx`, manteniéndolo como *layout route* con `<Outlet/>`
- [x] 11.2 Crear `router/index.tsx` con las rutas; añadir la redirección explícita de `/progreso` a `/historial` y conservar el comodín hacia `/`
- [x] 11.3 Migrar `App.jsx` a `App.tsx` delegando las rutas en `router/index.tsx`
- [x] 11.4 Migrar `main.jsx` a `main.tsx`
- [ ] 11.5 Verificar que navegar a `/progreso` aterriza en `/historial` y no en la pantalla de nueva entrevista

## 12. Cierre

- [x] 12.1 Quitar `allowJs` de `tsconfig.json` y verificar que `pnpm exec tsc --noEmit` pasa sin errores
- [x] 12.2 Borrar los directorios vacíos `src/pages/`, `src/components/comunes/`, `src/components/entrevista/`, `src/components/resultados/`, `src/context/` y `src/routes/`; verificar que no queda ningún `.jsx` con `git ls-files "*.jsx"`
- [x] 12.3 Eliminar `public/icons.svg` si sigue sin referenciarse desde ningún componente
- [x] 12.4 Sustituir el `README.md` boilerplate de create-vite por uno que describa el proyecto y los comandos de pnpm
- [x] 12.5 Actualizar la sección de frontend de `CLAUDE.md` con la estructura por features y el hecho de que el catálogo se lee de la API
- [x] 12.6 Ejecutar `pnpm run lint` y `pnpm run build` y verificar que ambos terminan sin errores
- [ ] 12.7 Recorrido completo en el navegador con `IA_PROVEEDOR=fake`: registro, login, selección, cinco preguntas, resultados, historial con gráfico, cierre de sesión

## 13. Despliegue (incremento 5)

- [ ] 13.1 Crear la base de producción en Neon y guardar su cadena de conexión como `DATABASE_URL` en el panel de Render; no se toca el `.env` local
- [ ] 13.2 Configurar en Render `DJANGO_SETTINGS_MODULE=config.settings.production`, más `SECRET_KEY`, `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS` y `ANTHROPIC_API_KEY`; verificar que el build falla si falta alguna, que es el comportamiento buscado
- [ ] 13.3 Configurar el build command `./build.sh` y el start command `gunicorn config.wsgi:application`; verificar que el despliegue aplica migraciones y siembra el catálogo solo
- [ ] 13.4 Desplegar el frontend en Vercel con `VITE_API_URL` apuntando al dominio de Render y verificar que la aplicación carga
- [ ] 13.5 Añadir el dominio real de Vercel a `CORS_ALLOWED_ORIGINS` en Render y verificar que el login funciona desde producción
- [ ] 13.6 Recorrido completo en producción con `IA_PROVEEDOR=anthropic`: registro, selección, cinco preguntas, resultados e historial
