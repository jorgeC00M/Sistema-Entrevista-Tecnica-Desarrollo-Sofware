from rest_framework import serializers

from integrations.documentos.extractor import extraer

from .models import AnalisisATS, Curriculum

#: Tope de tamaño del archivo, verificado **antes** de parsearlo. Un CV de dos
#: páginas pesa unos cientos de kilobytes; dos megas admiten con holgura uno con
#: una foto y a la vez impiden que un archivo de cien megas ocupe la memoria del
#: worker mientras se abre. El tope de páginas se comprueba aparte, al abrir el
#: documento, porque contarlas exige haberlo abierto.
MAXIMO_BYTES = 2 * 1024 * 1024

#: Lo que el cliente puede mandar. Las imágenes se rechazan aquí, con su motivo,
#: en lugar de dejar que el extractor lo haga: para un ATS son un fallo
#: garantizado y decirlo de inmediato es más útil que fingir un análisis.
EXTENSIONES_ACEPTADAS = (".pdf", ".docx")

#: Tope del texto de la convocatoria. Una descripción de puesto larga ronda los
#: 6.000 caracteres; este margen la admite de sobra y evita que se use el campo
#: para almacenar texto arbitrario.
MAXIMO_CARACTERES_CONVOCATORIA = 20_000


def _validar_archivo(archivo):
    """Formato y peso. Compartido por el CV y por la convocatoria en archivo."""
    nombre = archivo.name.lower()
    if not nombre.endswith(EXTENSIONES_ACEPTADAS):
        raise serializers.ValidationError(
            "Solo se aceptan archivos PDF o DOCX. Una imagen (JPG, PNG) no la puede "
            "leer ningún ATS: exporta el documento desde Word o Google Docs."
        )
    if archivo.size > MAXIMO_BYTES:
        raise serializers.ValidationError(
            f"El archivo pesa {archivo.size // 1024} KB y el máximo es "
            f"{MAXIMO_BYTES // 1024} KB."
        )
    return archivo


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
        return _validar_archivo(archivo)

    def validate_archivo_convocatoria(self, archivo):
        return _validar_archivo(archivo)

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
            documento = extraer(en_archivo.read(), en_archivo.name)
            if not documento.tiene_capa_de_texto:
                raise serializers.ValidationError(
                    {
                        "archivo_convocatoria": (
                            "No se pudo leer texto del archivo de la convocatoria: "
                            "parece ser una imagen escaneada. Pega el texto en su lugar."
                        )
                    }
                )
            datos["convocatoria"] = documento.texto

        datos.pop("archivo_convocatoria", None)
        return datos


class CampoSerializer(serializers.Serializer):
    """Un campo de la ficha que armaría el ATS. Se lee del JSON, no de una tabla."""

    nombre = serializers.CharField()
    detectado = serializers.BooleanField()
    valor = serializers.CharField(allow_blank=True)
    nota = serializers.CharField(allow_blank=True)


class HallazgoSerializer(serializers.Serializer):
    codigo = serializers.CharField()
    severidad = serializers.CharField()
    titulo = serializers.CharField()
    detalle = serializers.CharField()
    favorable = serializers.BooleanField()


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
    con_convocatoria = serializers.BooleanField(read_only=True)

    class Meta:
        model = Curriculum
        fields = ("id", "nombre_archivo", "fecha", "parseabilidad", "con_convocatoria")
