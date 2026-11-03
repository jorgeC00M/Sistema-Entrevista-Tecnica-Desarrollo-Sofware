from rest_framework import serializers

from apps.common.archivos import texto_de_convocatoria, validar_archivo

from .models import AnalisisATS, Curriculum

#: Tope del texto de la convocatoria. Una descripción de puesto larga ronda los
#: 6.000 caracteres; este margen la admite de sobra y evita que se use el campo
#: para almacenar texto arbitrario.
MAXIMO_CARACTERES_CONVOCATORIA = 20_000


class SubirCurriculumSerializer(serializers.Serializer):
    """Recibe el currículum y, opcionalmente, la convocatoria contra la que medirlo.

    La convocatoria es opcional porque son dos preguntas distintas y ambas valen:
    "¿puede el ATS leer mi CV?" se responde sin ella, y exigirla le negaría esa
    respuesta a quien solo quiere eso.

    Llega por una de dos vías, pegada o como archivo, nunca por las dos a la vez:
    aceptar ambas obligaría a elegir una en silencio.
    """

    archivo = serializers.FileField()
    convocatoria = serializers.CharField(
        required=False,
        allow_blank=True,
        trim_whitespace=True,
        max_length=MAXIMO_CARACTERES_CONVOCATORIA,
    )
    archivo_convocatoria = serializers.FileField(required=False)

    def validate_archivo(self, archivo):
        return validar_archivo(archivo)

    def validate_archivo_convocatoria(self, archivo):
        return validar_archivo(archivo)

    def validate(self, datos):
        pegada = datos.get("convocatoria", "").strip()
        en_archivo = datos.get("archivo_convocatoria")

        if pegada and en_archivo:
            raise serializers.ValidationError(
                "Envía la convocatoria pegada o como archivo, no las dos cosas."
            )

        # El servicio recibe la convocatoria siempre como texto: el formato en que
        # llegó es un detalle de la entrada, no del análisis. Extraerla aquí
        # también hace que un archivo ilegible se rechace antes de tocar el CV.
        if en_archivo:
            datos["convocatoria"] = texto_de_convocatoria(en_archivo, "archivo_convocatoria")

        datos.pop("archivo_convocatoria", None)
        return datos


class CampoSerializer(serializers.Serializer):
    """Un campo de la ficha que armaría el ATS. Se lee del JSON, no de una tabla."""

    nombre = serializers.CharField()
    detectado = serializers.BooleanField()
    valor = serializers.CharField(allow_blank=True)
    nota = serializers.CharField(allow_blank=True)
    # Los análisis de reglas < 8 no lo traen: se publican como completos.
    incompleto = serializers.BooleanField(default=False)


class HallazgoSerializer(serializers.Serializer):
    codigo = serializers.CharField()
    severidad = serializers.CharField()
    titulo = serializers.CharField()
    detalle = serializers.CharField()
    favorable = serializers.BooleanField()
    # Los análisis guardados con reglas < 6 no la tienen: el frontend muestra su
    # diagnóstico como título hasta que el CV se vuelva a subir.
    accion = serializers.CharField(default="")
    # Igual que `accion`: los análisis de reglas < 7 no traen ejemplo.
    ejemplo = serializers.CharField(default="")


class AnalisisATSSerializer(serializers.ModelSerializer):
    campos = CampoSerializer(many=True, read_only=True)
    fortalezas = serializers.SerializerMethodField()
    debilidades = serializers.SerializerMethodField()
    # Una sola definición, en el modelo: el detalle y el historial no pueden
    # formatearla distinto.
    parseabilidad = serializers.CharField(read_only=True)

    class Meta:
        model = AnalisisATS
        fields = (
            "campos",
            "fortalezas",
            "debilidades",
            "campos_detectados",
            "campos_intentados",
            "parseabilidad",
            "brecha",
            "inventario",
            "vinetas",
            "revision_ia",
            "fecha",
        )

    def get_fortalezas(self, analisis) -> list[dict]:
        return HallazgoSerializer(analisis.hallazgos.get("fortalezas", []), many=True).data

    def get_debilidades(self, analisis) -> list[dict]:
        return HallazgoSerializer(analisis.hallazgos.get("debilidades", []), many=True).data


class CurriculumSerializer(serializers.ModelSerializer):
    analisis = AnalisisATSSerializer(read_only=True)
    con_convocatoria = serializers.BooleanField(read_only=True)

    class Meta:
        model = Curriculum
        # `texto` y `convocatoria` quedan fuera: el primero es el CV entero de una
        # persona real y el cliente ya tiene el archivo original; el segundo lo
        # acaba de enviar él. Lo que necesita mostrar es el análisis, no el volcado
        # de los documentos.
        fields = ("id", "nombre_archivo", "formato", "paginas", "fecha", "con_convocatoria", "analisis")


class CurriculumListaSerializer(serializers.ModelSerializer):
    """Fila del historial: lo justo para ver si el CV mejoró con el tiempo."""

    # Nulo si el análisis quedó a medias: DRF devuelve `None` cuando la relación
    # inversa no existe.
    parseabilidad = serializers.CharField(source="analisis.parseabilidad", read_only=True, allow_null=True)
    # El estado del CV en palabras, nunca un número; nulo igual que `parseabilidad`.
    veredicto = serializers.CharField(source="analisis.veredicto", read_only=True, allow_null=True)
    con_convocatoria = serializers.BooleanField(read_only=True)

    class Meta:
        model = Curriculum
        fields = ("id", "nombre_archivo", "fecha", "parseabilidad", "veredicto", "con_convocatoria")
