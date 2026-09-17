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
    class Meta:
        model = Usuario
        fields = ["id", "email", "nombre_completo", "carnet", "date_joined", "last_login"]
        read_only_fields = fields


class GoogleLoginSerializer(serializers.Serializer):
    id_token = serializers.CharField()
