from django.contrib import admin

from apps.evaluaciones.models import Evaluacion

from .models import Entrevista, Intercambio


class EvaluacionInline(admin.StackedInline):
    model = Evaluacion
    extra = 0
    readonly_fields = ["creado_en"]


class IntercambioInline(admin.TabularInline):
    model = Intercambio
    extra = 0
    fields = ["numero", "pregunta", "respuesta", "tiempo_respuesta"]
    readonly_fields = ["tiempo_respuesta"]
    show_change_link = True


@admin.register(Entrevista)
class EntrevistaAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "usuario",
        "area",
        "nivel",
        "estado",
        "fecha_inicio",
        "puntuacion_promedio",
    ]
    list_filter = ["area", "nivel", "estado"]
    search_fields = ["usuario__email"]
    list_select_related = ["usuario", "area", "nivel"]
    inlines = [IntercambioInline]


@admin.register(Intercambio)
class IntercambioAdmin(admin.ModelAdmin):
    list_display = ["entrevista", "numero", "creado_en", "respondido_en", "tiempo_respuesta"]
    list_filter = ["entrevista__area"]
    inlines = [EvaluacionInline]
