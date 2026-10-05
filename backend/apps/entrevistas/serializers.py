from rest_framework import serializers

from apps.catalogos.models import Nivel, Puesto, Tecnologia
from apps.evaluaciones.serializers import EvaluacionSerializer

from .models import Entrevista, Intercambio


class IniciarEntrevistaSerializer(serializers.Serializer):
    """Recibe los códigos del catálogo y los resuelve a instancias.

    `SlugRelatedField` valida contra la base de datos, así que pedir un puesto
    dado de baja devuelve 400 sin que la vista tenga que comprobarlo.

    No se recibe área: el puesto es lo que decide qué temas recorre la
    entrevista. Lo que sí es opcional es la tecnología — "sin preferencia" es
    una respuesta legítima de un egresado.
    """

    puesto = serializers.SlugRelatedField(
        slug_field="codigo", queryset=Puesto.objects.filter(activo=True)
    )
    nivel = serializers.SlugRelatedField(
        slug_field="codigo", queryset=Nivel.objects.filter(activo=True)
    )
    tecnologia = serializers.SlugRelatedField(
        slug_field="codigo",
        queryset=Tecnologia.objects.filter(activo=True),
        required=False,
        allow_null=True,
    )


#: Tope del lado servidor para la respuesta del candidato. El cliente ya
#: limita a 1000 (`CampoRespuesta.tsx`); este margen lo admite con holgura y a
#: la vez impide que un cliente ajeno mande texto sin límite, que acabaría
#: íntegro dentro del prompt de un proveedor de pago.
MAXIMO_CARACTERES_RESPUESTA = 2000


class ResponderSerializer(serializers.Serializer):
    respuesta = serializers.CharField(
        allow_blank=False,
        trim_whitespace=True,
        max_length=MAXIMO_CARACTERES_RESPUESTA,
    )


class EntrevistaSerializer(serializers.ModelSerializer):
    # Se expone el `codigo` del catálogo, no el id: es la clave estable que
    # entiende tanto el frontend como la capa de IA.
    puesto = serializers.SlugRelatedField(slug_field="codigo", read_only=True)
    nivel = serializers.SlugRelatedField(slug_field="codigo", read_only=True)
    # `tecnologia` puede ser nula: el cliente debe tratar la ausencia, no un
    # texto como "indiferente".
    tecnologia = serializers.SlugRelatedField(slug_field="codigo", read_only=True)
    puesto_display = serializers.CharField(source="puesto.nombre", read_only=True)
    nivel_display = serializers.CharField(source="nivel.nombre", read_only=True)
    tecnologia_display = serializers.CharField(
        source="tecnologia.nombre", read_only=True, default=None
    )
    estado_display = serializers.CharField(source="get_estado_display", read_only=True)

    class Meta:
        model = Entrevista
        fields = [
            "id",
            "puesto",
            "puesto_display",
            "nivel",
            "nivel_display",
            "tecnologia",
            "tecnologia_display",
            "estado",
            "estado_display",
            "fecha_inicio",
            "fecha_fin",
            "puntuacion_promedio",
        ]
        read_only_fields = fields


class IntercambioSerializer(serializers.ModelSerializer):
    # La calificación solo se publica cuando la entrevista terminó: durante la
    # entrevista se sigue calculando y guardando (la adaptatividad la necesita),
    # pero no sale por la API. Ocultarla solo en la interfaz no serviría — se
    # vería en la pestaña de red del navegador.
    #
    # Se devuelve `null` en vez de omitir la clave para que la forma de la
    # respuesta no cambie según el estado de la entrevista.
    evaluacion = serializers.SerializerMethodField()
    # El tema de esta pregunta: con un puesto que reparte varias áreas, saber de
    # qué iba cada una es lo que hace legible el reporte.
    area = serializers.SlugRelatedField(slug_field="codigo", read_only=True)
    area_display = serializers.CharField(source="area.nombre", read_only=True)

    def get_evaluacion(self, intercambio) -> dict | None:
        if not self.context.get("con_evaluacion", True):
            return None
        evaluacion = getattr(intercambio, "evaluacion", None)
        return EvaluacionSerializer(evaluacion).data if evaluacion else None

    class Meta:
        model = Intercambio
        fields = [
            "numero",
            "area",
            "area_display",
            "pregunta",
            "respuesta",
            "tiempo_respuesta",
            "evaluacion",
        ]
        read_only_fields = fields
