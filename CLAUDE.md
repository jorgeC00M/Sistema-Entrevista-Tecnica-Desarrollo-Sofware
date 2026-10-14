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
python manage.py test                                   # full suite (auto-discovery, 406 tests)
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
```

TypeScript is `strict` with no `allowJs` — there are zero `.js`/`.jsx` files left in `src/`. No frontend test runner is configured, so `tsc --noEmit` plus the build is the only automated check the frontend has.

### Environment

Both `backend/.env` and `frontend/.env` are gitignored; copy from the corresponding `.env.example`. Key variables:

- `IA_PROVEEDOR` (backend) — `fake` | `gemini` | `anthropic` | `deepseek` | `openrouter`, or several comma-separated (`gemini,deepseek`) to form a fallback chain. Defaults to `fake` (deterministic, no network) so nothing ever burns API quota by accident. `anthropic` is the documented production engine; the rest are internal fallbacks not mentioned in the academic profile.
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

`CatalogosPublicosView` subclasses `CatalogosView` and only swaps `permission_classes` to `AllowAny`, served at `/api/catalogos/publico/`. The authenticated route stays 401 — `test_requiere_autenticacion` asserts it — so the boundary between what the system publishes and what it hands only to users stays explicit.

`Puesto`, `Nivel`, `Tecnologia` and `Area` are real tables in `apps/catalogos/`, seeded by data migrations (`0002` the original areas/levels, `0004` the puestos, tecnologías and four extra areas). `Entrevista.puesto` / `.nivel` are `ForeignKey(..., on_delete=PROTECT)`; `.tecnologia` is the same but nullable — NULL means "no stack preference", which is not the same as a row called "indifferent".

The bridge to the Django-free IA layer is the `codigo` field: its values match the `AreaTecnica` / `Nivel` / `Puesto` / `Tecnologia` enums in `integrations/ia/prompts/schemas.py`, and `Entrevista.puesto_enum` does `Puesto(self.puesto.codigo)`. Two tests in `apps/catalogos/tests/test_catalogos.py` keep the two sides in sync: `test_codigos_coinciden_con_los_enums_de_la_capa_de_ia` (codes) and `test_los_nombres_visibles_coinciden_con_las_etiquetas_de_la_capa_de_ia` (display names — the user must read the same label the model is told).

The API exposes `codigo`, never the numeric id (`SlugRelatedField`), so the frontend contract is unchanged by the normalization.

### An interview is a puesto, not an área

The user picks a **puesto** (`backend`, `frontend`, `full_stack`), a **nivel** and optionally a **tecnología** — never an área. That is the framing of a real application: nobody applies for a "Bases de Datos" position.

`PLAN_POR_PUESTO` in `integrations/ia/prompts/schemas.py` maps each puesto to a tuple of exactly `PREGUNTAS_POR_ENTREVISTA` áreas — the área of question *n* is `area_de_la_pregunta(puesto, n)`. It is deterministic, not random, so an interview is reproducible, explainable in the thesis defence, and testable. It lives in the AI layer rather than the DB because it is simulation design, not reference data the user administers.

Consequences worth knowing before touching this:

- **`Area` lives on `Intercambio`, not on `Entrevista`.** It is persisted per question rather than recomputed from the puesto, so changing a plan later never rewrites the history of someone who already sat the interview.
- **Statistics group by `intercambio__area`** (`apps/evaluaciones/selectors.py`). Before, one interview had a single área and its five answers all inherited that label; now the per-topic breakdown is real.
- **`evolucion` is per interview, so it is labelled by puesto**, not área — a point on the chart is "my Backend interview", not "my Bases de Datos interview".
- The selección screen shows the áreas each puesto covers (`PuestoSerializer.get_areas`). That is what keeps the thesis profile's objetivo específico 2 ("módulo de selección de diferentes áreas") visibly satisfied now that áreas are bundled rather than picked one at a time. They are listed in `features/seleccion/components/PanelDeSesion.tsx`, once, for the puesto currently chosen — not inside each `TarjetaPuesto`, where repeating them three times made the cards tall enough to wrap onto a second row and stop being comparable at a glance.

### Entrevistador and evaluador are separate roles, deliberately isolated

Two distinct prompts live in `integrations/ia/prompts/`:
- `entrevistador.py` generates the next question. It receives a **compressed summary** of prior turns (`TemaEvaluado`: topic + score only) — never the full Q&A history — to keep prompt size bounded regardless of interview length. Built by `apps/entrevistas/selectors.py::temas_evaluados()`, always from the DB, never from memory (Render free tier sleeps and restarts mid-interview).
- `evaluador.py` scores one answer against a fixed rubric. It is a pure function of (contexto, area, pregunta, respuesta) — it never receives conversation history, so the same answer always scores the same way independent of when it was given. `ContextoDeEntrevista` (puesto, nivel, tecnología) is constant for the whole interview, so bundling it does not break that purity.

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

Hiding it only in the UI would not work: `/resultados/` is what the chat uses to rebuild itself on reload, so the score would sit in the browser's network tab. This is what the profile's *"para su posterior análisis"* (Alcance) and the *"módulo de análisis de resultados"* (objetivo 5) describe, and it is what a real interview does — nobody reads your score out loud mid-session.

The consolidated report follows the same rule: `/resultados/` carries a `resumen` key — `null` while `EN_PROGRESO` — built by `selectors.resumen_de()` from the saved evaluations with **no AI call** (a spy test pins it): band and mean, mean level per criterion over the answers that have levels, the weakest criterion, the *prioridad* (área and sugerencia of the lowest-graded answer, ties to the lower `numero`) and the difference with `anterior_comparable()` — the previous `FINALIZADA` interview with the same puesto **and** nivel. A partial (abandoned) mean is never compared with a complete one, so `comparacion` is `null` there. The results screen offers "Practicar de nuevo este puesto", which preselects `?puesto=&nivel=` in `SeleccionPuestoPage` without starting anything.

Consequence worth knowing: the chat rebuild in `useEntrevista` filters by `respuesta !== ''`, **not** by `evaluacion !== null`. With grades hidden, the latter would discard the whole history.

### The CV module reports what an ATS sees, and never invents a score

`apps/curriculums/` + `integrations/documentos/` diagnose why a CV fails an ATS filter. The tutor asked for it: few systems tell the candidate *why* they were filtered out.

The finding that shapes the whole design is that **real ATS do not auto-reject by score**. Workday parses a CV into fields recruiters search and filter, Taleo runs boolean keyword searches, Greenhouse does not score at all. What eliminates a candidate is that their data never reached the fields, so they do not appear in the recruiter's search. Not rejection — invisibility.

So the module **must not** publish a "Puntaje ATS: 73/100", and for the same reason not a "72% compatible" fit score either. That is what commercial checkers sell and it is indefensible in a thesis defence ("where does the 73 come from?"). Every metric it publishes is a string — `parseabilidad` `"5/8"`, `cobertura` `"4/6"` — deliberately, because a number out of 100 would read as a quality grade or a hiring probability, and nothing in the module can support that claim.

**The measurement uses no AI**, and that is the point: a language model cannot know whether a PDF has a text layer or is laid out in two columns. Ask it and it answers confidently and partly invents. Every finding, field, state and coverage comes from measuring the document, so it is reproducible and explainable rule by rule.

AI only **suggests**, after the measurement is saved: a rewrite for each bullet without a result, how to close each `declarado`/`ausente` requirement, up to 5 likely interview questions (plus a suggested puesto that preselects `/nueva-entrevista?puesto=`), and spelling/wording fixes. The rule is *the code decides what, the AI proposes how, and the AI never changes a verdict*. Everything it returns is rendered under a "Sugerencia de IA" label, apart from the measured findings.

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

`ats.py` runs `_VERIFICACIONES` in order over a `_Contexto` (segments, header, experience — computed once). Adding a rule is one `_verificar_*` and one registry entry. `CAMPOS_DE_LA_FICHA` is the only list of fields; a test pins that the verifications emit exactly those, in order. Order matters in one place: `_verificar_zonas_ocultas` runs before `_verificar_contacto`, because if the email is only in the page header the critical finding is *that one*, and it replaces `sin_correo` — one failure, one warning.

`VERSION_DE_REGLAS` is stored on every `AnalisisATS`. A cached analysis from an older version is recomputed **in place** (`update_or_create` on the OneToOne) when the same CV is uploaded again. **Bump it whenever what `analizar()` or `brecha.calcular()` produce changes**, or users keep seeing stale diagnoses.

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
- **Only `apps/curriculums/revision.py` may import `integrations.ia`, and what it sends is enforced.** The reason is `Curriculum.texto` — the full CV of a real person. Two barriers, in this order: **minimisation** (only the blocks of recognised sections from `segmentar()`, which drop the header by construction — never the full text, the header/footer text or text boxes) and **masking** (`integrations/documentos/anonimizar.py` replaces emails, links, phones and the detected name, reusing the `ats.py` detectors). With no recognised sections or no text layer, the provider is **not called** (`revision_ia.estado = "omitida"`): there is no safe way to separate personal data from the rest. `tests/test_frontera_con_ia.py` checks it three ways — statically with `ast` (only `revision.py` imports the AI layer), with a spy provider (name, email, phone and city of the fixture never reach it; it is not called on creative titles or a scanned PDF), and with a `sys.meta_path` guard (with an injected reviewer, nothing else in the call chain loads the AI layer). Each was verified by injecting the violation. **If it goes red, fix the leak, never relax the test.**

  The AI call runs **after** the transaction, like the evaluation in `responder()`. Any `ErrorProveedorIA` becomes `revision_ia.estado = "no_disponible"` with a 201 — the diagnosis never depends on the provider — and re-uploading the same CV retries **only** the AI part (`revision.necesita_revision()`). The parser in `integrations/ia/prompts/revisor_cv.py` drops anything not anchored to the input (a bullet not sent, a requirement not in the gap, a correction whose original is not literally in the CV, a question whose motive is not in the texts, a puesto outside the enum, anything echoing a mask marker). `RevisorDeCV` is a `Protocol` in `base.py`, implemented by `ProveedorIAporJSON` (so Gemini and Claude get it for free) and `FakeProveedorIA`; it is deliberately not an abstract method of `ProveedorIA`, so the interview test doubles don't have to implement it.

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

### Retroalimentación acumulada counts more than the stats do

`apps/evaluaciones/services.py::calcular_retroalimentacion()` (served at `/api/estadisticas/retroalimentacion/`) deliberately does **not** filter by `estado=FINALIZADA`, unlike `calcular_estadisticas`. An average only compares across complete interviews, but a weakness found in question 3 of an abandoned one is still a real weakness. Unanswered questions drop out by construction — it queries `Evaluacion`, and an ungraded intercambio has no row.

Band counts are grouped in SQL with a range filter built from `rubricas.BANDAS`, so the thresholds stay in one place. The textual observations are returned raw, capped at `MAXIMO_OBSERVACIONES`; nothing is summarized, which would mean a fresh AI call per view.

### Statistics are computed in the database, not in Python

`apps/evaluaciones/services.py::calcular_estadisticas()` uses Django's `Avg`/`Count` directly on `Evaluacion` rows (weighted per answer), not by averaging each interview's already-averaged score — deliberate, since the latter would misweight interviews with different numbers of scored answers.

An interview's own grade is the simple mean of its answers' grades (`promedio_de_evaluaciones`). An `ABANDONADA` interview never stores `puntuacion_promedio`; the results screen computes the same mean from its published evaluations and labels it **parcial**, "sobre k de 5", using `preguntas_calificadas` / `preguntas_previstas` from `EntrevistaSerializer` (annotated in `selectors._con_conteo` so the history list stays one query).

### Authenticated shell: dark sidebar, header names the section

`router/RutaProtegida.tsx` renders a fixed `Header` (`h-16`, always light) across the full width at the top, and below it — anchored at `top-16`, never beside it — `components/layout/Sidebar.tsx`, either as a fixed rail on desktop (collapsible to an icon-only strip) or a `role="dialog"` drawer on mobile. Both share the same `bg-slate-900` and the same `Sidebar` component; `components/layout/destinos.ts` is the single list of nav items both render, so adding a section is one edit, not two.

The dark theme is not a second brand color: `slate-900`/`slate-800` are the same neutral scale already used for text and borders elsewhere in the app, just at its dark end. The only accent remains `indigo-600` — reused as the active item's solid pill fill instead of introducing a new hue. That solid fill (plus `aria-current="page"`) is what distinguishes the active destination now; the earlier `bg-indigo-50` + side-accent-bar combo is gone because a filled pill is already enough contrast against `slate-900`.

`Header.tsx` no longer repeats the app's name — the sidebar has its own brand block (reusing the same `IconoNav` `marca` path as `features/landing/components/Icono.tsx::marca`, so the mark looks identical in the landing and the app). Instead the header shows the current section's name, resolved by `components/layout/titulosDeRuta.ts::resolverTitulo()` from a static route → title map, not from each page declaring its own — a route that forgets to register can't leave the header blank, it falls back to a default. That label is a `<p>`, not an `<h1>`: every page under `RutaProtegida` already owns its own `<h1>`, and a second one in the header would break the one-`h1`-per-page hierarchy.

### Naming convention

Domain code (models, fields, function names — `Usuario`, `Entrevista`, `Intercambio`, `Evaluacion`, `puntuacion`, `respuesta`) is Spanish throughout, matching the thesis document. Project scaffolding and technical folder names (`apps/`, `integrations/`, `views.py`, `tests/`) follow standard Django/English convention. This split is intentional, not inconsistent.
