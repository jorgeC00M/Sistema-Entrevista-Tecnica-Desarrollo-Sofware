from django.utils import timezone
from rest_framework import serializers

from rest_framework.exceptions import NotFound

from apps.catalogos.models import Nivel, Puesto, Tecnologia
from apps.common.archivos import texto_de_convocatoria, validar_archivo
from apps.evaluaciones.serializers import EvaluacionSerializer
from integrations.ia.prompts.schemas import PREGUNTAS_POR_ENTREVISTA

from .models import Convocatoria, Entrevista, Intercambio


class IniciarEntrevistaSerializer(serializers.Serializer):
    """Recibe los códigos del catálogo y los resuelve a instancias.

    `SlugRelatedField` valida contra la base de datos, así que pedir un puesto
    dado de baja devuelve 400 sin que la vista tenga que comprobarlo.

    No se recibe área: el puesto es lo que decide qué temas recorre la
    entrevista. La tecnología es obligatoria y tiene que ser **del puesto**:
    "Flutter" no es una tecnología de Frontend. Se valida aquí, antes de que la
    vista llame al servicio, para que una combinación inválida no cree la
    entrevista ni gaste una llamada a la IA.

    Si el puesto tiene capas (Full Stack), `tecnologia` es la de frontend y
    `segunda_tecnologia` la de backend, las dos obligatorias; en los demás
    puestos la segunda no se admite.
    """

    puesto = serializers.SlugRelatedField(
        slug_field="codigo", queryset=Puesto.objects.filter(activo=True)
    )
    nivel = serializers.SlugRelatedField(
        slug_field="codigo", queryset=Nivel.objects.filter(activo=True)
    )
    tecnologia = serializers.SlugRelatedField(
        slug_field="codigo", queryset=Tecnologia.objects.filter(activo=True)
    )
    segunda_tecnologia = serializers.SlugRelatedField(
        slug_field="codigo",
        queryset=Tecnologia.objects.filter(activo=True),
        required=False,
        allow_null=True,
    )
    # La convocatoria analizada con que se configuró, si hubo una. Debe ser del
    # usuario (llega en `context["request"]`): una ajena da 404, como el resto.
    convocatoria = serializers.IntegerField(required=False, allow_null=True)

    def validate_convocatoria(self, valor):
        if valor is None:
            return None
        usuario = self.context["request"].user
        convocatoria = Convocatoria.objects.filter(pk=valor, usuario=usuario).first()
        if convocatoria is None:
            raise NotFound("No se encontró esa convocatoria.")
        return convocatoria

    def validate(self, datos):
        puesto = datos["puesto"]
        elegidas = {"tecnologia": datos["tecnologia"], "segunda_tecnologia": datos.get("segunda_tecnologia")}

        for campo, tecnologia in elegidas.items():
            if tecnologia is not None and tecnologia.puesto_id != puesto.pk:
                raise serializers.ValidationError(
                    {campo: f"«{tecnologia.nombre}» no es una tecnología de {puesto.nombre}."}
                )

        if not puesto.tiene_capas:
            if elegidas["segunda_tecnologia"] is not None:
                raise serializers.ValidationError(
                    {"segunda_tecnologia": f"{puesto.nombre} se practica con una sola tecnología."}
                )
            return datos

        # Una por capa y en orden: frontend en `tecnologia`, backend en la segunda.
        for (campo, tecnologia), capa in zip(elegidas.items(), Tecnologia.CAPAS_EN_ORDEN):
            if tecnologia is None:
                raise serializers.ValidationError(
                    {campo: f"Falta la tecnología de {capa.label.lower()} de {puesto.nombre}."}
                )
            if tecnologia.capa != capa:
                raise serializers.ValidationError(
                    {campo: f"«{tecnologia.nombre}» no es una tecnología de {capa.label.lower()}."}
                )
        return datos


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
    # Pueden ser nulas (entrevistas antiguas; la segunda, fuera de Full Stack):
    # el cliente debe tratar la ausencia.
    tecnologia = serializers.SlugRelatedField(slug_field="codigo", read_only=True)
    segunda_tecnologia = serializers.SlugRelatedField(slug_field="codigo", read_only=True)
    puesto_display = serializers.CharField(source="puesto.nombre", read_only=True)
    nivel_display = serializers.CharField(source="nivel.nombre", read_only=True)
    # "React + Node.js" con dos capas: lo que se muestra en historial y reporte.
    tecnologia_display = serializers.CharField(source="tecnologia_nombre", read_only=True)
    estado_display = serializers.CharField(source="get_estado_display", read_only=True)
    # Cuántas respuestas tienen evaluación, frente a las previstas: el desglose
    # del reporte dice sobre cuántas se calculó cada criterio.
    preguntas_calificadas = serializers.SerializerMethodField()
    preguntas_previstas = serializers.SerializerMethodField()
    desde_convocatoria = serializers.SerializerMethodField()
    # Hasta cuándo se puede responder, y la hora del servidor al responder: el
    # cliente cuenta el tiempo con su desfase, no con su propio reloj.
    fecha_limite = serializers.DateTimeField(read_only=True)
    ahora = serializers.SerializerMethodField()

    def get_ahora(self, entrevista) -> str:
        return serializers.DateTimeField().to_representation(timezone.now())

    def get_desde_convocatoria(self, entrevista) -> bool:
        return entrevista.convocatoria_id is not None

    def get_preguntas_calificadas(self, entrevista) -> int:
        anotado = getattr(entrevista, "preguntas_calificadas", None)
        if anotado is not None:
            return anotado
        return entrevista.intercambios.filter(evaluacion__isnull=False).count()

    def get_preguntas_previstas(self, entrevista) -> int:
        return PREGUNTAS_POR_ENTREVISTA

    class Meta:
        model = Entrevista
        fields = [
            "id",
            "puesto",
            "puesto_display",
            "nivel",
            "nivel_display",
            "tecnologia",
            "segunda_tecnologia",
            "tecnologia_display",
            "estado",
            "estado_display",
            "fecha_inicio",
            "fecha_fin",
            "puntuacion_promedio",
            "preguntas_calificadas",
            "preguntas_previstas",
            "desde_convocatoria",
            "fecha_limite",
            "ahora",
        ]
        read_only_fields = fields


