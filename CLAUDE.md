# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Sistema web de simulación de entrevistas técnicas (Proyecto de Grado, Ingeniería de Sistemas, UMSS). Django REST backend + React frontend. A conversational AI agent conducts a 5-question technical interview by area/level and evaluates each answer against a fixed rubric. The academic requirements this implements live in `docs/Copia de Copia de PerfilJorgeV3.docx.md` (the thesis profile) — consult it for the "why" behind the data model (section 3.4.1) and scope decisions.

## Commands

### Backend (`backend/`)

```powershell
.\.venv\Scripts\Activate.ps1        # Windows PowerShell; if blocked: Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
pip install -r requirements/local.txt
python manage.py migrate
python manage.py runserver          # http://127.0.0.1:8000
```

Settings are split by environment. `manage.py` defaults to `config.settings.local`; Render sets `DJANGO_SETTINGS_MODULE=config.settings.production`. `production.py` has no insecure defaults — it aborts at startup if `SECRET_KEY`, `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS` or `DATABASE_URL` are missing.

Tests use Django's test runner (not plain `pytest`/`unittest` — several test modules import Django models and need `django.setup()`):

```powershell
python manage.py test                                   # full suite (auto-discovery, 94 tests)
python manage.py test apps.entrevistas                  # one app
python manage.py test tests.integration                 # the Django-free IA tests
python manage.py test apps.entrevistas.tests.test_idempotencia.IdempotenciaTest.test_reintento_tras_fallo_no_duplica_intercambio_ni_evaluacion
```

Requires a real PostgreSQL connection (`DATABASE_URL` in `.env`) — Django creates/destroys a temporary test database each run. SQLite works for quick local hacking (`DATABASE_URL` unset) but `evaluacion_json` is a `JSONField` that only behaves correctly (native `jsonb`) on Postgres, so don't trust SQLite for anything touching that field.

### Frontend (`frontend/`)

Package manager is **pnpm**, not npm (`pnpm-lock.yaml` is the committed lockfile).

```powershell
pnpm install
pnpm run dev             # http://localhost:5173
pnpm run build
pnpm run lint            # oxlint, not ESLint
pnpm exec tsc --noEmit   # type check
```

TypeScript is `strict` with no `allowJs` — there are zero `.js`/`.jsx` files left in `src/`. No frontend test runner is configured, so `tsc --noEmit` plus the build is the only automated check the frontend has.

### Environment

Both `backend/.env` and `frontend/.env` are gitignored; copy from the corresponding `.env.example`. Key variables:

- `IA_PROVEEDOR` (backend) — `fake` | `gemini` | `anthropic`. Defaults to `fake` (deterministic, no network) so nothing ever burns API quota by accident. `anthropic` is the documented production engine; `gemini` is an internal fallback not mentioned in the academic profile.
- `DATABASE_URL` — empty selects SQLite, set selects Postgres via `dj_database_url`. Mandatory in production.
- `GOOGLE_OAUTH_CLIENT_ID` (backend) / `VITE_GOOGLE_CLIENT_ID` (frontend) — same value on both sides. If either is unset, that half degrades on purpose (backend returns 503, frontend hides the Google button) instead of erroring.
- `ANTHROPIC_API_KEY`, `GEMINI_API_KEY` — only needed when `IA_PROVEEDOR` selects that provider.

## Architecture

### Layout

```
backend/
├── config/settings/{base,local,production}.py
├── apps/{common,usuarios,catalogos,entrevistas,evaluaciones}/
├── integrations/ia/          # zero Django dependency
└── tests/{conftest.py,integration/}
```

Apps live under `apps/` but keep short labels (`label = "entrevistas"` in `apps.py`), so `AUTH_USER_MODEL` and cross-app model references stay unqualified.

### Layering: views never talk to the AI provider directly

`apps/entrevistas/views.py` → `apps/entrevistas/services.py` (the orchestrator) → `integrations/ia/factory.py::get_proveedor()` → one of three interchangeable `ProveedorIA` implementations (`integrations/ia/{fake,gemini,claude}.py`), selected at runtime by `IA_PROVEEDOR`. Nothing outside `factory.py` imports a concrete adapter by name.

