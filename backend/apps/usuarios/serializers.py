from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers

from .models import Usuario


class RegistroSerializer(serializers.ModelSerializer):
    """Alta de un egresado por email y contraseña.

    La unicidad del email la valida DRF automáticamente (ModelSerializer
    detecta el `unique=True` del modelo); la fortaleza de la contraseña usa
    los mismos validadores configurados en AUTH_PASSWORD_VALIDATORS.
    """

    password = serializers.CharField(write_only=True, style={"input_type": "password"})

    class Meta:
        model = Usuario
        fields = ["email", "password", "nombre_completo", "carnet"]
        extra_kwargs = {"carnet": {"required": False}}

    def validate_password(self, value):
        try:
            validate_password(value)
        except DjangoValidationError as exc:
            raise serializers.ValidationError(list(exc.messages)) from exc
        return value

    def create(self, validated_data):
        return Usuario.objects.create_user(**validated_data)


class PerfilSerializer(serializers.ModelSerializer):
    # Las cuentas creadas con Google no tienen contraseña utilizable: el
    # perfil lo dice para no ofrecerles cambiar algo que no existe.
    tiene_contrasena = serializers.SerializerMethodField()

    class Meta:
        model = Usuario
        fields = [
            "id",
            "email",
            "nombre_completo",
            "carnet",
            "date_joined",
            "last_login",
            "tiene_contrasena",
        ]
        read_only_fields = fields

    def get_tiene_contrasena(self, usuario: Usuario) -> bool:
        return usuario.has_usable_password()


class CambiarContrasenaSerializer(serializers.Serializer):
    """Cambio de contraseña con la actual como prueba.

    El usuario llega por `context["usuario"]`. Los errores van por campo
    (`actual`, `nueva`) con el mismo formato que el registro, para que el
    frontend los pinte junto a cada campo.
    """

    actual = serializers.CharField(write_only=True, trim_whitespace=False)
    nueva = serializers.CharField(write_only=True, trim_whitespace=False)

    def validate(self, datos):
        usuario: Usuario = self.context["usuario"]
        if not usuario.has_usable_password():
            # Cuenta de Google: no hay contraseña que cambiar, y crear una sin
            # otra prueba dejaría que una sesión robada se quedara la cuenta.
            raise serializers.ValidationError("Tu cuenta entra con Google y no tiene contraseña.")
        if not usuario.check_password(datos["actual"]):
            raise serializers.ValidationError({"actual": ["La contraseña actual no es correcta."]})
        if datos["nueva"] == datos["actual"]:
            raise serializers.ValidationError(
                {"nueva": ["La nueva contraseña debe ser distinta de la actual."]}
            )
        try:
            validate_password(datos["nueva"], usuario)
        except DjangoValidationError as exc:
            raise serializers.ValidationError({"nueva": list(exc.messages)}) from exc
        return datos


class GoogleLoginSerializer(serializers.Serializer):
    # Un ID token de Google ronda 1-2 KB; el tope evita que el endpoint acepte
    # cuerpos arbitrariamente grandes antes de intentar verificarlos.
    id_token = serializers.CharField(max_length=4096)
