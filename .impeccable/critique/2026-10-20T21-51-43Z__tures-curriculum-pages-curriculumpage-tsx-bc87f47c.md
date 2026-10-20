---
target: pantalla Revisar mi CV
total_score: 25
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 3
target_identity: "file:C:\\Users\\ASUS.VIVOBOOK\\Desktop\\LIBROS SIS\\Proyecto Final\\Sistema-Entrevista-Tecnica-Desarrollo-Sofware\\frontend\\src\\features\\curriculum\\pages\\CurriculumPage.tsx"
target_fingerprint: "sha256:9a73fc3c715741e9e6d9f5e9c43cc59964e35c6961af13e4ffad52fa3258bb45"
target_path: "C:\\Users\\ASUS.VIVOBOOK\\Desktop\\LIBROS SIS\\Proyecto Final\\Sistema-Entrevista-Tecnica-Desarrollo-Sofware\\frontend\\src\\features\\curriculum\\pages\\CurriculumPage.tsx"
timestamp: 2026-10-20T21-51-43Z
slug: tures-curriculum-pages-curriculumpage-tsx-bc87f47c
---
# Crítica: Revisar mi CV (/mi-cv) — Method: dual-agent

Total 25/40 (Aceptable). Heurísticas: 1=2, 2=3, 3=2, 4=3, 5=3, 6=3, 7=2, 8=3, 9=2, 10=2.
Detector: 0 hallazgos (features/curriculum + Pestanas/Boton/Tarjeta). Sin navegador: sin overlay.

## Priority issues
- [P1] PDF escaneado: inventario vacío y brecha nula producen mensajes de causa equivocada ("no se reconoció ningún requisito en la convocatoria", "quizá en barras"); Alerta re-anunciada por pestaña. Fix: modo legibilidad con un solo panel (espejo + "expórtalo desde Word" + analizar de nuevo). harden → clarify.
- [P1] Momento firma escondido: Resumen abre con fallos; espejo en pestaña 2; fortalezas dentro de "Qué corregir". Fix: Resumen = espejo compacto + top 3 + "Qué ya funciona"; 4 pestañas. layout → distill.
- [P1] Sin tranquilidad de privacidad al subir el CV ni límite 2 MB visible. clarify/onboard.
- [P2] Espera con solo spinner; analizarCurriculum usa timeout por defecto 45 s con IA en la misma petición → falso "No se pudo analizar". Fix: estado escalonado aria-live, timeoutMs mayor, carga al abrir historial. harden.
- [P2] text-headline-lg no existe en tokens.css (ResultadoDelAnalisis.tsx:84, VinetasDeLogro.tsx:29); h2 Qué corregir/conservar a 11px mono. typeset + ampliar guarda.

## Persona red flags
Jordan: jerga sin explicar, convocatoria fácil de pasar por alto, "Analizar otro" ambiguo, 5 pestañas sin orden. Sam: sin aria-live en análisis, errores sin aria-describedby, instrucciones solo en placeholder, Alerta repetida. Casey: pestañas desbordan sin señal, columnas fijas w-28/w-32, error lejos del pulgar. Egresada Canva: lista larga sin "empieza aquí", sin garantía de privacidad.

## Minor
Plural sobrante en HistorialDeAnalisis:47; zona de arrastre no se reduce con archivo; icono de declarado se lee como fallo; contador cuenta solo debilidades; historial desplaza layout; filas sin relleno.

## Questions
Espejo primero; un cambio a la vez; "Crítico" como veredicto sin contexto.
