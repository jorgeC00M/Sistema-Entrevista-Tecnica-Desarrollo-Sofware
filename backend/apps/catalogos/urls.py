from django.urls import path

from .views import CatalogosPublicosView, CatalogosView

urlpatterns = [
    path("", CatalogosView.as_view(), name="catalogos"),
    path("publico/", CatalogosPublicosView.as_view(), name="catalogos-publicos"),
]
