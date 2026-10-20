from django.urls import path

from .views import (
    AnalizarConvocatoriaView,
    AbandonarView,
    EntrevistaDetailView,
    EntrevistaListCreateView,
    ResponderView,
    ResultadosView,
    UltimaConfiguracionView,
)

urlpatterns = [
    path("", EntrevistaListCreateView.as_view(), name="entrevistas-list-create"),
    path("convocatoria/", AnalizarConvocatoriaView.as_view(), name="entrevistas-convocatoria"),
    path(
        "ultima-configuracion/",
        UltimaConfiguracionView.as_view(),
        name="entrevistas-ultima-configuracion",
    ),
    path("<int:pk>/", EntrevistaDetailView.as_view(), name="entrevistas-detail"),
    path("<int:pk>/responder/", ResponderView.as_view(), name="entrevistas-responder"),
    path("<int:pk>/resultados/", ResultadosView.as_view(), name="entrevistas-resultados"),
    path("<int:pk>/abandonar/", AbandonarView.as_view(), name="entrevistas-abandonar"),
]
