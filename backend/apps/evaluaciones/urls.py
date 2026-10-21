from django.urls import path

from .views import RetroalimentacionView

urlpatterns = [
    path("retroalimentacion/", RetroalimentacionView.as_view(), name="retroalimentacion"),
]
