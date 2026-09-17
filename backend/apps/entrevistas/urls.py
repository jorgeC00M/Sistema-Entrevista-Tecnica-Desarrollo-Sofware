from django.urls import path

from .views import EntrevistaDetailView, EntrevistaListCreateView, ResponderView, ResultadosView

urlpatterns = [
    path("", EntrevistaListCreateView.as_view(), name="entrevistas-list-create"),
    path("<int:pk>/", EntrevistaDetailView.as_view(), name="entrevistas-detail"),
    path("<int:pk>/responder/", ResponderView.as_view(), name="entrevistas-responder"),
    path("<int:pk>/resultados/", ResultadosView.as_view(), name="entrevistas-resultados"),
]
