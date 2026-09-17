from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import GoogleLoginView, PerfilView, RegistroView

urlpatterns = [
    path("registro", RegistroView.as_view(), name="auth-registro"),
    path("token", TokenObtainPairView.as_view(), name="auth-token"),
    path("token/refresh", TokenRefreshView.as_view(), name="auth-token-refresh"),
    path("google", GoogleLoginView.as_view(), name="auth-google"),
    path("perfil", PerfilView.as_view(), name="auth-perfil"),
]
