from django.contrib import admin

from .models import AnalisisATS, Curriculum


@admin.register(Curriculum)
class CurriculumAdmin(admin.ModelAdmin):
    list_display = ("usuario", "nombre_archivo", "formato", "paginas", "fecha")
    list_filter = ("formato", "fecha")
    search_fields = ("usuario__email", "nombre_archivo")
    # El texto del CV y la convocatoria llevan datos de personas y empresas
    # reales: se muestran pero no se editan, y no se exponen en el listado.
    readonly_fields = ("texto", "hash_texto", "convocatoria", "hash_convocatoria", "fecha")


@admin.register(AnalisisATS)
class AnalisisATSAdmin(admin.ModelAdmin):
    list_display = ("curriculum", "parseabilidad", "version_reglas", "fecha")
    readonly_fields = ("campos", "hallazgos", "brecha", "inventario", "vinetas", "version_reglas", "fecha")
