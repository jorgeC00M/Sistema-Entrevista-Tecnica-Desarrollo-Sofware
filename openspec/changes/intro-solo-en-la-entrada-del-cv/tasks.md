## 1. Pantalla

- [x] 1.1 En `frontend/src/features/curriculum/pages/CurriculumPage.tsx`:
  - agregar `const enResultado = cargandoAnalisis || Boolean(visible && analisis)`;
  - renderizar el `<p>` de introducción solo con `!enResultado` (D1);
  - mantener el `h1` en todas las vistas (D2).

## 2. Documentación

- [x] 2.1 `CLAUDE.md`, sección «The CV screen»: una frase que diga que la introducción solo aparece en la entrada (`/mi-cv`) y no en un análisis.

## 3. Verificación

- [x] 3.1 Los chequeos del frontend:
  - `pnpm exec tsc --noEmit`;
  - `pnpm test`;
  - `pnpm run lint`, que debe quedar en 5 advertencias;
  - `pnpm run build`.
- [ ] 3.2 **Pruebas manuales:**
  - `/mi-cv` muestra el párrafo;
  - tras analizar, `/mi-cv/:id` no lo muestra;
  - recargar `/mi-cv/:id` no hace parpadear el párrafo;
  - un id inexistente muestra la entrada con el párrafo.
- [ ] 3.3 No hacer commit. El usuario lo hará tras revisar.
