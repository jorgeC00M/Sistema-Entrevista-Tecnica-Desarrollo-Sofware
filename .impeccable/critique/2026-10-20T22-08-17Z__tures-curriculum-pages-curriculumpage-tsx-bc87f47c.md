---
target: pantalla Revisar mi CV
total_score: 24
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 4
target_identity: "file:C:\\Users\\ASUS.VIVOBOOK\\Desktop\\LIBROS SIS\\Proyecto Final\\Sistema-Entrevista-Tecnica-Desarrollo-Sofware\\frontend\\src\\features\\curriculum\\pages\\CurriculumPage.tsx"
target_fingerprint: "sha256:9a73fc3c715741e9e6d9f5e9c43cc59964e35c6961af13e4ffad52fa3258bb45"
target_path: "C:\\Users\\ASUS.VIVOBOOK\\Desktop\\LIBROS SIS\\Proyecto Final\\Sistema-Entrevista-Tecnica-Desarrollo-Sofware\\frontend\\src\\features\\curriculum\\pages\\CurriculumPage.tsx"
timestamp: 2026-10-20T22-08-17Z
slug: tures-curriculum-pages-curriculumpage-tsx-bc87f47c
---
# Crítica 2: Revisar mi CV (/mi-cv), tras cv-critica-p1 — Method: dual-agent

Total 24/40 (Aceptable). Heurísticas: 1=2, 2=3, 3=2, 4=2, 5=3, 6=3, 7=2, 8=3, 9=2, 10=2.
Los P1 de la crítica 1 quedaron resueltos (panel ilegible, espejo primero, privacidad, severidades por efecto); esta pasada fue más profunda (tiempos, móvil). Detector: 0 hallazgos. Sin navegador.

## Priority issues
- [P1] Espera sin narrar; IA síncrona en el POST y timeout cliente 45 s → falso "No se pudo analizar" con el análisis guardado. Fix: aria-live por etapas, timeoutMs mayor, refrescar historial al agotar tiempo, carga en filas. harden + clarify.
- [P1] "Tu PDF es una imagen" fijo también para DOCX sin capa de texto (cuadros/imágenes); detalle del backend tampoco aplica. Fix: título según formato, detalle DOCX en backend, plegar espejo rojo repetido. clarify.
- [P1] Conteos distintos: pestaña "Qué mejorar (n)" suma hallazgos+viñetas+redacción, botón del Resumen solo hallazgos; text-headline-lg inexistente. Fix: un conteo o rótulos distintos; token; ampliar guarda. typeset + polish.
- [P1] Móvil: 4 pestañas con gap-6 desbordan ~343 px y esconden "Para la entrevista" (único CTA a practicar); espejo completo w-28 y requisitos w-32 aprietan sugerencias. Fix: rótulos cortos o pista, repetir CTA en Resumen, apilar en móvil. adapt.
- [P2] Alerta general arriba (error del historial fuera de vista); "No se reconoció requisito" en rojo con role=alert; motivo IA "el diagnóstico de arriba" incorrecto. harden + clarify.

## Persona red flags
Jordan: ATS/parseo sin definir, botón deshabilitado sin motivo, "Analizar otro" engañoso, sin leyenda de declarado. Sam: sin anuncios al elegir/analizar, "5/8" sin contexto en historial, instrucciones solo en placeholder. Casey: CTA oculto por pestañas, "Quitar la convocatoria" destructivo bajo el pulgar, "Arrastra" irrelevante. Egresada: muchas filas rojas sin "es común y se arregla"; "Por lo que dice tu CV" aunque el motivo venga de la convocatoria.

## Minor
Rótulo sobre el h1 (contra DESIGN.md); borde ámbar decorativo; voz inconsistente; tachado rojo; inventario vacío en rojo sin icono; "Analizar otro" tras abrir del historial muestra otro archivo; plural sobrante.
