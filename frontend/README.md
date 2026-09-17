# Frontend — Simulador de Entrevistas Técnicas

React 19 + TypeScript + Vite + Tailwind 4. Consume la API REST de Django.

## Comandos

El gestor de paquetes es **pnpm** (`pnpm-lock.yaml` es el archivo de bloqueo versionado).

```bash
pnpm install
pnpm run dev        # http://localhost:5173
pnpm run build
pnpm run lint       # oxlint, no ESLint
pnpm exec tsc --noEmit   # comprobación de tipos
```

No hay runner de tests configurado.

## Variables de entorno

Copiar `.env.example` a `.env`:

- `VITE_API_URL` — URL del backend. En desarrollo, `http://127.0.0.1:8000`.
- `VITE_GOOGLE_CLIENT_ID` — el mismo valor que `GOOGLE_OAUTH_CLIENT_ID` del backend. Si queda vacío, el botón de Google se oculta con un aviso en vez de romper la pantalla.

## Estructura

```
src/
├── api/          # un módulo por endpoint sobre client.ts
├── types/        # contrato con la API, derivado de los serializers
├── features/     # auth, seleccion, entrevista, resultados, historial
├── components/   # ui/ y layout/: solo lo que usan varias features
├── router/       # rutas y guard
└── styles/
```

Regla para ubicar un componente: si lo usa una sola feature, vive dentro de ella; en cuanto lo usa una segunda, sube a `components/ui/`.

`src/api/client.ts` es el único lugar que toca `fetch`. Adjunta el JWT, renueva el token y reintenta una vez ante un 401, y normaliza los errores en `ErrorAPI`.

Las áreas, los niveles y el número de preguntas por entrevista se leen de `GET /api/catalogos/`. El cliente no mantiene su propia copia: dar de baja un área en el admin la retira de la interfaz.
