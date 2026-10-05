from rest_framework import serializers

from integrations.ia.prompts.schemas import Puesto as PuestoIA
from integrations.ia.prompts.schemas import areas_que_cubre

from .models import Area, Nivel, Puesto, Tecnologia


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


class TecnologiaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tecnologia
        fields = ["codigo", "nombre", "descripcion", "orden"]
        read_only_fields = fields


class PuestoSerializer(serializers.ModelSerializer):
    areas = serializers.SerializerMethodField()

    class Meta:
        model = Puesto
        fields = ["codigo", "nombre", "descripcion", "orden", "areas"]
        read_only_fields = fields

    def get_areas(self, puesto: Puesto) -> list[str]:
        """Códigos de las áreas que recorre este puesto, sin repetir.

        Se publica para que la pantalla de selección pueda mostrar qué temas
        entran antes de empezar: el usuario ya no elige el área, pero sí debe
        poder verla. Van solo los códigos porque la misma respuesta ya trae el
        catálogo de áreas con sus nombres — duplicarlos aquí sería tener el
        nombre en dos sitios.

        Si una fila del catálogo no tiene miembro en el enum de la capa de IA
        (alguien la dio de alta desde el admin sin tocar el código), se devuelve
        vacío en lugar de romper el catálogo entero. Lo que señala ese desajuste
        es `test_codigos_coinciden_con_los_enums_de_la_capa_de_ia`.
        """
        try:
            return [area.value for area in areas_que_cubre(PuestoIA(puesto.codigo))]
        except ValueError:
            return []
