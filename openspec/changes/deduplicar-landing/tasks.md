## 1. Componentes compartidos

- [x] 1.1 Crear `features/landing/components/TarjetaDeFuncion.tsx` y usarlo en
  `QueRecibes.tsx` (fortalezas, debilidades, sugerencias, progreso) y
  `RevisaTuCV.tsx`. Verificar con búsqueda que el marcado
  `mb-4 flex h-11 w-11` ya no aparece en esas dos secciones.
- [x] 1.2 Crear `features/landing/components/NotaAclaratoria.tsx` y usarlo en
  `QueRecibes.tsx` y `RevisaTuCV.tsx`.
- [x] 1.3 Crear `features/landing/components/AccionesDeRegistro.tsx` y usarlo en
  `Hero.tsx` y `CierreCTA.tsx`; quitar los imports de `Link`/`Boton` que queden
  sin uso.

## 2. Helper de catálogo

- [x] 2.1 Crear `lib/catalogos.ts::nombresDeAreas()` y usarlo en
  `PuestosDisponibles.tsx` y `SeleccionPuestoPage.tsx`.

## 3. Cierre

- [x] 3.1 Corregir el docstring de `EncabezadoSeccion.tsx` (secciones actuales).
- [x] 3.2 `pnpm exec tsc --noEmit`, `pnpm run lint` (sin subir de 6) y
  `pnpm run build`.
- [ ] 3.3 Revisión en el navegador: la landing y la selección de puesto se ven
  idénticas a antes.
