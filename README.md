# Sistema de Entrevista Técnica para Desarrollo de Software

Proyecto de Grado (Ingeniería de Sistemas, UMSS).

Es un sistema web para simular entrevistas técnicas. Un agente de IA conduce una entrevista de 5 preguntas para el puesto y el nivel que se eligen, y califica cada respuesta con una rúbrica fija. También analiza el CV como lo leería un ATS.

- **Backend:** Django REST con PostgreSQL.
- **Frontend:** React con TypeScript, Vite y Tailwind.

## Backend (`backend/`)

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements/local.txt
copy .env.example .env          # completar las variables
python manage.py migrate
python manage.py runserver      # http://127.0.0.1:8000
python manage.py test           # requiere PostgreSQL (DATABASE_URL)
```

**Configuración por entorno** (`config/settings/`):

| Archivo | Para qué |
|---|---|
| `base.py` | Lo común a todos los entornos |
| `local.py` | Desarrollo (`manage.py` lo usa por defecto) |
| `production.py` | Render |
| `carga.py` | Solo la prueba de carga de `tests/carga/` |

**Base de datos:** PostgreSQL con Neon, a través de `DATABASE_URL` con `sslmode=require`. Se conecta con `dj-database-url` y `psycopg` 3. Si `DATABASE_URL` está vacío, se usa SQLite para pruebas rápidas.

**IA:** `IA_PROVEEDOR` elige el proveedor (`fake` por defecto, que no gasta cuota). Se pueden poner varios separados por comas para tener respaldo. Las demás variables están en `.env.example`.

**Producción:**
- Build command: `./build.sh`
- Start command: `gunicorn config.wsgi:application --workers 2 --threads 8 --timeout 120`

## Frontend (`frontend/`)

El gestor de paquetes es **pnpm**.

```powershell
pnpm install
copy .env.example .env
pnpm run dev             # http://localhost:5173
pnpm test                # Vitest
pnpm exec tsc --noEmit   # tipos
pnpm run lint            # oxlint
pnpm run build
```

## Documentación

- `openspec/`: propuesta, especificación, diseño y tareas de cada cambio.
- `docs/`: el perfil del proyecto de grado.
