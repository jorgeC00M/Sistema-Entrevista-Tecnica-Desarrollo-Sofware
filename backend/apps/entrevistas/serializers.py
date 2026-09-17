from rest_framework import serializers

from apps.catalogos.models import Area, Nivel
from apps.evaluaciones.serializers import EvaluacionSerializer

from .models import Entrevista, Intercambio


class IniciarEntrevistaSerializer(serializers.Serializer):
    """Recibe los códigos del catálogo y los resuelve a instancias.

    `SlugRelatedField` valida contra la base de datos, así que pedir un área
    dada de baja devuelve 400 sin que la vista tenga que comprobarlo.
    """

    area = serializers.SlugRelatedField(
        slug_field="codigo", queryset=Area.objects.filter(activo=True)
    )
    nivel = serializers.SlugRelatedField(
        slug_field="codigo", queryset=Nivel.objects.filter(activo=True)
    )


class ResponderSerializer(serializers.Serializer):
    respuesta = serializers.CharField(allow_blank=False, trim_whitespace=True)


class EntrevistaSerializer(serializers.ModelSerializer):
    # Se expone el `codigo` del catálogo, no el id: es la clave estable que
    # entiende tanto el frontend como la capa de IA.
    area = serializers.SlugRelatedField(slug_field="codigo", read_only=True)
    nivel = serializers.SlugRelatedField(slug_field="codigo", read_only=True)
    area_display = serializers.CharField(source="area.nombre", read_only=True)
    nivel_display = serializers.CharField(source="nivel.nombre", read_only=True)
    estado_display = serializers.CharField(source="get_estado_display", read_only=True)

    class Meta:
        model = Entrevista
        fields = [
            "id",
            "area",
            "area_display",
            "nivel",
            "nivel_display",
            "estado",
            "estado_display",
            "fecha_inicio",
            "fecha_fin",
            "puntuacion_promedio",
        ]
        read_only_fields = fields


class IntercambioSerializer(serializers.ModelSerializer):
    evaluacion = EvaluacionSerializer(read_only=True)

    class Meta:
        model = Intercambio
        fields = ["numero", "pregunta", "respuesta", "tiempo_respuesta", "evaluacion"]
        read_only_fields = fields
