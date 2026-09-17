from django.apps import AppConfig


class UsuariosConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.usuarios"
    # El label se fija a mano para que siga siendo "usuarios" tras mover la app
    # dentro de apps/: es lo que mantiene válidos AUTH_USER_MODEL y las
    # referencias entre migraciones.
    label = "usuarios"
