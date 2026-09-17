from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("apps.usuarios.urls")),
    path("api/catalogos/", include("apps.catalogos.urls")),
    path("api/entrevistas/", include("apps.entrevistas.urls")),
    path("api/estadisticas/", include("apps.evaluaciones.urls")),
]
