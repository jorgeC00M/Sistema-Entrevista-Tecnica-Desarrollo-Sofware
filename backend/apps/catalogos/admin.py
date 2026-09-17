from django.contrib import admin

from .models import Area, Nivel


@admin.register(Area)
class AreaAdmin(admin.ModelAdmin):
    list_display = ["nombre", "codigo", "orden", "activo"]
    list_editable = ["orden", "activo"]
    search_fields = ["nombre", "codigo"]


@admin.register(Nivel)
class NivelAdmin(admin.ModelAdmin):
    list_display = ["nombre", "codigo", "orden", "activo"]
    list_editable = ["orden", "activo"]
    search_fields = ["nombre", "codigo"]
