from django.urls import path

from .views import CatalogosPublicosView, CatalogosView, PuestosView

urlpatterns = [
    path("", CatalogosView.as_view(), name="catalogos"),
    path("publico/", CatalogosPublicosView.as_view(), name="catalogos-publicos"),
    path("puestos/", PuestosView.as_view(), name="catalogos-puestos"),
]
