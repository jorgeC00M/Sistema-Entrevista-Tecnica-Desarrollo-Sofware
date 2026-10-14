from rest_framework import serializers

from .models import Evaluacion
from .rubricas import banda_de


class EvaluacionSerializer(serializers.ModelSerializer):
    banda = serializers.SerializerMethodField()
    # Los niveles por criterio y la versión de la rúbrica salen de
    # `evaluacion_json`. Una evaluación anterior a la rúbrica por niveles no los
    # tiene: se publica `null` y la interfaz muestra solo la nota, sin desglose.
    niveles = serializers.SerializerMethodField()
    version_rubrica = serializers.SerializerMethodField()
    # Lo que una respuesta completa debía cubrir. Lista vacía, no `null`, en las
    # evaluaciones anteriores: "no hay puntos que mostrar" es la misma lectura.
    puntos_clave = serializers.SerializerMethodField()

    class Meta:
        model = Evaluacion
        fields = [
            "puntuacion",
            "banda",
            "niveles",
            "version_rubrica",
            "fortalezas",
            "debilidades",
            "sugerencias",
            "puntos_clave",
        ]
        read_only_fields = fields

    def get_banda(self, obj) -> str:
        return banda_de(obj.puntuacion).codigo

    def get_niveles(self, obj) -> dict[str, int] | None:
        return obj.niveles

    def get_version_rubrica(self, obj) -> int | None:
        return (obj.evaluacion_json or {}).get("version_rubrica")

    def get_puntos_clave(self, obj) -> list[str]:
        puntos = (obj.evaluacion_json or {}).get("puntos_clave")
        if not isinstance(puntos, list):
            return []
        return [p for p in puntos if isinstance(p, str) and p.strip()]
