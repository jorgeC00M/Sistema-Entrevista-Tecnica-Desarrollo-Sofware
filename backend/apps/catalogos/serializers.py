from rest_framework import serializers

from .models import Area, Nivel


class AreaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Area
        fields = ["codigo", "nombre", "descripcion", "orden"]
        read_only_fields = fields


class NivelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Nivel
        fields = ["codigo", "nombre", "descripcion", "orden"]
        read_only_fields = fields
