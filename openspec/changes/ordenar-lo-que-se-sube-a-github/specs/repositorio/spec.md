## ADDED Requirements

### Requirement: La configuración local de asistentes de IA no se versiona
El repositorio NO SHALL rastrear `CLAUDE.md`, `.claude/`, `.agents/`, `skills-lock.json` ni `.impeccable/`, y el `.gitignore` SHALL ignorarlos. Quitarlos del repositorio NO SHALL borrarlos del equipo del desarrollador.

#### Scenario: Nada ignorado queda rastreado
- **WHEN** se ejecuta `git ls-files -ci --exclude-standard`
- **THEN** la salida está vacía

#### Scenario: Siguen en el equipo
- **WHEN** se dejan de rastrear
- **THEN** `CLAUDE.md`, `.claude/` y `.agents/` siguen existiendo en el disco

### Requirement: De docs/ solo se versionan el perfil y la arquitectura
De `docs/`, el repositorio SHALL versionar solo `docs/Copia de Copia de PerfilJorgeV3.docx.md` y `docs/arquitectura.md`. Cualquier otro archivo o carpeta de `docs/`, actual o futuro, SHALL quedar ignorado.

#### Scenario: Un borrador nuevo
- **WHEN** se crea `docs/otro-borrador.md`
- **THEN** `git status` no lo muestra como archivo sin rastrear

#### Scenario: Lo que se mantiene
- **WHEN** se ejecuta `git ls-files docs`
- **THEN** la salida son exactamente esos dos archivos

### Requirement: Los archivos basura del sistema se ignoran
El `.gitignore` SHALL ignorar los volcados de fallos (`*.stackdump`) y los archivos de bloqueo de Office (`~$*`).

#### Scenario: Word abierto
- **WHEN** Word crea `docs/~$algo.docx` o la terminal deja `sh.exe.stackdump`
- **THEN** `git status` no los muestra

### Requirement: Lo del proyecto se sigue versionando
El repositorio SHALL seguir versionando:
- `openspec/`;
- `README.md`, `DESIGN.md` y `PRODUCT.md`;
- los fixtures de `backend/tests/fixtures/`;
- los `.env.example` de `backend/` y `frontend/`.

#### Scenario: OpenSpec y ejemplos de entorno
- **WHEN** se ejecuta `git ls-files openspec backend/.env.example frontend/.env.example`
- **THEN** aparecen los cambios de OpenSpec y los dos `.env.example`
