## 1. Ancho de la pantalla

- [x] 1.1 `features/entrevista/pages/EntrevistaPage.tsx`: quitar `max-w-3xl` del contenedor raíz y conservar `flex h-[calc(100dvh-8rem)] flex-col`.
- [x] 1.2 `components/ui/BurbujaPregunta.tsx`: sumar `lg:max-w-prose` al ancho de la burbuja.
- [x] 1.3 Confirmar que `ChatEntrevista.tsx` y `CampoRespuesta.tsx` no tienen un ancho propio que contradiga el nuevo.

## 2. Verificación

- [x] 2.1 Frontend: `pnpm exec tsc --noEmit`, `pnpm test` (con `estilos.test.ts`) y `pnpm run build`.
- [x] 2.2 Capturas del chat en 1440 px (sidebar abierto y plegado), en 1024 px y en 390 px. Comprobar que:
  - el ancho coincide con «Simular entrevista»;
  - las burbujas no pasan de unos 65 caracteres;
  - el campo y «Enviar» se ven completos.
- [x] 2.3 Ejecutar `openspec validate chat-a-ancho-completo --strict`.

## 3. Cierre (lo hace Jorge)

- [ ] 3.1 Revisar las capturas y hacer el commit; no lo hace Claude.
