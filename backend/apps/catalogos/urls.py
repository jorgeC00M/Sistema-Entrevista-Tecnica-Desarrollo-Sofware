from django.urls import path

from .views import CatalogosView

urlpatterns = [
    path("", CatalogosView.as_view(), name="catalogos"),
]
