from rest_framework import serializers

from .models import Entrevista, Evaluacion, Intercambio
from .services.ia.schemas import AreaTecnica, Nivel


class IniciarEntrevistaSerializer(serializers.Serializer):
    area = serializers.ChoiceField(choices=[(a.value, a.etiqueta) for a in AreaTecnica])
    nivel = serializers.ChoiceField(choices=[(n.value, n.etiqueta) for n in Nivel])


class ResponderSerializer(serializers.Serializer):
    respuesta = serializers.CharField(allow_blank=False, trim_whitespace=True)


class EntrevistaSerializer(serializers.ModelSerializer):
    area_display = serializers.CharField(source="get_area_display", read_only=True)
    nivel_display = serializers.CharField(source="get_nivel_display", read_only=True)
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


class EvaluacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Evaluacion
        fields = ["puntuacion", "fortalezas", "debilidades", "sugerencias"]
        read_only_fields = fields


class IntercambioSerializer(serializers.ModelSerializer):
    evaluacion = EvaluacionSerializer(read_only=True)

    class Meta:
        model = Intercambio
        fields = ["numero", "pregunta", "respuesta", "tiempo_respuesta", "evaluacion"]
        read_only_fields = fields