class IntercambioSerializer(serializers.ModelSerializer):
    # Cuánto de la evaluación sale por la API lo decide el contexto
    # `evaluacion`: "completa" (finalizada, el valor por defecto), "sin_nota"
    # (abandonada o con el tiempo agotado: solo la retroalimentación, sin
    # puntuación ni niveles, porque lo incompleto no se califica) o `None` (en
    # curso: nada, aunque se siga calculando para la adaptatividad). Ocultarla
    # solo en la interfaz no serviría — se vería en la pestaña de red.
    #
    # Se devuelve `null` en vez de omitir la clave para que la forma de la
    # respuesta no cambie según el estado de la entrevista.
    evaluacion = serializers.SerializerMethodField()
    # El tema de esta pregunta: con un puesto que reparte varias áreas, saber de
    # qué iba cada una es lo que hace legible el reporte.
    area = serializers.SlugRelatedField(slug_field="codigo", read_only=True)
    area_display = serializers.CharField(source="area.nombre", read_only=True)

    def get_evaluacion(self, intercambio) -> dict | None:
        modo = self.context.get("evaluacion", "completa")
        evaluacion = getattr(intercambio, "evaluacion", None)
        if modo is None or evaluacion is None:
            return None
        if modo == "sin_nota":
            return {
                "fortalezas": evaluacion.fortalezas,
                "debilidades": evaluacion.debilidades,
                "sugerencias": evaluacion.sugerencias,
            }
        return EvaluacionSerializer(evaluacion).data

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


