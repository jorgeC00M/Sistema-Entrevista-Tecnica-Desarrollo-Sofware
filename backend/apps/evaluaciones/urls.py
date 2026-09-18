from django.urls import path

from .views import EstadisticasView, RetroalimentacionView

urlpatterns = [
    path("", EstadisticasView.as_view(), name="estadisticas"),
    path("retroalimentacion/", RetroalimentacionView.as_view(), name="retroalimentacion"),
]