The dependency direction is **apps → integrations, never the reverse**. `integrations/ia/` has zero Django dependency — it's tested independently in `tests/integration/` and can be exercised with plain Python.

`services.py` holds writes and orchestration; `selectors.py` holds reads. Vistas call both and do nothing else.

### Catálogos are DB tables, bridged to the AI layer by `codigo`

`CatalogosPublicosView` subclasses `CatalogosView` and only swaps `permission_classes` to `AllowAny`, served at `/api/catalogos/publico/`. The authenticated route stays 401 — `test_requiere_autenticacion` asserts it — so the boundary between what the system publishes and what it hands only to users stays explicit.

`Area` and `Nivel` are real tables in `apps/catalogos/`, seeded by the data migration `catalogos/0002_datos_iniciales.py`. `Entrevista.area` / `.nivel` are `ForeignKey(..., on_delete=PROTECT)`.

The bridge to the Django-free IA layer is the `codigo` field: its values match the `AreaTecnica` / `Nivel` enums in `integrations/ia/prompts/schemas.py`, and `Entrevista.area_enum` does `AreaTecnica(self.area.codigo)`. `apps/catalogos/tests/test_catalogos.py::test_codigos_coinciden_con_los_enums_de_la_capa_de_ia` is what keeps those two in sync — if you add an área, add the enum member too or that test fails.

The API exposes `codigo`, never the numeric id (`SlugRelatedField`), so the frontend contract is unchanged by the normalization.

### Entrevistador and evaluador are separate roles, deliberately isolated

Two distinct prompts live in `integrations/ia/prompts/`:
- `entrevistador.py` generates the next question. It receives a **compressed summary** of prior turns (`TemaEvaluado`: topic + score only) — never the full Q&A history — to keep prompt size bounded regardless of interview length. Built by `apps/entrevistas/selectors.py::temas_evaluados()`, always from the DB, never from memory (Render free tier sleeps and restarts mid-interview).
- `evaluador.py` scores one answer against a fixed rubric. It is a pure function of (area, nivel, pregunta, respuesta) — it never receives conversation history, so the same answer always scores the same way independent of when it was given.

`apps/evaluaciones/rubricas.py` imports `RUBRICA` from the prompt module (apps → integrations) and adds the score bands as queryable data, so backend, admin and frontend agree on what counts as a good score.

`PREGUNTAS_POR_ENTREVISTA` (in `integrations/ia/prompts/schemas.py`) is the single source of truth for interview length (currently 5); the frontend reads it from `/api/catalogos/` rather than hardcoding it.

### Idempotency is a DB-enforced contract, not just application logic

`apps/entrevistas/services.py::responder()` runs in this exact order: save the answer → call the AI to evaluate → save the evaluation → generate the next question (or finalize). Each step checks whether it already happened before repeating it, so retrying after a mid-request failure (e.g. the AI call times out) never duplicates data.

