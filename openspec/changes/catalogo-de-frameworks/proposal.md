## Why

El catálogo ofrece lenguajes ("Python", "Java", "PHP") donde las ofertas de trabajo piden frameworks ("Django", "Spring Boot", "Laravel"). Además, faltan tecnologías de uso corriente: Next.js, NestJS, FastAPI, Go, Tauri, Appium, k6, entre otras. Una pregunta sobre "Python" es más vaga que una sobre "Django", y el candidato no encuentra lo que de verdad va a usar en el puesto.

## What Changes

- **Catálogo ampliado a 53 tecnologías activas:**

  | Puesto | Cantidad | Tecnologías |
  |---|---|---|
  | Frontend | 7 | React, Next.js, Angular, Vue, Nuxt, Svelte, Astro |
  | Backend | 10 | Django, FastAPI, Flask (Python); Express, NestJS (Node.js); Spring Boot (Java); Laravel (PHP); ASP.NET Core (C#); Go; Ruby on Rails (Ruby) |
  | Full Stack, frontend | 6 | React, Next.js, Angular, Vue, Nuxt, Svelte |
  | Full Stack, backend | 7 | Express, NestJS, Django, FastAPI, Spring Boot, Laravel, ASP.NET Core |
  | Móvil | 6 | Flutter, React Native, Kotlin (Jetpack Compose), Swift (SwiftUI), .NET MAUI, Ionic |
  | Escritorio | 7 | C# (WPF / WinForms), .NET MAUI, Java (JavaFX), Electron, Tauri, Python (PyQt), C++ (Qt) |
  | QA | 10 | Selenium, Cypress, Playwright (Interfaz web); Appium (Móvil); Postman, REST Assured (APIs); JMeter, k6 (Rendimiento); Pytest, JUnit (Unitarias) |

- **Nuevo `Tecnologia.grupo`:** un texto que agrupa las opciones en pantalla, por lenguaje en Backend y Full Stack y por tipo de prueba en QA. Es solo presentación: la selección sigue siendo de un clic.
- Las tecnologías que se dividen en frameworks se **desactivan**, no se borran, porque hay entrevistas que pueden referenciarlas:
  - Backend: Python, Node.js, Java, PHP y C# .NET;
  - Full Stack, backend: Node.js, Python, Java y PHP.
- Las que solo ganan un nombre más preciso se **renombran en la misma fila**: Kotlin, Swift, y C#, Java y Python de Escritorio.
- `GET /api/catalogos/puestos/` expone `grupo` en cada tecnología.

## Capabilities

### New Capabilities
- `catalogo-de-frameworks`: qué tecnologías ofrece cada puesto, cómo se agrupan en pantalla y qué pasa con las que se retiran.

### Modified Capabilities
Ninguna en `openspec/specs/` (está vacío). Amplía el catálogo de `seleccion-por-pasos`, que sigue sin archivar.

## Impact

- **Backend:**
  - `apps/catalogos`: `datos.py`, `models.py`, migraciones 0012–0013, serializer y tests;
  - tests de `apps/entrevistas` que usaban `backend_python` y `full_stack_node`.
- **Capa de IA:** sin cambios. Recibe el nombre ("Django"), igual que antes recibía "Python".
- **Frontend:** `types/catalogos.ts`, `seleccion.ts` (agrupación pura con test) y `EleccionDeTecnologia.tsx`.
- **Datos:** respaldo previo. Ninguna entrevista local usa las tecnologías retiradas; solo cambia el nombre visible de "C# .NET" de Escritorio, que pasa a "C# (WPF / WinForms)".
