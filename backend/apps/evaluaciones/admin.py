from django.contrib import admin

from .models import Evaluacion


@admin.register(Evaluacion)
class EvaluacionAdmin(admin.ModelAdmin):
    list_display = ["intercambio", "puntuacion", "proveedor_ia", "modelo_ia", "creado_en"]
    list_filter = ["proveedor_ia", "modelo_ia"]
    readonly_fields = ["creado_en"]
