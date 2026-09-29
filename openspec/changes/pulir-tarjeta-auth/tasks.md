## 0. Rama

- [x] 0.1 Continuar en `adoptar-consola-tecnica` (misma rama del restyle anterior); confirmar con `git branch --show-current` antes de tocar nada

## 1. Icono de identificación

- [x] 1.1 Agregar `identificacion` a `components/ui/Icono.tsx` con el trazo real de Tabler `id` (descargado, no aproximado a mano); verificar con `pnpm exec tsc --noEmit` que `NombreDeIcono` lo incluye

## 2. Variante "relleno" de `Input`

- [x] 2.1 Agregar `variante?: 'linea' | 'relleno'` a `components/ui/Input.tsx`, default `'linea'` (el comportamiento actual, sin cambios); `'relleno'` agrega `bg-white/70` al `<input>`; verificar que ningún otro uso de `Input` en el repo pasa la prop y por tanto no cambia de aspecto (`grep -rn "<Input" frontend/src` y revisar)
- [x] 2.2 Verificar contraste AA (calculado: texto tinta-950 sobre el fondo compuesto blanco/70% + tarjeta tinta-100/60% + página tinta-50 da ~18.3:1, muy por encima de AA; no hay `placeholder` en ningún campo de estos formularios, así que el contraste del placeholder del navegador no aplica aquí) del texto (`text-tinta-950`) y del placeholder sobre `bg-white/70`; documentar el resultado

## 3. Tarjeta fundida con el fondo

- [x] 3.1 Crear `features/auth/components/TarjetaAuth.tsx`: fondo de página `bg-tinta-50`, tarjeta `bg-tinta-100/60 backdrop-blur border border-tinta-100 shadow-xl rounded-superficie`, logo (`Icono nombre="marca"`), título y subtítulo (props), `children` para el formulario, divisor "o", `BotonGoogle` (prop `onCredential`), enlace de cambio de vista (props `pregunta`, `textoEnlace`, `rutaEnlace`); verificar que compila y que no quedó ningún `<a href="#">` roto en el resto del árbol
- [x] 3.2 Migrar `LoginPage.tsx` a usar `TarjetaAuth`, pasando `FormularioLogin` como `children`; verificar que el comportamiento de `useAuth`/`iniciarSesion`/`iniciarSesionConGoogle` no cambió (mismo flujo, misma navegación, mismos mensajes de error)
- [x] 3.3 Migrar `RegistroPage.tsx` a usar `TarjetaAuth`, pasando `FormularioRegistro` como `children`; verificar que `registrar`/`iniciarSesionConGoogle` no cambiaron
- [ ] 3.4 Confirmar visualmente (recorrido con `pnpm run dev`) que login y registro comparten exactamente el mismo chrome de tarjeta — ya no pueden divergir porque es un solo componente

## 4. Campos del formulario

- [x] 4.1 `FormularioLogin.tsx`: agregar `variante="relleno"` a sus dos `Input`; verificar que se ven como chips translúcidos sobre la tarjeta
- [x] 4.2 `FormularioRegistro.tsx`: agregar `variante="relleno"` a sus 5 `Input`; cambiar el ícono de `carnet` de `usuario` a `identificacion`; verificar que Nombre completo y Carnet ya no comparten el mismo ícono

## 5. Cierre

- [x] 5.1 Ejecutar `pnpm exec tsc --noEmit`, `pnpm run lint` y `pnpm run build`; deben terminar sin errores ni warnings nuevos respecto a la línea base de dos advertencias conocidas
- [x] 5.2 Actualizar `docs/arquitectura.md`: documentar `Input`'s `variante` igual que ya se documentó `forma` de `Boton`, y listar `TarjetaAuth` en la tabla de componentes si corresponde
- [ ] 5.3 Recorrido funcional de login y registro con `IA_PROVEEDOR=fake` o contra el backend local: mismos payloads, mismos mensajes de error, misma redirección tras éxito
- [x] 5.4 Commit en `adoptar-consola-tecnica` con un mensaje que describa el pulido (fondo/tarjeta fundidos, campos con relleno, ícono de carnet, layout compartido)
