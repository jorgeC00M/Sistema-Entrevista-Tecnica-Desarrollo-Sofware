from rest_framework import serializers

from .models import Evaluacion
from .rubricas import banda_de


class EvaluacionSerializer(serializers.ModelSerializer):
    banda = serializers.SerializerMethodField()

    class Meta:
        model = Evaluacion
        fields = ["puntuacion", "banda", "fortalezas", "debilidades", "sugerencias"]
        read_only_fields = fields

    def get_banda(self, obj) -> str:
        return banda_de(obj.puntuacion).codigo
