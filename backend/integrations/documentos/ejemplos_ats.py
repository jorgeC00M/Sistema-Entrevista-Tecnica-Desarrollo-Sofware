"""Los ejemplos de «DESPUÉS» de cada corrección del análisis ATS.

Texto fijo con datos inventados, nunca copiado del CV ni de la IA, así que no
lleva la etiqueta de IA. `ats.py` los reexporta.
"""

# Los ejemplos de las correcciones. Comparten datos para que se lean como un
# mismo CV, y un test los pasa por los detectores: un ejemplo que el módulo
# marcara como error sería peor que no darlo.
EJEMPLO_DE_CONTACTO = "Ana Quispe\nana.quispe@gmail.com · +591 70000000 · Cochabamba, Bolivia"
EJEMPLO_DE_SECCIONES = "Experiencia laboral\nEducación\nHabilidades técnicas"
EJEMPLO_DE_PERIODO = "Desarrolladora Backend, Jalasoft\nEne 2022 – Actualidad"
EJEMPLO_DE_FECHAS = "Ene 2020 – Mar 2022\nAbr 2022 – Actualidad"
EJEMPLO_DE_HABILIDADES = "Habilidades\nPython (avanzado), Django (intermedio), PostgreSQL"
EJEMPLO_DE_UNA_COLUMNA = (
    f"{EJEMPLO_DE_CONTACTO}\n\n"
    f"Experiencia\n{EJEMPLO_DE_PERIODO}\n\n"
    "Educación\nIngeniería de Sistemas, UMSS\n\n"
    "Habilidades\nPython, Django, PostgreSQL"
)
EJEMPLO_SIN_TABLAS = "Desarrolladora Backend, Jalasoft · Ene 2022 – Actualidad\nPython, Django, PostgreSQL"
EJEMPLO_DE_SIGLA = "Amazon Web Services (AWS)"
