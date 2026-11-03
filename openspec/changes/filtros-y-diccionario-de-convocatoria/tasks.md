## 0. Requisito previo

- [x] 0.1 Confirmar que `diferenciar-revision-y-comparacion-de-cv` está aplicado: tienen que existir `aspectos.ts` y `FrenteAlAviso`.

## 1. Secciones y diccionario

- [x] 1.1 Agregar la sección `idiomas` en `secciones.py` («idiomas», «languages»), con un test de `titulo_de`.
- [x] 1.2 Agregar a `terminos.TERMINOS` las herramientas de D6, con un test de verdadero positivo y otro de falso positivo por término.

## 2. Filtros (`integrations/documentos/filtros.py`)

- [x] 2.1 Los tipos `Pedido` y `Filtro`, los estados `cumple`, `no_aparece` y `no_verificable`, y el registro de filtros (D1).
- [x] 2.2 **Título** (D2), con tests:
  - titulado contra titulado;
  - egresado contra titulado;
  - sin educación;
  - una materia que no es un título;
  - un título solo en deseables.
- [x] 2.3 **Idioma** (D3), con tests:
  - B2 contra intermedio;
  - sin nivel;
  - ausente;
  - un CV escrito en inglés sin la palabra «inglés».
- [x] 2.4 **Ubicación y modalidad** (D4), con tests:
  - la misma ciudad;
  - otra ciudad;
  - sin ubicación;
  - un aviso remoto, que no informa nada.

## 3. Integración en la brecha

- [x] 3.1 `Brecha.filtros` y su cálculo en `brecha.calcular()`, solo sobre el bloque obligatorio (D5).
- [x] 3.2 Subir `VERSION_DE_REGLAS` a 5 en `ats.py` (D7).
- [x] 3.3 Tests de `brecha`:
  - los filtros no cambian la cobertura;
  - un aviso sin filtros deja `filtros` vacío.
- [x] 3.4 Test en `apps/curriculums`: un análisis con la versión 4 se recalcula al volver a subir el CV.
- [x] 3.5 `python manage.py test` completo en verde, incluidos `tests.integration` y la frontera con la IA.

## 4. Frontend

- [x] 4.1 Tipo `Filtro` en `types/curriculum.ts`. `filtros` es opcional, para tolerar análisis antiguos.
- [x] 4.2 Aspectos y notas de los filtros en `features/curriculum/aspectos.ts`:
  - `cumple` → acierto;
  - `no_verificable` → intermedio;
  - `no_aparece` → fallo, con el texto «No aparece en tu CV».
- [x] 4.3 Filas de filtros en `FrenteAlAviso` y en `BrechaDeRequisitos`, debajo de la experiencia.
- [x] 4.4 Los chequeos del frontend:
  - `pnpm exec tsc --noEmit`;
  - `pnpm test`;
  - `pnpm run lint`, que debe quedar en 5 advertencias;
  - `pnpm run build`.

## 5. Verificación y documentación

- [ ] 5.1 **Pruebas manuales con tres avisos reales anonimizados:**
  - uno que pide titulado, inglés y presencial;
  - uno remoto;
  - uno sin títulos de sección.
- [x] 5.2 **`CLAUDE.md`:**
  - los filtros y sus estados, con la regla «nunca no cumples»;
  - `VERSION_DE_REGLAS` = 5 y por qué.
- [ ] 5.3 No hacer commit. El usuario lo hará tras revisar.
