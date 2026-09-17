from django.contrib import admin
from django.urls import include, path

from entrevistas.views import EstadisticasView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("usuarios.urls")),
    path("api/entrevistas/", include("entrevistas.urls")),
    path("api/estadisticas/", EstadisticasView.as_view(), name="estadisticas"),
]
