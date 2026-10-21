# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Sistema web de simulación de entrevistas técnicas (Proyecto de Grado, Ingeniería de Sistemas, UMSS). Django REST backend + React frontend. A conversational AI agent conducts a 5-question technical interview for a chosen job role (puesto) and level, and evaluates each answer against a fixed rubric. The academic requirements this implements live in `docs/Copia de Copia de PerfilJorgeV3.docx.md` (the thesis profile) — consult it for the "why" behind the data model (section 3.4.1) and scope decisions.

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
python manage.py test                                   # full suite (auto-discovery, 526 tests)
python manage.py test apps.entrevistas                  # one app
python manage.py test tests.integration                 # the Django-free IA and document tests
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
pnpm test               # Vitest, pure logic only (e.g. features/seleccion/seleccion.test.ts)
```

TypeScript is `strict` with no `allowJs` — there are zero `.js`/`.jsx` files left in `src/`. Vitest (dev-only) covers pure logic such as the selection steps (`src/features/seleccion/seleccion.test.ts`); there are no component tests, so `tsc --noEmit`, `pnpm test` and the build are the frontend's automated checks.

### Environment

Both `backend/.env` and `frontend/.env` are gitignored; copy from the corresponding `.env.example`. Key variables:

- `IA_PROVEEDOR` (backend) — `fake` | `gemini` | `anthropic` | `deepseek` | `openrouter`, or several comma-separated (`gemini,deepseek`) to form a fallback chain. Defaults to `fake` (deterministic, no network) so nothing ever burns API quota by accident. `anthropic` is the documented production engine; the rest are internal fallbacks not mentioned in the academic profile. It and the API keys are read from `os.environ` by `integrations/ia/factory.py` and the adapters, never through Django settings (that layer has no Django dependency), so there is deliberately no `settings.IA_PROVEEDOR`.
- `DATABASE_URL` — empty selects SQLite, set selects Postgres via `dj_database_url`. Mandatory in production.
- `GOOGLE_OAUTH_CLIENT_ID` (backend) / `VITE_GOOGLE_CLIENT_ID` (frontend) — same value on both sides. If either is unset, that half degrades on purpose (backend returns 503, frontend hides the Google button) instead of erroring.
- `ANTHROPIC_API_KEY`, `GEMINI_API_KEY`, `DEEPSEEK_API_KEY`, `OPENROUTER_API_KEY` (+ the optional `*_MODEL`) — only needed when `IA_PROVEEDOR` selects that provider. `OPENROUTER_MODEL` is required: OpenRouter's free catalog changes, and as of October 2026 it has no free DeepSeek model, so no default is assumed.

## Architecture

### Layout

```
backend/
├── config/settings/{base,local,production}.py
├── apps/{common,usuarios,catalogos,entrevistas,evaluaciones,curriculums}/
├── integrations/ia/          # zero Django dependency
├── integrations/documentos/  # zero Django dependency
└── tests/{conftest.py,integration/}
```

Apps live under `apps/` but keep short labels (`label = "entrevistas"` in `apps.py`), so `AUTH_USER_MODEL` and cross-app model references stay unqualified.

### Layering: views never talk to the AI provider directly

`apps/entrevistas/views.py` → `apps/entrevistas/services.py` (the orchestrator) → `integrations/ia/factory.py::get_proveedor()` → one of the interchangeable `ProveedorIA` implementations (`integrations/ia/{fake,gemini,claude,compatible_openai}.py`), selected at runtime by `IA_PROVEEDOR`. Nothing outside `factory.py` imports a concrete adapter by name.

`compatible_openai.py` covers any Chat-Completions endpoint with the `openai` SDK and a `base_url`; `DeepSeekProveedorIA` and `OpenRouterProveedorIA` only set key, model and URL. Those endpoints have no strict `json_schema`, so it asks for `json_object` and writes the schema into the system prompt — the parsers in `prompts/` are the real guarantee.

Several names in `IA_PROVEEDOR` build an `integrations/ia/cadena.py::ProveedorEnCadena`, itself a `ProveedorIA`: each operation goes to the first link and, on any `ErrorProveedorIA` (including permanent ones — a revoked key in one link must not take the service down), to the next; if all fail the last error propagates. After a success its `nombre`/`modelo` become those of the link that answered, which is what `guardar()` records in `proveedor_ia` — per-instance state, safe because `get_proveedor()` builds one per request. An unknown name or a link without its key aborts before any call: a configuration error should surface at deploy, not hide behind a fallback.

The dependency direction is **apps → integrations, never the reverse**. `integrations/ia/` has zero Django dependency — it's tested independently in `tests/integration/` and can be exercised with plain Python.

`services.py` holds writes and orchestration; `selectors.py` holds reads. Vistas call both and do nothing else.

### Catálogos are DB tables, bridged to the AI layer by `codigo`

`CatalogosPublicosView` subclasses `CatalogosView` and only swaps `permission_classes` to `AllowAny`, served at `/api/catalogos/publico/`. The authenticated route stays 401 — `test_requiere_autenticacion` asserts it — so the boundary between what the system publishes and what it hands only to users stays explicit. Both return puestos, niveles, áreas, `preguntas_por_entrevista` and `rubrica` — **not** the tecnologías, which travel per puesto in `/api/catalogos/puestos/` (the only thing the selection screen reads); `test_devuelve_los_catalogos_y_el_total_de_preguntas` asserts the key is absent.

`Puesto`, `Nivel`, `Tecnologia` and `Area` are real tables in `apps/catalogos/`, seeded by data migrations (`0002` the original areas/levels, `0004` the first puestos and four extra areas, `0007` the catalog by puesto, `0011` Full Stack by layer, `0013` frameworks, `0014` the Videojuegos puesto and its área). `Entrevista.puesto` / `.nivel` / `.tecnologia` / `.segunda_tecnologia` are `ForeignKey(..., on_delete=PROTECT)`; `.tecnologia` stays nullable in the DB only because interviews from before the catalog by puesto had none — starting a new one **requires** it, and `IniciarEntrevistaSerializer.validate()` rejects a tecnología that does not belong to the puesto (400, before any AI call).

**Each `Tecnologia` belongs to one `Puesto`** (`Tecnologia.puesto`). "C# .NET" for Backend and for Escritorio are two rows with different codes, because the puesto changes what is asked about it. The three old cross-cutting stacks (`python_django`, `javascript_react`, `java_spring`) are kept **inactive with no puesto** because old interviews reference them; `CheckConstraint tecnologia_activa_con_puesto` forbids an active one without puesto. `Puesto` also carries `icono` (a name from `components/ui/trazosDeIconos.ts`, resolved with `iconoDelCatalogo`, falling back to a generic icon) (`palabras_clave`, the old search synonyms, was dropped in `0010` together with the search).

**Full Stack is chosen by layer.** `Tecnologia.capa` is `""`, `"frontend"` or `"backend"`; a puesto whose active tecnologías carry a capa (`Puesto.tiene_capas`) is practised with **one per layer** — today only Full Stack (6 frontend + 7 backend frameworks). Nothing in the code asks for `full_stack`: the catalog decides. `Entrevista.tecnologia` holds the frontend one and `segunda_tecnologia` the backend one (`Tecnologia.CAPAS_EN_ORDEN`); the serializer requires both, in the right layers, and rejects a second tecnología on a puesto without layers. `Entrevista.tecnologia_nombre` joins them as `"React + Node.js"` — exactly the string the four old fixed combos had, so **the AI layer did not change**: `ContextoDeEntrevista.tecnologia` is still one string. Those combos (`full_stack_react_node`, …) are inactive, kept because old interviews reference them; "Repetir última" on one of them comes back with `tecnologia: null` and asks again.

`apps/catalogos/datos.py` is the single source of the 7 puestos, their 70 active tecnologías and the 3 niveles. The catalog offers **frameworks**, which is what job postings ask for ("Django", not "Python"); `Tecnologia.grupo` is a presentation-only label that groups them on screen — the language in Backend and Full Stack, the kind of test in QA, the kind of engine in Videojuegos — and is neither validated nor sent to the AI. When the catalog changes, **splitting retires, refining renames**: a tecnología that becomes several frameworks (Backend "Python" → Django/FastAPI/Flask) is deactivated, not deleted, so old interviews keep their name; one that only gets a more precise name ("Kotlin (Android)" → "Kotlin (Jetpack Compose)") is renamed in place. `python manage.py cargar_catalogos` re-syncs the DB from it (idempotent `update_or_create`, never deletes — which is why the retired Full Stack combos stay inactive); migrations `0007` and `0011` copy the same values literally, and `test_cargar_catalogos_coincide_con_la_migracion` fails if the two drift.

**Niveles are `junior` (Inicial), `semi_senior` (Intermedio) and `senior` (Avanzado).** Each rename happened in place (`0007`: basico → practicante, intermedio → junior; `0009`: junior → semi_senior, then practicante → junior, plus the new `senior`) so every interview kept its level without touching its table. **Senior widens the approved thesis profile**, which says "básico e intermedio" and, under limitations, excludes advanced interviews — the document must be updated to match. The screen shows `Nivel.nombre` with `Nivel.descripcion` (the grade) beneath; the prompts read `Nivel.con_experiencia` ("Senior (nivel avanzado)").

The bridge to the Django-free IA layer is the `codigo` field: its values match the `AreaTecnica` / `Nivel` / `Puesto` enums in `integrations/ia/prompts/schemas.py`, and `Entrevista.puesto_enum` does `Puesto(self.puesto.codigo)`. There is **no `Tecnologia` enum**: with 70 tecnologías loaded by a command, the AI only needs the name, so `ContextoDeEntrevista.tecnologia` is a `str` (`Entrevista.tecnologia_nombre`). Two tests in `apps/catalogos/tests/test_catalogos.py` keep the two sides in sync: `test_codigos_coinciden_con_los_enums_de_la_capa_de_ia` (codes) and `test_los_nombres_visibles_coinciden_con_las_etiquetas_de_la_capa_de_ia` (display names — the user must read the same label the model is told).

The API exposes `codigo`, never the numeric id (`SlugRelatedField`), so the frontend contract is unchanged by the normalization.

### An interview is a puesto, not an área

The user picks a **puesto** (`frontend`, `backend`, `full_stack`, `movil`, `escritorio`, `qa`, `videojuegos`), a **tecnología of that puesto** and a **nivel** — never an área. That is the framing of a real application: nobody applies for a "Bases de Datos" position. **Videojuegos** (Desarrollador de Videojuegos, its own área «Desarrollo de Videojuegos», 17 engines and frameworks grouped by type, migration `0014`) widens the approved thesis profile like Senior did — the document must list it too.

`PLAN_POR_PUESTO` in `integrations/ia/prompts/schemas.py` maps each puesto to exactly `PREGUNTAS_POR_ENTREVISTA` `PasoDelPlan(enfoque, area)`. Every interview walks the same five **enfoques** — fundamentos, la tecnología elegida, datos, profundidad en la tecnología, caso práctico — and the puesto decides the **área** each question is recorded under ("datos" is Bases de Datos for backend, full stack and QA; Estructuras de Datos for frontend, móvil, escritorio and videojuegos). `area_de_la_pregunta(puesto, n)` and `paso_de_la_pregunta(puesto, n)` read it. The interviewer prompt derives the enfoque from the puesto and the question number (`entrevistador._encargo`), so the provider contract did not change; `test_areas_del_plan_segun_el_diseno` pins the whole table. It is deterministic, not random, so an interview is reproducible, explainable in the thesis defence, and testable. It lives in the AI layer rather than the DB because it is simulation design, not reference data the user administers.

Consequences worth knowing before touching this:

- **`Area` lives on `Intercambio`, not on `Entrevista`.** It is persisted per question rather than recomputed from the puesto, so changing a plan later never rewrites the history of someone who already sat the interview.
- **The per-área breakdown groups by `intercambio__area`** and lives only in Retroalimentación (`calcular_retroalimentacion`'s `por_area`, drawn by `RepartoPorBandas`). Before, one interview had a single área and its five answers all inherited that label; now the per-topic breakdown is real. There is no `GET /api/estadisticas/` any more: its `promedio_por_area` repeated Retroalimentación, its `evolucion` was replaced by charts built from the history list, and the header figures it last served were replaced by a one-line description; only `/api/estadisticas/retroalimentacion/` remains under that prefix.
- **"Evolución en el tiempo" is per interview, drawn from the history list the table shows**, not from a stats endpoint: the page computes the filtered list once (`hooks/useFiltrosDeHistorial`) and hands it to both `TablaDeEntrevistas` and `EvolucionPorNivel`, so filtering the table filters the charts. **One card per nivel** (catalog order, always the three, the empty one saying «Aún sin entrevistas <Nivel> finalizadas»; one row from `xl`, stacked below) and **one line per puesto** inside it — only the same puesto and nivel are joined, the rule `anterior_comparable` uses. `historial.ts::evolucionPorNivel` builds it: finished interviews with a grade, ordered by `fecha_fin`; the X axis is the **interview number within the puesto, not the calendar** (ten in a week do not collapse; a gap of more than `DIAS_DE_SALTO` = 90 days is drawn as a dashed line), and `marcasDelEje` labels only 1, multiples of 5 and the last past 8 points. Every card shares the fixed 0–100 scale. Every point looks the same whether the interview was hand-configured or came from a convocatoria (the grade is computed the same way). Hovering or Tab-focusing a point opens `DetalleDePunto` — Fecha, Puesto, Tecnología, Puntaje, HTML over the SVG rather than a native `<title>`, kept inside the card at the edges, closed by leaving, blurring or Esc; each `<circle>` is focusable with an `aria-label` of the same four fields, so the `<svg>` is `role="group"`, not `role="img"` (which would hide the points from screen readers). Each puesto keeps one colour everywhere (`lib/puestos.ts::colorDePuesto` → `--color-puesto-<codigo>`); one legend above the row; no on-screen reading sentence, only an `sr-only` summary per card.
- The selección screen shows the áreas each puesto covers (`PuestoSerializer.get_areas`). That is what keeps the thesis profile's objetivo específico 2 ("módulo de selección de diferentes áreas") visibly satisfied now that áreas are bundled rather than picked one at a time. They are listed once, for the puesto currently chosen, in the summary at the foot of the selection panel (`features/seleccion/components/ResumenDeEntrevista.tsx`, "Cubre: …").

### The selection screen is a form of native selects

There is no search box (with six puestos it made the user guess what to type) and no stepper. `SeleccionPuestoPage` is a form: each field has a visible `<label>` and a **native `<select>`** below it (`components/ui/CampoSelect.tsx`: `appearance-none` plus the `abajo` chevron, helper text via `aria-describedby`, a disabled "Selecciona…" first option). Native on purpose: keyboard, screen readers and the phone's own picker come for free, and `<optgroup>` renders `Tecnologia.grupo` with no code. Fields, in this order (one row of 3 or 4 from 1024 px): **Puesto and Nivel on one row** (Puesto with its description as helper text; Nivel as "Junior · Inicial"), then Tecnología below (one full-width select, or "Tecnología de frontend" + "Tecnología de backend" side by side for a puesto with layers; disabled until a puesto is chosen). Below 640 px they stack in the same order. The DOM order is the visual order on purpose (no CSS `order`), so Tab and screen readers follow what is seen. Changing puesto empties the tecnología (it belonged to the old one) and keeps the nivel.

Above the content, two **tabs** (`components/ui/Pestanas.tsx`, the ARIA tabs pattern: roving tabindex, ← → / Home / End with automatic activation) switch between **"Personalizada"** and **"Con convocatoria"** over **one** `role="tabpanel"` and **one** shared selection; what the panel holds depends on the tab. "Personalizada" shows the fields (`FormularioDeEntrevista`) and `ResumenDeEntrevista`. "Con convocatoria" has **no fields**: `PanelDeConvocatoria` is one column: first **two cards side by side** (`EleccionDeVia`, "Elige una forma de darnos la convocatoria": "Pegar texto" / "Subir archivo", stacked below 640 px), then **only** the field of the chosen card — the `Textarea` "Texto de la convocatoria" (30-5000 chars) or `ZonaDeArchivo` for PDF/DOCX —, then "Analizar convocatoria" on the right, then `ResumenDeConvocatoria` ("Detectamos": puesto, tecnología, nivel, requisitos, what is not evaluated). The cards are native radios styled as cards (`sr-only` input, `has-[:checked]` / `has-[:focus-visible]` on the label), so "1 of 2, selected", arrow keys and a single Tab stop come from the browser; "Pegar texto" is chosen on entry. The server accepts one of the two, so only the chosen card's value is sent; the other one's text or file is kept in state for when the user switches back, and nothing is disabled because of it. There are no example postings. Analysing applies the detected profile to the shared selection with `aplicar`, and the summary reads that selection — not the raw profile — so a code the catalog dropped shows as "No indicado en el aviso" (or "falta el backend" for half a Full Stack). Complete, it offers "Iniciar entrevista"; incomplete, "Completar en Personalizada", which switches tab **keeping** `convocatoriaId` and focuses the first empty field. Switching to "Personalizada" with the tabs is a different intention — no longer starting from the posting — so it keeps the field values but drops `convocatoriaId`; coming back re-applies the last analysis so the summary always states what will be used. The panel stays mounted (`hidden`), so the text, the file and the last result survive tab changes; the fields need not, their state lives in the reducer. "Repetir última" switches to "Personalizada" (it is a hand-made configuration). `ControlSegmentado` is no longer used here; it stays for in-form toggles elsewhere (`CampoConvocatoria`, `ListaObservaciones`).

The state is a pure reducer in `features/seleccion/seleccion.ts` (`reducirSeleccion`, `campoFaltante`, `capasDe`, `agruparPorGrupo`, `nombreDeTecnologias`), tested in Vitest without a DOM; `FormularioDeEntrevista` only paints it. `?puesto=` / `?nivel=` (from the report and the CV analysis), "Repetir última" and the convocatoria all fill the fields through the same `aplicar` action, which ignores inactive or foreign codes and leaves that field on "Selecciona…". After applying, focus goes to the **first empty enabled `<select>`** (fields are in `campoFaltante` order, puesto → nivel → tecnología, so that is the missing one) or to "Iniciar entrevista"; it is read from the DOM at focus time, which is also why it works as a modal's `focoAlCerrar`. Choosing in a select never moves focus: in a form the user advances with Tab.

There is no sticky bar. At the foot of the "Personalizada" panel, `ResumenDeEntrevista` shows the choice ("Puesto · Tecnología · Nivel · 5 preguntas", "Cubre: …", the "Desde convocatoria" tag) or the first missing field, and a compact `sm` "Iniciar entrevista" button (no icon) bottom-right that never goes full width.

"Iniciar entrevista" never starts anything by itself, from either tab: it opens `ModalDeInicio` (on `ModalDeConfirmacion`, "Cancelar" / "Comenzar") with the puesto, "tecnología · nivel", "Basada en tu convocatoria" when it applies, and what to expect — N questions (`preguntas_por_entrevista`), the grade only at the end, abandoning is allowed. Only "Comenzar" calls `iniciarEntrevista`; a start error is shown **inside** the modal (`role="alert"`) and it stays open to retry. Cancelar, X and Esc close it and focus returns to the button that opened it.

`GET /api/catalogos/puestos/` returns everything the screen needs in one response — puestos with their active tecnologías (each with its `capa`), icon and áreas, the niveles, the área names and the interview length. It is cached `private, max-age=300`. ("Lo más practicado" and its `mas_practicados` were removed with the search.) `GET /api/entrevistas/ultima-configuracion/` feeds the "Repetir última" button beside the title (204 for a new user, and then the button is not shown; each inactive tecnología comes back `null`). It asks first through `ModalDeConfirmacion`, whose body shows only that previous configuration (puesto, tecnología —or "no longer available"—, nivel). Confirmar fills the fields, announces it in `aria-live`, and moves focus to the first empty field, or to "Iniciar entrevista" if everything was applied. It never starts the interview. Cancelar, X and Esc change nothing.

**Modals are `components/ui/Modal.tsx`** (reuse it, don't hand-roll another; its box, `::backdrop` and entry animation are the `.modal` class in `styles/overlays.css`): three parts — header with the title on the left (verb + noun: "Aplicar configuración anterior") and an X on the right, a body that states consequences instead of repeating the title, and an actions footer aligned right. It is a native `<dialog>` opened with `showModal()` (the browser makes the page inert, traps focus, draws `::backdrop`, maps Esc to `cancel`), mounted only while open, and on close it focuses `focoAlCerrar()` if given and non-null, otherwise whatever opened it. `focoAlCerrar` is a **function evaluated at close**, not a ref read at open: the destination may only exist once the confirmed action re-renders, and the caller decides by how the modal closed (forward after confirming, back after cancelling — see `RepetirConfiguracion`). `ModalDeConfirmacion` wraps it with Cancelar / Confirmar (`textoConfirmar`, `cargando`); X, Esc and Cancelar all close without acting.

### Entrevistador and evaluador are separate roles, deliberately isolated

Two distinct prompts live in `integrations/ia/prompts/`:
- `entrevistador.py` generates the next question. It receives a **compressed summary** of prior turns (`TemaEvaluado`: topic + score only) — never the full Q&A history — to keep prompt size bounded regardless of interview length. Built by `apps/entrevistas/selectors.py::temas_evaluados()`, always from the DB, never from memory (Render free tier sleeps and restarts mid-interview).
- `evaluador.py` scores one answer against a fixed rubric. It is a pure function of (contexto, area, pregunta, respuesta) — it never receives conversation history, so the same answer always scores the same way independent of when it was given. `ContextoDeEntrevista` (puesto, nivel, tecnología) is constant for the whole interview, so bundling it does not break that purity.

Both build their "Tecnología elegida…" line with `schemas.linea_de_tecnologia()`. `tests/integration/test_prompts_estables.py` compares every prompt, character by character, with copies in `tests/fixtures/prompts/`: a refactor must not change what the model reads. When a prompt change is intended, regenerate them with `python -m tests.integration.test_prompts_estables` and review the `.txt` diff.

`apps/evaluaciones/rubricas.py` imports `RUBRICA` from the prompt module (apps → integrations) and adds the score bands as queryable data, so backend, admin and frontend agree on what counts as a good score.

### The model picks levels; the code computes the grade

The evaluator never writes a 0–100 number. The rubric is analytic: three equal-weight criteria (`correccion`, `completitud`, `claridad`), each with five described levels 0–4 (`DESCRIPTORES` in `evaluador.py`). The model returns only `niveles` plus the three feedback texts; `parsear_evaluacion()` validates each level and **ignores** any `puntuacion` the model adds. `rubricas.puntuacion_de()` turns levels into the grade — `P = 100·Σ(w·n)/(4·Σw)`, i.e. `100·(n₁+n₂+n₃)/12` with `PESOS` all 1 — so there are only 13 possible grades per answer and `100·S/12` never lands on ,5. The formula lives in `apps/` and not in the IA layer because weights are an evaluation decision, not part of the provider contract.

Why levels and not 0–100: an LLM judge is more reliable choosing among a few described levels than writing a free number (G-Eval and Prometheus score 1–5 against a rubric), and "where does the 74 come from?" now has an arithmetic answer. `guardar()` writes `niveles`, `pesos` and `version_rubrica` (`VERSION_DE_RUBRICA = 2`) into `evaluacion_json`, so any grade can be recomputed by hand — `TrazabilidadDeLaNotaTest` pins that. Evaluations from before (version 1) keep their grade and serialize `niveles: null`; they are never recomputed. The rubric with its descriptors is published under `rubrica` in `/api/catalogos/`, and the results screen shows "¿Cómo se calcula?" with the operation substituted.

The same call also returns `puntos_clave` — 2 to 4 short statements of what a complete answer had to cover for that level (more are cut to 4, fewer is `RespuestaIAInvalida`). They are stored in `evaluacion_json` and shown as "Una respuesta completa cubría"; it is what turns the grade into something to study. The evaluator stays a pure function of (contexto, área, pregunta, respuesta).

`FakeProveedorIA` answers 3/3/3 = 75, the same grade it gave before, and test stubs that need a specific grade use `tests.conftest.niveles_para(nota)`, which **raises** for a grade the formula cannot produce (90, 85…) rather than rounding silently.

`python manage.py medir_consistencia --repeticiones K [--proveedor X]` evaluates the 8 fixed cases in `apps/evaluaciones/consistencia/casos.json` K times and reports per case the mean, sample standard deviation and how often the grade lands in the modal band. It touches no tables. Temperature is deliberately not forced to 0: variability is measured, not assumed away.

`PREGUNTAS_POR_ENTREVISTA` (in `integrations/ia/prompts/schemas.py`) is the single source of truth for interview length (currently 5); the frontend reads it from `/api/catalogos/` rather than hardcoding it.

### Idempotency is a DB-enforced contract, not just application logic

`apps/entrevistas/services.py::responder()` runs in this exact order: save the answer → call the AI to evaluate → save the evaluation → generate the next question **if it does not already exist** (or finalize). Each step checks whether it already happened before repeating it, so retrying after a mid-request failure (e.g. the AI call times out) never duplicates data. The existence check matters: the warm-up questions are created up front by `iniciar()`, so answering the first one must not try to create a `numero` that already exists.

The evaluation call happens **outside** the transaction (so a slow provider doesn't hold a row lock); the next-question call happens **inside** it, so that a failure there rolls back the evaluation too and the retry finds the intercambio unevaluated — rather than leaving the interview stuck with no pending question and no final state.

This is backed by real constraints — `Intercambio` has `UniqueConstraint(entrevista, numero)`, `Evaluacion` is `OneToOne` on `Intercambio` — not just careful code.

### Warm-up is batched; adaptivity starts once there is signal

`iniciar()` asks for the first `PREGUNTAS_DE_CALENTAMIENTO` (2) questions in a **single** AI call via `generar_preguntas_iniciales()`; questions 3 onward are generated one at a time with `generar_pregunta()`, which receives the prior scores.

The reason is not the token saving (one call out of ten, ~5%). No question created before the first answer *can* be adaptive — there is nothing to adapt to — and question 2, if generated after one answer, would adapt to a **single data point**, which is noise: the candidate may have fumbled something they know. A human interviewer does not recalibrate after one answer either. Asking for both at once also lets the model make them complementary instead of risking overlap.

They are two separate contract operations rather than one with an optional `previas`, precisely because one cannot be adaptive and the other must be.

Note that `PLAN_POR_PUESTO` fixes the área of every question, so what the adaptive prompt calibrates is **the demand within the assigned topic**, not which topic comes next. The prompt says so explicitly; an earlier version told the model it could "profundizar en un área relacionada", which the plan had already made impossible.

### The grade is not published until the interview ends

The evaluation runs after every answer — that is what feeds adaptivity — but it does **not** leave the API while the interview is `EN_PROGRESO`:

- `ResponderView` does not return it at all. `services.responder()` still returns it; the view discards it.
- `ResultadosView` passes `con_evaluacion=False` to `IntercambioSerializer`, which then resolves `evaluacion` to `null` (the key stays, so the response shape does not change with state). `ABANDONADA` interviews **do** show theirs, consistent with `calcular_retroalimentacion` deliberately including unfinished ones.
- The history list (`EntrevistaSerializer`) carries `puntuacion_parcial` — the mean of the graded answers, annotated in `selectors._con_conteo` next to `preguntas_calificadas` — **only for `ABANDONADA`**; it is `null` for `EN_PROGRESO` even with graded answers, and for `FINALIZADA`, which has `puntuacion_promedio`. `test_historial_tabla.py` pins it, including that it equals the report's `resumen.promedio`.

Hiding it only in the UI would not work: `/resultados/` is what the chat uses to rebuild itself on reload, so the score would sit in the browser's network tab. This is what the profile's *"para su posterior análisis"* (Alcance) and the *"módulo de análisis de resultados"* (objetivo 5) describe, and it is what a real interview does — nobody reads your score out loud mid-session.

The consolidated report follows the same rule: `/resultados/` carries a `resumen` key — `null` while `EN_PROGRESO` — built by `selectors.resumen_de()` from the saved evaluations with **no AI call** (a spy test pins it): band and mean, mean level per criterion over the answers that have levels, the weakest criterion, the *prioridad* (área and sugerencia of the lowest-graded answer, ties to the lower `numero`) and the difference with `anterior_comparable()` — the previous `FINALIZADA` interview with the same puesto **and** nivel. A partial (abandoned) mean is never compared with a complete one, so `comparacion` is `null` there. The results screen offers "Practicar de nuevo este puesto", which preselects `?puesto=&nivel=` in `SeleccionPuestoPage` without starting anything.

Consequence worth knowing: the chat rebuild in `useEntrevista` filters by `respuesta !== ''`, **not** by `evaluacion !== null`. With grades hidden, the latter would discard the whole history.

### The CV module reports what an ATS sees, and never invents a score

`apps/curriculums/` + `integrations/documentos/` diagnose why a CV fails an ATS filter. The tutor asked for it: few systems tell the candidate *why* they were filtered out.

The finding that shapes the whole design is that **real ATS do not auto-reject by score**. Workday parses a CV into fields recruiters search and filter, Taleo runs boolean keyword searches, Greenhouse does not score at all. What eliminates a candidate is that their data never reached the fields, so they do not appear in the recruiter's search. Not rejection — invisibility.

So the module **must not** publish a "Puntaje ATS: 73/100", and for the same reason not a "72% compatible" fit score either. That is what commercial checkers sell and it is indefensible in a thesis defence ("where does the 73 come from?"). Every metric it publishes is a string — `parseabilidad` `"5/8"`, `cobertura` `"4/6"` — deliberately, because a number out of 100 would read as a quality grade or a hiring probability, and nothing in the module can support that claim.

**The measurement uses no AI**, and that is the point: a language model cannot know whether a PDF has a text layer or is laid out in two columns. Ask it and it answers confidently and partly invents. Every finding, field, state and coverage comes from measuring the document, so it is reproducible and explainable rule by rule.

AI only **suggests**, after the measurement is saved: a rewrite for each bullet without a result, how to close each `declarado`/`ausente` requirement, up to 5 likely interview questions (plus a suggested puesto that preselects `/nueva-entrevista?puesto=`), and spelling/wording fixes. The rule is *the code decides what, the AI proposes how, and the AI never changes a verdict*. Everything it returns is rendered under a "Sugerencia de IA" label, apart from the measured findings.

### The CV screen: one input card, then results in tabs

`CurriculumPage` only holds state and orchestrates. Before analysing it shows `EntradaDelAnalisis` — one card with the CV first (`ZonaDeArchivo`, labelled "PDF o DOCX · máx. 2 MB" from `MAXIMO_BYTES`, and under it the privacy note: the file is not stored, the AI only gets sections with name, email and phone masked — true by `revision.py`/`anonimizar.py`, so it may be said), then a disclosure "Comparar con una convocatoria (opcional)" (`aria-expanded`; open it reads "Quitar la convocatoria", and closing it **empties** the posting so nothing invisible is sent) wrapping `CampoConvocatoria`, then "Analizar mi CV" — with `HistorialDeAnalisis` below.

**What is shown is decided by the URL.** `/mi-cv` is the input card plus the history; `/mi-cv/:id` is one analysis, so reloading or sharing the link keeps it (same component on both routes, so going back and forth does not lose the chosen file or posting). The page keeps the result in state and loads it with `obtenerCurriculum` only when the URL asks for an id that is not in memory; an unknown or foreign id shows "No encontramos ese análisis" over the input. Analysing and opening a history row both `navigate` to `/mi-cv/:id`.

The result is `ResultadoDelAnalisis`: a context bar (file name — whose heading also tells a screen reader how many fields the ATS reads —, with/without posting, date, "Analizar otro", which goes back to `/mi-cv` keeping the file and posting) and four `Pestanas` that split the width into equal columns on phones (`repartir`) and stay `sticky` under the header: **Resumen** (`ResumenDelAnalisis`: `EspejoDelATS` — what the ATS reads of *your* CV, the module's signature, shown **only here** — with the coverage under its title; "Lo primero que mejorar" beside it from 1024 px, the top 3 via `debilidadesPorGravedad`, each a link that opens "Mejorar" with focus on that finding (`hallazgos.ts::idDeHallazgo`); "Qué ya funciona" with each strength's detail in a `<details>`; and "Practicar la entrevista"), **Mejorar** (no number in the label: inside, one line says "n correcciones medidas · m sugerencias de IA" — `correccionesMedidas()` and `sugerenciasDeIA()` are never added together, because measured and suggested never share a figure; then the ATS corrections, bullets and wording), **Requisitos** or **Tecnologías**, and **Entrevista**. Each correction's icon takes its severity colour; colour never decorates.

Errors appear where they are caused: an analysis error sits next to "Analizar mi CV" (not at the top of the page), a status line is announced while analysing, and a timeout or network failure says the analysis may already be in the history and refreshes it.

**The diagnosis does not wait for the AI.** `POST /api/curriculums/` only measures and returns `revision_ia: null` ("not yet requested"). `useRevisionDelCv` then calls `POST /api/curriculums/<id>/revision/` (its own `timeoutMs: 120_000`) — after analysing and also when a history item without a review is opened — and merges the result. While pending, `AvisoDeRevision` says "Pidiendo sugerencias a la IA…" in every AI-dependent tab and one `sr-only` live region announces the state; on a provider failure (`no_disponible`) or a client timeout it offers "Reintentar sugerencias", with no re-upload. Before this split the AI ran inside the upload request, the client aborted at 45 s and showed "no se pudo analizar" for an analysis the server had in fact saved.

**An unreadable CV gets no tabs.** `hallazgos.ts::esIlegible()` detects the backend's `sin_capa_de_texto` finding (`CODIGO_SIN_CAPA_DE_TEXTO`, pinned by a test) and the result collapses to one panel — titled by format ("Tu PDF es una imagen" for a PDF, "Tu documento no tiene texto que el ATS pueda leer" otherwise, since a DOCX is never scanned), the finding's own detail (`ats.py::_detalle_sin_capa_de_texto`, which names text boxes when a DOCX's text lives in them), "El ATS extrae 0/8 campos" and "Subir otro archivo", which drops that file (re-analysing it would give the same result) — because the rest is empty by construction and showing it blamed the wrong thing ("your posting has no requirements", "your skills are in bars").

**Severities are named by their effect on the ATS**, not as a verdict on the CV: `critica` "Impide la lectura", `alta` "Resta visibilidad", `media` "Detalle" (`hallazgos.ts::SEVERIDADES`, the only definition; `ListaDeHallazgos.tsx::ChipDeSeveridad` renders it apart from the title with an sr-only "Efecto:"). The state colours did not change.

**This screen is closed.** After `cv-cierre-final` it is only reopened for a P0/P1 defect; P2/P3 polish found later goes to `openspec/changes/cv-cierre-final/pendientes.md` and does not open a new change. Three larger ideas are explicitly future work, outside this screen: comparing two analyses of the same CV, showing the CV text beside the ATS record, and accepting a posting as an image (needs OCR).

### Two routes through the CV module, and only one section differs

The screen asks for the CV and, **optionally**, the convocatoria (job posting) to measure it against — pasted, or uploaded as PDF/DOCX. There is no puesto selector: there was one, and it affected nothing (`ats.analizar()` never received it, so backend/frontend/full-stack produced byte-identical results). A required step with no consequence is worse than no step, because it promises the choice matters.

| Section | Without convocatoria | With convocatoria |
|---|---|---|
| Espejo del ATS | the 8-field ficha | same |
| Qué corregir / conservar | 16 possible weaknesses, 4 strengths | + `idioma_distinto` |
| **Third section** | **inventario** of legible terms | **mapa de evidencia** |
| Viñetas de logro | achievement vs task bullets | same |

Only the third row changes (plus the one weakness that needs both documents), and the same `terminos.py` dictionary feeds both. That is what makes the convocatoria feel genuinely optional rather than the difference between useful and useless. The inventario also does something the mirror alone cannot: if the skills are in level bars, it comes back empty, which turns `habilidades_en_graficos` from a suspicion into proof.

### The evidence map is three states, not two

For each requirement the posting asks: `demostrado` (appears in experiencia/proyectos), `declarado` (only in the habilidades list), or `ausente`. `declarado` counts as covered — what the state qualifies is the *strength* of the evidence, not its existence.

The reason: "Django" in a comma-separated list and "Django" inside an achievement index identically for the machine and are worth very different things to the person reading. Recruiters make that distinction; the average candidate does not know it exists. `test_un_termino_solo_en_habilidades_esta_declarado` pins it.

This needs `secciones.py::segmentar()`, which splits the CV into blocks by its headings. When the headings are not recognised there is nothing to segment, so the state degrades to `presente`/`ausente` **and says so** — chaining with `secciones_no_reconocidas`, which is already reported. A formatting weakness degrades the content analysis, and stating that is more honest than showing a half-map with no explanation.

Above the technology groups the map shows two **requisitos del puesto**, which do not count towards `cobertura`: the years of experience the posting demands (`cumple` / `no_alcanza` / `no_calculable`) — the knockout question is the only real automatic rejection an ATS performs — and the cargo, with the same states as a technology. The years compare against `fechas.experiencia()`, which merges overlapping periods and sums **only the experiencia section** (summing the whole CV would count the degree). When dates are mixed or year-only it flags `posible_subestimacion`; it never suggests changing the experience to reach the minimum.

### Every rule is one function in a registry, and the ruleset is versioned

`ats.py` runs `_VERIFICACIONES` in order over a `_Contexto` (header, experience, detected name — computed once). The contact detectors (`CORREO`, `URL`, `telefonos`, `detectar_telefono`, `detectar_nombre`) live in `integrations/documentos/contacto.py` and the two-column detection in `geometria.py`, so `anonimizar.py` and `revision.py` reuse the detectors without loading the whole ruleset; `ats.py` re-exports them for old imports. Adding a rule is one `_verificar_*` and one registry entry. `CAMPOS_DE_LA_FICHA` is the only list of fields; a test pins that the verifications emit exactly those, in order. Order matters in one place: `_verificar_zonas_ocultas` runs before `_verificar_contacto`, because if the email is only in the page header the critical finding is *that one*, and it replaces `sin_correo` — one failure, one warning.

`VERSION_DE_REGLAS` is stored on every `AnalisisATS`. A cached analysis from an older version is recomputed **in place** (`update_or_create` on the OneToOne) when the same CV is uploaded again. **Bump it whenever what `analizar()` or `brecha.calcular()` produce changes**, or users keep seeing stale diagnoses. It is 4 since `terminos.py` learned the game engines and the «Desarrollador de Videojuegos» cargo (3 was when the unreadable-CV detail started depending on the format).

### What the extractor records apart from `texto`

`DocumentoExtraido.texto` is what a typical parser reads. Text in DOCX text boxes (`w:txbxContent`, read once — Word stores each box twice, in `mc:Choice` and `mc:Fallback`), in DOCX headers/footers, and in PDF lines repeated in the top/bottom band of **every** page goes to `texto_en_cuadros` / `texto_en_encabezado` instead, and white or sub-4pt PDF characters are counted in `caracteres_ocultos` (white text over a filled colour rectangle is excluded). Adding them to `texto` would make the mirror claim the ATS sees an email it does not. A one-page PDF is never checked for header/footer: a PDF does not keep the distinction between a Word header and the CV's first line, and guessing would be worse than not reporting.

The cache hash uses `documento.huella` — the text plus those hidden parts — so two DOCX differing only in their header are different documents. For a CV with no hidden text `huella == texto`, so ordinary CVs keep their cache key.

### Five things to know before touching this module

- **A scanned PDF is not an error, it is the most valuable finding.** `integrations/documentos/exceptions.py` only covers cases where there is nothing to analyse (unsupported format, unopenable file, over the hard page cap). "No text layer" is reported inside the analysis, and when it happens `ats.py` reports *only* that and stops: running the other rules over empty text would produce a list of false weaknesses drowning the one that matters. `brecha.calcular()` returns `None` for the same reason — "0 of 6 requirements" would be a false claim when the truth is nobody can read the document. That is why it takes the `DocumentoExtraido` and not its text: `tiene_capa_de_texto` is the single place the legibility threshold lives, and an empty-text check is not enough because a scanned PDF carries stray artefacts.
- **Section matching is by whole line, and loosening it would erase the module's best demonstration.** In a two-column CV the extracted text interleaves (`"Habilidades Optimice consultas y"`), so the headings are no longer alone on their line and stop being recognised. That cascade — columns scramble the text, the parser loses the sections — is exactly what a real ATS suffers, and `test_dos_columnas_arrastra_la_perdida_de_las_secciones` pins it. `secciones.py::titulo_de()` is shared by `ats.py` and `segmentar()` on purpose: if the two criteria diverged, the analysis could report a section as recognised and then fail to find its block, showing the user two contradictory claims.
- **The file is never stored.** No `FileField`, no `MEDIA_ROOT`. Render's free tier has an ephemeral disk, a CV carries a real person's phone and address, and the bytes are useless once parsed. Only the extracted text, its hash and the analysis persist. `texto` and `convocatoria` are deliberately excluded from `CurriculumSerializer`.
- **The cache key is the extracted text plus the convocatoria, and "no convocatoria" stores the hash of the empty string, never NULL.** Re-exporting the same CV from Word yields different bytes and identical text; what matters is whether there is anything new to analyse. Postgres treats NULLs as distinct, so with NULL the `UniqueConstraint(usuario, hash_texto, hash_convocatoria)` would not fire and the cache would break **in the most common case**, silently accumulating duplicates.
- **The bullet analysis is labelled apart from the ATS sections, and that is a requirement.** An ATS does not care whether a bullet has metrics; that advice is for the human who reads the CV after the machine found it. `vinetas.py` says so in its docstring and `VinetasDeLogro.tsx` renders under its own heading. Mixing it under "filtros ATS" would be imprecise, and precision about what an ATS actually does is what holds up the module's credibility.
- **Not every configured provider may receive a CV.** Every `ProveedorIA` declares `apto_para_datos_personales` (default `False`). DeepSeek and OpenRouter are `False` — DeepSeek stores data in China and trains on it by default, with no opt-out outside the EU/UK/CH. `factory.get_revisor_de_cv()` filters the configured list **by class, before instantiating**, keeping only apt providers that implement `revisar_cv`; with none left it raises `ProveedorNoDisponible`, which `revision.py` already turns into `no_disponible`. So `IA_PROVEEDOR=gemini,deepseek` interviews with both but reviews CVs only with Gemini, and `IA_PROVEEDOR=deepseek` alone leaves CV review unavailable while the measured diagnosis is still complete. `ProveedorNoAptoTest` in `test_frontera_con_ia.py` pins it through the real factory path.
- **Only `apps/curriculums/revision.py` may import `integrations.ia`, and what it sends is enforced.** The reason is `Curriculum.texto` — the full CV of a real person. Two barriers, in this order: **minimisation** (only the blocks of recognised sections from `segmentar()`, which drop the header by construction — never the full text, the header/footer text or text boxes) and **masking** (`integrations/documentos/anonimizar.py` replaces emails, links, phones and the detected name, reusing the detectors in `contacto.py`; the AI parsers recognise those masks through `integrations/ia/prompts/marcadores.py`, and `tests/integration/test_marcadores.py` keeps the two lists in sync). With no recognised sections or no text layer, the provider is **not called** (`revision_ia.estado = "omitida"`): there is no safe way to separate personal data from the rest. `tests/test_frontera_con_ia.py` checks it three ways — statically with `ast` (only `revision.py` imports the AI layer), with a spy provider (name, email, phone and city of the fixture never reach it; it is not called on creative titles or a scanned PDF), and with a `sys.meta_path` guard (with an injected reviewer, nothing else in the call chain loads the AI layer). Each was verified by injecting the violation. **If it goes red, fix the leak, never relax the test.**

  The AI call is **a separate request**: `services.revisar(usuario, pk)` behind `POST /api/curriculums/<id>/revision/` (throttle scope `revisar-cv`, 404 for someone else's analysis), never inside the upload. The file is not stored, but what the review uses is: it rebuilds `DocumentoExtraido(texto, formato, paginas)` from `Curriculum` (hidden header/text-box text is not needed — it never reaches the AI). It runs outside any transaction, like the evaluation in `responder()`. A current review is returned without calling the provider; only a never-requested or failed one is retried (`revision.necesita_revision()`). Any `ErrorProveedorIA` becomes `revision_ia.estado = "no_disponible"` with a 200 — the diagnosis never depends on the provider. A recomputed diagnosis (new rules) resets `revision_ia` to `None`, since old suggestions were anchored to bullets and requirements that may have changed. The parser in `integrations/ia/prompts/revisor_cv.py` drops anything not anchored to the input (a bullet not sent, a requirement not in the gap, a correction whose original is not literally in the CV, a question whose motive is not in the texts, a puesto outside the enum, anything echoing a mask marker). `RevisorDeCV` is a `Protocol` in `base.py`, implemented by `ProveedorIAporJSON` (so Gemini and Claude get it for free) and `FakeProveedorIA`; it is deliberately not an abstract method of `ProveedorIA`, so the interview test doubles don't have to implement it.

  Two lessons from the earlier version of the frontier test are baked into it. The first version patched `integrations.ia.factory.get_proveedor` and **passed even with the violation injected**: a module that did `from ... import get_proveedor` already copied the reference, so replacing it at the source intercepts nothing. The second: the static check *does* see a deferred import inside a function, because `ast.walk` traverses function bodies — what the runtime hook actually adds is an import happening **outside** the app's own files. Both claims were verified by injecting violations, not assumed.

Tests split by level on purpose: the rules are tested by building a `DocumentoExtraido` in code (exact and fast), and the geometry against real PDFs in `backend/tests/fixtures/cv/`, because detecting columns depends on real coordinates. Those fixtures are generated by `generar.py`, which writes the PDFs **by hand** with no library — it adds no test-only dependency and, more importantly, gives exact control over where each word lands (and its colour), which is what a column or hidden-text detector has to be pinned against. The two DOCX fixtures use `python-docx` plus raw XML, since what they pin is *where* a text lives (a text box, the page header), not coordinates.

### The migrations of `curriculums` are a worked example of Postgres ordering

Worth reading before adding another. `0002` adds the new columns **before** removing `puesto`, because Django emits `SET CONSTRAINTS ... IMMEDIATE` when dropping a foreign key and that leaves the table with pending trigger events — any later `ALTER TABLE` or `CREATE INDEX` on it in the same transaction then fails. Its dedup `DELETE` (needed because rows that only differed by puesto became duplicates) goes last for the same reason, and the new `UniqueConstraint` had to move to `0003` because a migration is the unit of atomicity. `0004` backfills `hash_convocatoria`, which `0002` left as the empty string rather than its hash on pre-existing rows.

Neither `hash_texto` nor `hash_convocatoria` has an index of its own: the only query filters on all three columns together, so the constraint's composite index serves it by prefix. `hash_convocatoria` never had one (its `CREATE INDEX` was what collided with the pending triggers) and `hash_texto`'s was dropped in `0005`, which round-trips cleanly because it drops an index without touching a foreign key or deleting rows.

`0006` adds `version_reglas` with default 1 (what every earlier analysis is) — a plain `ADD COLUMN`, reversible, no backfill. `0007` adds the nullable `revision_ia`; no backfill either, because a migration must never call an external provider.

`0002` is **not reversible** and says so rather than pretending: reversing re-adds `puesto_id` as NOT NULL and existing rows have no value to put there. Dropping a column with nothing to backfill is one-way.

### Error taxonomy translates provider failures into HTTP codes

`integrations/ia/exceptions.py` defines `ErrorTransitorio` / `ErrorPermanente` / `RespuestaIAInvalida`. Every adapter translates its own SDK's exceptions into these.

`integrations/documentos/exceptions.py` defines a parallel one for reading a CV: `FormatoNoSoportado` / `DocumentoCorrupto` / `DocumentoDemasiadoGrande`, all of which become **400** — the problem is in the file the client sent, nothing is down and there is nothing to retry.

`apps/common/exceptions.py::manejador_de_excepciones` is the **single** place that turns both taxonomies into HTTP (AI: 503 / 502 / 502; documents: 400), registered as DRF's `EXCEPTION_HANDLER`. Views don't catch provider errors — they let them propagate. `apps/usuarios/views.py` does not follow this pattern for Google auth failures; it handles them inline.

### Ownership checks return 404, never 403

`apps/entrevistas/selectors.py::entrevista_del_usuario()` fetches with `get_object_or_404(Entrevista, pk=pk, usuario=usuario)`. Requesting another user's interview returns 404 — existence is never leaked via a 403. Filtering inside the query is what guarantees this; `apps/common/permissions.py::EsPropietario` exists for generic views where that isn't possible, and documents the tradeoff.

### Two login paths converge on the same token issuance

Email/password goes through simplejwt's stock `TokenObtainPairView` (works out of the box because `Usuario.USERNAME_FIELD = "email"`). Google goes through a custom view that verifies an ID token via `google-auth` against `GOOGLE_OAUTH_CLIENT_ID`, then finds-or-creates a `Usuario` by email (new accounts get `set_unusable_password()`). Both paths end up issuing the same access/refresh JWT pair, so the rest of the app never needs to know which one was used.

**Changing the password** (`POST /api/auth/contrasena`, `CambiarContrasenaView`, throttle scope `contrasena` 5/min) requires the current one and runs the registration validators on the new one; errors come per field (`actual`, `nueva`). Inside one transaction it sets the password and blacklists **every** `OutstandingToken` of the user, then returns a fresh pair, so this device stays signed in and the others cannot refresh. That relies on `rest_framework_simplejwt.token_blacklist` (in `INSTALLED_APPS`; it records every refresh issued by `RefreshToken.for_user` and makes `TokenRefreshView` reject blacklisted ones). Two documented limits: access tokens already issued live until they expire (15 min), and refresh tokens issued before the app was enabled were never recorded, so they just expire (7 days). `python manage.py flushexpiredtokens` prunes the table. Google accounts have no usable password: `PerfilSerializer.tiene_contrasena` is `false`, and "Mi perfil" shows a notice instead of the button — creating a password without any other proof would let a stolen session take the account. The UI is a "Seguridad" section in `PerfilPage` that opens `features/perfil/components/ModalCambiarContrasena.tsx` (a real `<form>` inside `Modal`, so Enter submits and password managers recognise the fields).

### An interview can start from a job posting

The "Con convocatoria" tab of the selection form (`PanelDeConvocatoria`: paste text 30-5000 chars or upload PDF/DOCX, one or the other) calls `POST /api/entrevistas/convocatoria/` → `apps/entrevistas/convocatorias.py::analizar_convocatoria()`:

1. **Masks** the posting (`anonimizar.enmascarar`: recruiter emails, phones, links) — what is stored in `Convocatoria.texto` and what reaches the AI. The file itself is never stored.
2. **Cache:** `UniqueConstraint(usuario, hash)` on the masked text; the same posting never costs a second AI call, and a `no_identificado` result is cached too.
3. **The code measures first:** `convocatoria.partir()` extracts recognised terms, years and cargo — hints for the model and the basis for anchoring.
4. **The AI classifies within the catalog** (`prompts/analista_convocatoria.py`; `Protocol AnalizadorDeConvocatoria`, inherited by every JSON adapter, the fake and the chain; `factory.get_analizador_de_convocatoria()`). `parsear_perfil()` anchors everything: a puesto outside the active catalog → not identified (422, never a default profile); `tecnologias` is a list, at most one per layer and all of that puesto — a foreign one is dropped, not replaced (profiles saved before, with a single `tecnologia`, are normalised on read by `ConvocatoriaSerializer`); an invalid nivel → the first one, flagged `nivel_supuesto`; each requisito must appear in the posting or among the recognised terms, masking markers are dropped, max 8 (`fuera_de_alcance` max 5).

Not personal data of the candidate and masked, so **any** configured provider may analyse it — no `apto_para_datos_personales` filter, unlike the CV. The AI call runs outside any transaction; the row is saved with `get_or_create`.

A successful analysis fills the shared selection, shows what was detected and sends `convocatoria` (id, must be the user's — 404 otherwise) when starting. `Entrevista.convocatoria` (nullable, PROTECT) feeds `ContextoDeEntrevista.requisitos`, which **only the interviewer reads**: its prompt lists them and anchors the tecnología / profundidad / caso práctico questions on them when they fit the área. **The evaluator never receives them**, so a grade means the same with or without a posting; the 5-question plan, áreas and statistics are unchanged. The interview header shows "Basada en tu convocatoria" (`desde_convocatoria`). File validation shared with the CV module lives in `apps/common/archivos.py`.

### Two ways an interview becomes `ABANDONADA`

- **Passive:** `services.marcar_abandonadas()` closes every `EN_PROGRESO` interview idle for more than `MINUTOS_PARA_ABANDONO` (30). It runs lazily when the user opens their history — the free tier has no reliable scheduler.
- **Manual:** the "Abandonar" button in the interview header opens `ModalDeConfirmacion` (it states how many answers the partial grade will be based on and that the interview cannot be resumed), then calls `POST /api/entrevistas/<id>/abandonar/` → `services.abandonar()`. That is a single update conditioned on `estado=EN_PROGRESO`, so it cannot overwrite a `FINALIZADA` that a concurrent last answer just produced (409 instead); it sets `fecha_fin` and leaves `puntuacion_promedio` empty, like the passive path. The button is disabled while an answer is being evaluated, and on success the screen replaces itself with the partial report.

### Retroalimentación acumulada counts unfinished interviews too

`apps/evaluaciones/selectors.py::calcular_retroalimentacion()` (served at `/api/estadisticas/retroalimentacion/`) deliberately does **not** filter by `estado=FINALIZADA`: a weakness found in question 3 of an abandoned interview is still a real weakness. Unanswered questions drop out by construction — it queries `Evaluacion`, and an ungraded intercambio has no row.

Band counts are grouped in SQL with a range filter built from `rubricas.BANDAS`, so the thresholds stay in one place. The textual observations are returned raw, capped at `MAXIMO_OBSERVACIONES`; nothing is summarized, which would mean a fresh AI call per view.

### Aggregates are computed in the database, not in Python

`calcular_retroalimentacion` uses Django's `Avg`/`Count` directly on `Evaluacion` rows (weighted per answer), not by averaging each interview's already-averaged score — deliberate, since the latter would misweight interviews with different numbers of scored answers.

An interview's own grade is the simple mean of its answers' grades (`promedio_de_evaluaciones`). An `ABANDONADA` interview never stores `puntuacion_promedio`; the results screen computes the same mean from its published evaluations and labels it **parcial**, "sobre k de 5", using `preguntas_calificadas` / `preguntas_previstas` from `EntrevistaSerializer` (annotated in `selectors._con_conteo` so the history list stays one query).

### Authenticated shell: dark sidebar, header names the section

`router/RutaProtegida.tsx` renders `components/layout/Sidebar.tsx` as a full-height panel on the left and, to its right, a sticky `Header` (`h-16`, always light) above `main`. The sidebar has **three behaviours by width**:
- **below 768 px**, a `role="dialog"` drawer opened from the header's ☰;
- **768–1023 px**, a fixed 72 px icon rail that is **always folded**, with labels in `Tooltip`s and no fold button (a 256 px sidebar would leave 512 px of content);
- **1024 px and up**, the full sidebar, collapsible as before.

The labels and tooltips depend on the `plegado` prop, not on classes, so the shell reads `useMediaQuery(DESDE_ESCRITORIO)` (`hooks/useMediaQuery.ts`, `useSyncExternalStore` over `matchMedia`) and passes `plegado || !esEscritorio`; `onAlternarPlegado` is only passed on desktop, so `SidebarMarca` hides the toggle elsewhere. `useCajonNavegacion` closes the drawer when the window widens past 768 px, so focus is never trapped in something no longer painted. Folded items are 44 px touch targets.

**One content container for every screen:** `main` wraps the `Outlet` in `max-w-7xl` (1280 px) **without `mx-auto`**, aligned to the sidebar. Pages must not wrap themselves in `mx-auto max-w-*` — that is what left empty bands on both sides. Pages spread into columns on desktop (Perfil 2 columns, CV input 2 columns, Retroalimentación 1 + 2) and stack below 1024 px. What must not stretch limits itself and stays left-aligned with the title: the interview chat at `max-w-3xl`, intro paragraphs at `max-w-prose`. "Nueva entrevista" uses the full container: on desktop the fields sit in one row (Puesto | Nivel | Tecnología, or four with Full Stack's two layers), the summary and "Iniciar entrevista" share one row, and "Con convocatoria" is two columns (input left, `ResumenDeConvocatoria` right, with a dashed placeholder before the first analysis so the input does not jump). The chat uses `100dvh`, not `100vh`, so the mobile browser bar never hides the answer field; `.modal` has `max-height: calc(100dvh - 2rem)` and scrolls inside on short screens.

Both share the same `bg-vidrio-ink` and the same `Sidebar` component; `components/layout/destinos.ts` is the single source of nav items both render (`GRUPOS_DE_DESTINOS`), so adding a section is one edit, not two.

**What the sidebar offers, top to bottom:** the brand; the primary action ("Nueva entrevista", plus "Continuar · n/total" when an interview is half-done, fed by `useEntrevistaEnCurso`, which shares the `historial` cache key with the history screen); the destinations **grouped by stage** — "Prepararte" (Revisar mi CV) and "Tu progreso" (Historial y progreso, Retroalimentación), each an `h2` + `ul aria-labelledby`, the label turning into a `Divisor` (and `sr-only`) when folded; and at the foot the user block, which **is** the link to `/perfil` (`aria-current` when there; folded, the avatar in a "Mi perfil" tooltip), then "Cerrar sesión". There are **no conditional destinations** any more: "Entrevista en curso" duplicated "Continuar", "Resultados" only reached the latest report that Historial already lists, and "Mi perfil" duplicated the user block. Active/hover/focus styling for every sidebar link comes from `Sidebar/clasesDeEnlace.ts`.

The dark theme is not a second brand color: `vidrio-ink` is the same ink used for headings elsewhere, at full strength. The active destination is a translucent white fill (`bg-white/[0.12]`) plus `aria-current="page"`; the sidebar's text uses `vidrio-sidebar-muted`, the only token meant for the dark surface. Focus there is `foco-claro` (a white ring), since the accent ring does not show on ink.

`Header.tsx` no longer repeats the app's name — the sidebar has its own brand block (reusing the same `IconoNav` `marca` path as `features/landing/components/Icono.tsx::marca`, so the mark looks identical in the landing and the app). Instead the header shows the current section's name, resolved by `components/layout/titulosDeRuta.ts::resolverTitulo()` from a static route → title map, not from each page declaring its own — a route that forgets to register can't leave the header blank, it falls back to a default. That label is a `<p>`, not an `<h1>`: every page under `RutaProtegida` already owns its own `<h1>`, and a second one in the header would break the one-`h1`-per-page hierarchy.

### Style system: tokens, CSS layers and base components

Tailwind v4 stays; what was missing was a place to control style from. Every visual decision now has one home:

- **`src/styles/`** — `index.css` only imports the layers:
  - `tokens.css`: the `@theme` (colors `vidrio-*`, semantic `exito/progreso/error-*` and the categorical `puesto-<codigo>` — Okabe-Ito, colour-blind safe, never meaning a grade —, radii `control` 8px / `chip` / `vidrio` / `burbuja` / `tarjeta`, shadows `tarjeta` / `flotante` / `cabecera` / `modal` / `sobre-oscuro`, the `velo` color, type scale incl. `titulo-auth`) plus `--gradiente-hero` (used as `bg-(image:--gradiente-hero)`). Change a value here and it changes everywhere.
  - `base.css`: `body`, `::selection`, the skip link, `prefers-reduced-motion`.
  - `utilidades.css`: `@utility foco-anillo` (accent focus ring), `foco-claro` (white ring for dark surfaces) and `campo` (the one field box: border, white fill, 8px, focus ring via `:focus-visible`/`:focus-within`, disabled, and the error border when the field — or a field inside it, `:has([aria-invalid='true'])` — is invalid). `campo` deliberately sets no text color or height, so it never fights another utility over the same property.
  - `overlays.css`: `.modal` (box, shadow, `::backdrop` with the shared `--color-velo` and a 2px blur, entry animation from `@starting-style`) and `.velo` / `.cajon` for the mobile drawer. There is **no exit animation**: `Modal` is mounted only while open and its caller unmounts it, and delaying that would also delay `focoAlCerrar`.
- **Shape rule:** an **action** (a button with text) is a pill; a **control** (icon-only button, field, card) uses 8px (`rounded-control`). No hand-written radii.
- **Base components are the only door:**
  - `Boton` — variants `primario` / `secundario` / `contorno` / `texto` / `peligro` / `fantasma` (dark sidebar, `foco-claro`), sizes `sm` / `md` / `lg` (`lg` = login submit and landing CTA), always pill, `type="button"` by default, `aria-busy` while `cargando`. There is no `forma` prop anymore.
  - `clasesDeBoton({ variante, tamano, className })` in `components/ui/estilosDeBoton.ts` (a `.ts`, so `Boton.tsx` exports only a component) — the same classes `Boton` uses, for a `Link` that must look like a button. **Never wrap a `Boton` in a `Link`**: that nests a `<button>` in an `<a>`.
  - `BotonIcono` — required `aria-label`, `tono` `claro` / `oscuro` / `contorno`, `tamano` `sm` 32 / `md` 40 / `lg` 44px, 8px radius.
  - `Chip` — small pill: a clickable suggestion with `onClick`, a read-only label without it.
  - `Tabla<T>` — declared `columnas` (`clave`, `titulo`, `celda`, `alinear`) inside the glass `Tarjeta`, real `th scope="col"` and an sr-only `caption`; below 640 px each row is drawn by the `tarjeta` render prop as a stacked card (the two views switch with CSS, so nothing is read twice). `refInicio` takes focus on page change.
  - `CampoBusqueda` — magnifier, controlled `input type="search"` in a `campo` box, sr-only label and a «Borrar búsqueda» X while it has text. "Tus entrevistas" puts it beside two `CampoSelect`s, Estado and Nivel (`marcador={null}`, `ocultarEtiqueta`; the Nivel options come from the catalog, and with a nivel chosen the evolution shows only that card, full width); — there is deliberately no origin filter (personalizada / con convocatoria); text, estado and nivel filter in the client (`historial.ts::filtrarEntrevistas`, case- and accent-insensitive over puesto, tecnología and nivel), live in `?q=` / `?estado=` / `?nivel=` (written with `replace`, resetting `?pagina=`), and an empty result shows «Limpiar búsqueda». The table still tags those rows with the «Convocatoria» pill. `EtiquetaConvocatoria` is the one «Convocatoria» pill (selection summary, start modal, history table).
  - `Paginacion` — only ‹ › and **at most 3 consecutive page numbers**, right-aligned, with no visible "Mostrando X–Y de N" (an `sr-only` `aria-live` line announces "Página p de total") (`lib/paginacion.ts::paginasVisibles`, Vitest-tested; no "…"); hidden with one page. "Tus entrevistas" (`features/historial/components/TablaDeEntrevistas.tsx`) uses both, 10 rows per page, client-side, with the page in `?pagina=`.
  - Fields (`Textarea`, `CampoSelect`, `CampoAuth`, `CampoConvocatoria`) all use `campo`; `ControlSegmentado` (now with `ocultarEtiqueta` and `deshabilitado`) is reused instead of re-implemented.
- **Guard:** `src/estilos.test.ts` (Vitest, plain `fs`) fails on a `<button` outside `components/ui/`, a hand-written `shadow-[`, `rounded-[`, `text-[<number>`, an arbitrary hex/rgba color class, a raw Tailwind palette color (`indigo-600`…) or a 6-digit hex in a component. A second test reads the `--text-<name>` tokens from `tokens.css` and fails on any `text-<family>-…` class of those families (`headline`, `body`, `label`, `metric`…) that is not defined — Tailwind silently skips an unknown class, which is how `text-headline-lg` once rendered a heading at inherited size. Exceptions live in its `EXCEPCIONES` map, each with a reason (Google brand colors, chart category colors, the file dropzone, the carousel dots, the CV history row), and a second test fails if an exception is no longer needed. It was verified by injecting a violation. **If it goes red, use a token or a base component; add an exception only with a real reason.**

### Naming convention

Domain code (models, fields, function names — `Usuario`, `Entrevista`, `Intercambio`, `Evaluacion`, `puntuacion`, `respuesta`) is Spanish throughout, matching the thesis document. Project scaffolding and technical folder names (`apps/`, `integrations/`, `views.py`, `tests/`) follow standard Django/English convention. This split is intentional, not inconsistent.
