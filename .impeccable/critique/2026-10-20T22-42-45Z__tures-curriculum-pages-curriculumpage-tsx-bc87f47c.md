---
target: pantalla Revisar mi CV
total_score: 28
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 1
target_identity: "file:C:\\Users\\ASUS.VIVOBOOK\\Desktop\\LIBROS SIS\\Proyecto Final\\Sistema-Entrevista-Tecnica-Desarrollo-Sofware\\frontend\\src\\features\\curriculum\\pages\\CurriculumPage.tsx"
target_fingerprint: "sha256:a8cc2cc9f34eed1b7b4f838dac35b01f9394e44040ee050a3b58b33d95c4212e"
target_path: "C:\\Users\\ASUS.VIVOBOOK\\Desktop\\LIBROS SIS\\Proyecto Final\\Sistema-Entrevista-Tecnica-Desarrollo-Sofware\\frontend\\src\\features\\curriculum\\pages\\CurriculumPage.tsx"
timestamp: 2026-10-20T22-42-45Z
slug: tures-curriculum-pages-curriculumpage-tsx-bc87f47c
---
# Crítica 3: Revisar mi CV (/mi-cv), tras cv-critica-2 — Method: dual-agent

Total 28/40 (Bueno). Heurísticas: 1=3, 2=3, 3=3, 4=2, 5=3, 6=3, 7=2, 8=3, 9=3, 10=3.
Resueltos de la crítica 2: fallo falso por tiempo, título PDF para DOCX, conteos contradictorios. Detector: 0 hallazgos. Sin navegador.

## Priority issues
- [P1] "Ver todo en Mejorar" abre con el espejo completo repetido; la lista de correcciones queda debajo. Fix: Mejorar empieza por ListaDeHallazgos; espejo solo en Resumen. distill → layout.
- [P2] porMejorar() suma correcciones de redacción de la IA a lo medido y crece al llegar la IA: rompe "lo medido y lo sugerido no comparten línea" y se parece a un puntaje. Fix: contar solo lo medido o quitar el número de la pestaña y desglosar dentro. clarify.
- [P2] Subida sin estado aria-live; error general arriba fuera de vista; timeout/red genérico; abrir historial sin carga; recarga pierde el resultado (sin /mi-cv/:id); "Analizar de nuevo" en CV ilegible vuelve con el mismo archivo. harden.
- [P2] Jerarquía y color: "Tu currículum" h2 sans 16px vs "Tus análisis anteriores" Fraunces 20px; título de lista 11px ámbar + borde ámbar decorativo; icono ámbar en todas las severidades; rótulo sobre el h1. typeset → quieter.
- [P2] Pestañas ~350px vs ~343 disponibles a 375; sin pista de desplazamiento ni sticky. adapt.

## Persona red flags
Jordan: jerga, botón deshabilitado sin motivo, "5/8" sin valoración, "Mejorar · 14" como nota. Sam: foco anuncia solo el archivo; dl con dt/dd dentro de div extra; Alerta role=alert para no-error; zona sin aria-describedby. Casey: pestañas recortadas, error fuera de vista, "Arrastra", "Analizar otro" pequeño arriba. Egresada: convocatorias como imagen sin vía; ejemplo de viñeta laboral; supone Word/Docs.

## Minor
Viñetas con resultado bajo título del espejo ATS; plural sobrante; instrucción solo en placeholder; IA ok vacía sin mensaje; destino de practicar cambia en silencio; PreguntasProbables con otra superficie; zona de arrastre no cambia con archivo.