The evaluation call happens **outside** the transaction (so a slow provider doesn't hold a row lock); the next-question call happens **inside** it, so that a failure there rolls back the evaluation too and the retry finds the intercambio unevaluated — rather than leaving the interview stuck with no pending question and no final state.

This is backed by real constraints — `Intercambio` has `UniqueConstraint(entrevista, numero)`, `Evaluacion` is `OneToOne` on `Intercambio` — not just careful code.

### Error taxonomy translates provider failures into HTTP codes

`integrations/ia/exceptions.py` defines `ErrorTransitorio` / `ErrorPermanente` / `RespuestaIAInvalida`. Every adapter translates its own SDK's exceptions into these.

`apps/common/exceptions.py::manejador_de_excepciones` is the **single** place that turns that taxonomy into HTTP (503 / 502 / 502), registered as DRF's `EXCEPTION_HANDLER`. Views don't catch provider errors — they let them propagate. `apps/usuarios/views.py` does not follow this pattern for Google auth failures; it handles them inline.

### Ownership checks return 404, never 403

`apps/entrevistas/selectors.py::entrevista_del_usuario()` fetches with `get_object_or_404(Entrevista, pk=pk, usuario=usuario)`. Requesting another user's interview returns 404 — existence is never leaked via a 403. Filtering inside the query is what guarantees this; `apps/common/permissions.py::EsPropietario` exists for generic views where that isn't possible, and documents the tradeoff.

### Two login paths converge on the same token issuance

Email/password goes through simplejwt's stock `TokenObtainPairView` (works out of the box because `Usuario.USERNAME_FIELD = "email"`). Google goes through a custom view that verifies an ID token via `google-auth` against `GOOGLE_OAUTH_CLIENT_ID`, then finds-or-creates a `Usuario` by email (new accounts get `set_unusable_password()`). Both paths end up issuing the same access/refresh JWT pair, so the rest of the app never needs to know which one was used.

### Retroalimentación acumulada counts more than the stats do

`apps/evaluaciones/services.py::calcular_retroalimentacion()` (served at `/api/estadisticas/retroalimentacion/`) deliberately does **not** filter by `estado=FINALIZADA`, unlike `calcular_estadisticas`. An average only compares across complete interviews, but a weakness found in question 3 of an abandoned one is still a real weakness. Unanswered questions drop out by construction — it queries `Evaluacion`, and an ungraded intercambio has no row.

Band counts are grouped in SQL with a range filter built from `rubricas.BANDAS`, so the thresholds stay in one place. The textual observations are returned raw, capped at `MAXIMO_OBSERVACIONES`; nothing is summarized, which would mean a fresh AI call per view.

### Statistics are computed in the database, not in Python

`apps/evaluaciones/services.py::calcular_estadisticas()` uses Django's `Avg`/`Count` directly on `Evaluacion` rows (weighted per answer), not by averaging each interview's already-averaged score — deliberate, since the latter would misweight interviews with different numbers of scored answers.

### Authenticated shell: dark sidebar, header names the section

`router/RutaProtegida.tsx` renders a fixed `Header` (`h-16`, always light) across the full width at the top, and below it — anchored at `top-16`, never beside it — `components/layout/Sidebar.tsx`, either as a fixed rail on desktop (collapsible to an icon-only strip) or a `role="dialog"` drawer on mobile. Both share the same `bg-slate-900` and the same `Sidebar` component; `components/layout/destinos.ts` is the single list of nav items both render, so adding a section is one edit, not two.

The dark theme is not a second brand color: `slate-900`/`slate-800` are the same neutral scale already used for text and borders elsewhere in the app, just at its dark end. The only accent remains `indigo-600` — reused as the active item's solid pill fill instead of introducing a new hue. That solid fill (plus `aria-current="page"`) is what distinguishes the active destination now; the earlier `bg-indigo-50` + side-accent-bar combo is gone because a filled pill is already enough contrast against `slate-900`.

`Header.tsx` no longer repeats the app's name — the sidebar has its own brand block (reusing the same `IconoNav` `marca` path as `features/landing/components/Icono.tsx::marca`, so the mark looks identical in the landing and the app). Instead the header shows the current section's name, resolved by `components/layout/titulosDeRuta.ts::resolverTitulo()` from a static route → title map, not from each page declaring its own — a route that forgets to register can't leave the header blank, it falls back to a default. That label is a `<p>`, not an `<h1>`: every page under `RutaProtegida` already owns its own `<h1>`, and a second one in the header would break the one-`h1`-per-page hierarchy.

### Naming convention

Domain code (models, fields, function names — `Usuario`, `Entrevista`, `Intercambio`, `Evaluacion`, `puntuacion`, `respuesta`) is Spanish throughout, matching the thesis document. Project scaffolding and technical folder names (`apps/`, `integrations/`, `views.py`, `tests/`) follow standard Django/English convention. This split is intentional, not inconsistent.