class ConfiguracionSerializer(serializers.Serializer):
    """Puesto, tecnología y nivel de una entrevista, con código y nombre.

    La tecnología sale nula si la entrevista no tenía o si ya no se ofrece
    (inactiva): "Repetir configuración" no debe proponer algo que el catálogo
    ya no acepta. Una combinación fija de Full Stack, ya inactiva, vuelve nula
    y la pantalla pide elegir frontend y backend.
    """

    puesto = serializers.CharField(source="puesto.codigo")
    puesto_nombre = serializers.CharField(source="puesto.nombre")
    nivel = serializers.CharField(source="nivel.codigo")
    nivel_nombre = serializers.CharField(source="nivel.nombre")
    tecnologia = serializers.SerializerMethodField()
    tecnologia_nombre = serializers.SerializerMethodField()
    segunda_tecnologia = serializers.SerializerMethodField()
    segunda_tecnologia_nombre = serializers.SerializerMethodField()

    @staticmethod
    def _si_vigente(tecnologia, atributo: str) -> str | None:
        """`codigo` o `nombre` de la tecnología, o `None` si no hay o ya no se ofrece."""
        return getattr(tecnologia, atributo) if tecnologia is not None and tecnologia.activo else None

    def get_tecnologia(self, entrevista) -> str | None:
        return self._si_vigente(entrevista.tecnologia, "codigo")

    def get_tecnologia_nombre(self, entrevista) -> str | None:
        return self._si_vigente(entrevista.tecnologia, "nombre")

    def get_segunda_tecnologia(self, entrevista) -> str | None:
        return self._si_vigente(entrevista.segunda_tecnologia, "codigo")

    def get_segunda_tecnologia_nombre(self, entrevista) -> str | None:
        return self._si_vigente(entrevista.segunda_tecnologia, "nombre")


#: Menos de esto no alcanza para identificar un puesto; más, no es un aviso.
MINIMO_CARACTERES_CONVOCATORIA = 30
MAXIMO_CARACTERES_CONVOCATORIA = 5000


class AnalizarConvocatoriaSerializer(serializers.Serializer):
    """El aviso pegado (`texto`) o subido (`archivo`, PDF/DOCX), no las dos cosas.

    Devuelve siempre el texto en `validated_data["texto"]`: el formato en que
    llegó es un detalle de la entrada, no del análisis.
    """

    texto = serializers.CharField(required=False, allow_blank=True, trim_whitespace=True)
    archivo = serializers.FileField(required=False)

    def validate_archivo(self, archivo):
        return validar_archivo(archivo)

    def validate(self, datos):
        pegado = datos.get("texto", "").strip()
        archivo = datos.get("archivo")
        if pegado and archivo:
            raise serializers.ValidationError("Envía la convocatoria pegada o como archivo, no las dos cosas.")
        if archivo:
            pegado = texto_de_convocatoria(archivo, "archivo").strip()
        if len(pegado) < MINIMO_CARACTERES_CONVOCATORIA:
            raise serializers.ValidationError(
                {"texto": "Pega el aviso completo: con tan poco texto no se puede identificar el puesto."}
            )
        if len(pegado) > MAXIMO_CARACTERES_CONVOCATORIA:
            raise serializers.ValidationError(
                {"texto": f"La convocatoria supera los {MAXIMO_CARACTERES_CONVOCATORIA} caracteres."}
            )
        return {"texto": pegado}


class ConvocatoriaSerializer(serializers.ModelSerializer):
    """La convocatoria analizada, con el perfil y los nombres que muestra la pantalla."""

    perfil = serializers.SerializerMethodField()

    class Meta:
        model = Convocatoria
        fields = ["id", "perfil"]
        read_only_fields = fields

    def get_perfil(self, convocatoria) -> dict:
        perfil = dict(convocatoria.perfil)
        codigos = _codigos_de_tecnologia(perfil)
        puesto = Puesto.objects.filter(codigo=perfil.get("puesto")).first()
        tecnologias = Tecnologia.objects.in_bulk(codigos, field_name="codigo")
        nivel = Nivel.objects.filter(codigo=perfil.get("nivel")).first()
        perfil["puesto_nombre"] = puesto.nombre if puesto else None
        perfil["tecnologias"] = [c for c in codigos if c in tecnologias]
        perfil["tecnologias_nombres"] = [tecnologias[c].nombre for c in perfil["tecnologias"]]
        perfil["nivel_nombre"] = nivel.nombre if nivel else None
        return perfil


def _codigos_de_tecnologia(perfil: dict) -> list[str]:
    """Las tecnologías del perfil guardado, en el formato actual o el anterior.

    Antes de las capas, el perfil tenía `"tecnologia"` (un código o nulo); se lee
    como una lista de uno. Se normaliza al leer y no con una migración de datos:
    el perfil anterior sigue sirviendo tal cual y la caché por hash no se toca."""
    anterior = perfil.pop("tecnologia", None)
    if "tecnologias" in perfil:
        return list(perfil["tecnologias"])
    return [anterior] if anterior else []
