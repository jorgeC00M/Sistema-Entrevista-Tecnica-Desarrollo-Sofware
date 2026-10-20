## 1. Lógica

- [x] 1.1 En `seleccion.ts`, cambiar el orden de `campoFaltante` a puesto → nivel → tecnología (D2). En `seleccion.test.ts`, el caso "con puesto pide el nivel" y el caso "con puesto y nivel pide la tecnología", más que Full Stack con solo frontend sigue pidiendo la tecnología. Se verifica con `pnpm test` en verde.

## 2. Disposición

- [x] 2.1 En `FormularioDeEntrevista.tsx`, ordenar los campos como Puesto y Nivel (una columna cada uno) y luego Tecnología (`sm:col-span-2`, o dos campos de una columna), con `items-start` en la rejilla (D1, D3). Actualizar el comentario que explica que el primer `<select>` vacío es el que falta. Se verifica con `pnpm exec tsc --noEmit`, `pnpm run lint` (sin avisos nuevos) y `pnpm run build` en verde.

## 3. Documentación y prueba manual

- [x] 3.1 Actualizar en `CLAUDE.md` el párrafo del formulario: el orden de los campos Puesto, Nivel, Tecnología, con Puesto y Nivel en una fila. Se verifica releyendo el texto contra el código.
- [ ] 3.2 Prueba manual: a 1280 px, Puesto y Nivel en la misma fila y a la misma altura; Full Stack con dos campos de tecnología abajo; a 375 px, todo apilado; el Tab recorre Puesto, Nivel, Tecnología. Si no se puede ejecutar, queda **sin marcar**.
