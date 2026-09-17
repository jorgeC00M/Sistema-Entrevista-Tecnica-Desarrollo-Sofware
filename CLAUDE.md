# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Sistema web de simulación de entrevistas técnicas (Proyecto de Grado, Ingeniería de Sistemas, UMSS). Django REST backend + React frontend. A conversational AI agent conducts a 5-question technical interview by area/level and evaluates each answer against a fixed rubric. The academic requirements this implements live in `docs/Copia de Copia de PerfilJorgeV3.docx.md` (the thesis profile) — consult it for the "why" behind the data model (section 3.4.1) and scope decisions.

## Commands

### Backend (`backend/`)

```powershell
.\.venv\Scripts\Activate.ps1        # Windows PowerShell; if blocked: Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver          # http://127.0.0.1:8000
```

Tests use Django's test runner (not plain `pytest`/`unittest` — several test modules import Django models and need `django.setup()`):

```powershell
python manage.py test tests                                          # full suite
python manage.py test tests.test_servicio_entrevista                 # one module
python manage.py test tests.test_idempotencia.IdempotenciaTest.test_reintento_tras_fallo_no_duplica_intercambio_ni_evaluacion  # one test
```

Requires a real PostgreSQL connection (`DATABASE_URL` in `.env`) — Django creates/destroys a temporary test database each run. SQLite works for quick local hacking (`DATABASE_URL` unset) but `evaluacion_json` is a `JSONField` that only behaves correctly (native `jsonb`) on Postgres, so don't trust SQLite for anything touching that field.

### Frontend (`frontend/`)

Package manager is **pnpm**, not npm (`pnpm-lock.yaml` is the committed lockfile).

```powershell
pnpm install
pnpm run dev        # http://localhost:5173
pnpm run build
pnpm run lint        # oxlint, not ESLint
```

No frontend test runner is configured.

### Environment

Both `backend/.env` and `frontend/.env` are gitignored; copy from the corresponding `.env.example`. Key variables:

- `IA_PROVEEDOR` (backend) — `fake` | `gemini` | `anthropic`. Defaults to `fake` (deterministic, no network) so nothing ever burns API quota by accident. `anthropic` is the documented production engine; `gemini` is an internal fallback not mentioned in the academic profile.
- `DATABASE_URL` — empty selects SQLite, set selects Postgres via `dj_database_url`.
- `GOOGLE_OAUTH_CLIENT_ID` (backend) / `VITE_GOOGLE_CLIENT_ID` (frontend) — same value on both sides. If either is unset, that half degrades on purpose (backend returns 503, frontend hides the Google button) instead of erroring.
- `ANTHROPIC_API_KEY`, `GEMINI_API_KEY` — only needed when `IA_PROVEEDOR` selects that provider.

## Architecture

### Layering: views never talk to the AI provider directly

`entrevistas/views.py` → `entrevistas/services/entrevista.py` (the orchestrator, all business logic) → `entrevistas/services/ia/factory.py::get_proveedor()` → one of three interchangeable `ProveedorIA` implementations (`entrevistas/services/ia/{fake,gemini_adapter,anthropic_adapter}.py`), selected at runtime by `IA_PROVEEDOR`. Nothing outside `factory.py` imports a concrete adapter by name. `services/ia/` has zero Django dependency — it's tested independently and can be exercised with plain Python.

### Entrevistador and evaluador are separate roles, deliberately isolated

Two distinct prompts live in `entrevistas/services/ia/prompts/`:
- `entrevistador.py` generates the next question. It receives a **compressed summary** of prior turns (`TemaEvaluado`: topic + score only, from `schemas.py`) — never the full Q&A history — to keep prompt size bounded regardless of interview length.
- `evaluador.py` scores one answer against a fixed rubric. It is a pure function of (area, nivel, pregunta, respuesta) — it never receives conversation history, so the same answer always scores the same way independent of when it was given.

`PREGUNTAS_POR_ENTREVISTA` (in `schemas.py`) is the single source of truth for interview length (currently 5); the frontend reads it from API responses rather than hardcoding it.

### Idempotency is a DB-enforced contract, not just application logic

`services/entrevista.py::responder()` runs in this exact order: save the answer → call the AI to evaluate → save the evaluation → generate the next question (or finalize). Each step checks whether it already happened before repeating it, so retrying after a mid-request failure (e.g. the AI call times out) never duplicates data. This is backed by real constraints — `Intercambio` has `unique_together(entrevista, numero)`, `Evaluacion` is `OneToOne` on `Intercambio` — not just careful code.

### Error taxonomy translates provider failures into HTTP codes

`entrevistas/services/ia/errores.py` defines `ErrorTransitorio` / `ErrorPermanente` / `RespuestaIAInvalida`. Every adapter translates its own SDK's exceptions into these. `entrevistas/views.py` then maps them to HTTP responses (503 / 502 / 502) via a shared `_respuesta_para_error_ia()` helper. `usuarios/views.py` does not yet follow this same pattern for Google auth failures — it handles them inline.

### Ownership checks return 404, never 403

Every entrevista-scoped view fetches with `get_object_or_404(Entrevista, pk=pk, usuario=request.user)`. Requesting another user's interview returns 404 — existence is never leaked via a 403.

### Two login paths converge on the same token issuance

Email/password goes through simplejwt's stock `TokenObtainPairView` (works out of the box because `Usuario.USERNAME_FIELD = "email"`). Google goes through a custom view that verifies an ID token via `google-auth` against `GOOGLE_OAUTH_CLIENT_ID`, then finds-or-creates a `Usuario` by email (new accounts get `set_unusable_password()`). Both paths end up issuing the same access/refresh JWT pair, so the rest of the app never needs to know which one was used.

### Frontend: one fetch wrapper, everything else is thin

`src/api/cliente.js` is the only place that touches `fetch` directly — it attaches the JWT, retries once after auto-refreshing on a 401, and normalizes failures into `ErrorAPI`. `src/api/{auth,entrevistas,estadisticas}.js` are one-function-per-endpoint wrappers around it. `AuthContext` (`src/context/`) gates `src/routes/RutaProtegida.jsx`. The Google sign-in button dynamically loads the Google Identity Services script itself and renders a neutral placeholder if `VITE_GOOGLE_CLIENT_ID` is unset, mirroring the backend's 503 behavior rather than crashing.

### Statistics are computed in the database, not in Python

`entrevistas/services/estadisticas.py` uses Django's `Avg`/`Count` directly on `Evaluacion` rows (weighted per answer), not by averaging each interview's already-averaged score — deliberate, since the latter would misweight interviews with different numbers of scored answers.

### Naming convention

Domain code (models, fields, function names — `Usuario`, `Entrevista`, `Intercambio`, `Evaluacion`, `puntuacion`, `respuesta`) is Spanish throughout, matching the thesis document. Project scaffolding and technical folder names (`services/`, `views.py`, `tests/`) follow standard Django/English convention. This split is intentional, not inconsistent.
