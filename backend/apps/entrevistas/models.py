"""Modelos de la sección 3.4.1 del perfil de grado: Entrevista (cabecera) e
Intercambio (pregunta-respuesta). La Evaluación vive en `apps.evaluaciones`.

`puesto`, `tecnologia` y `nivel` son claves foráneas a `apps.catalogos`, no
texto libre: es lo que permite dar de alta una opción nueva desde el admin sin
migrar datos. El puente con la capa de IA es el campo `codigo` del catálogo,
que coincide con los enums de `integrations.ia`.

El área no vive en la cabecera sino en cada `Intercambio`: una entrevista
recorre varios temas, igual que una real, y el puesto es lo que decide cuáles
(`PLAN_POR_PUESTO`). Guardar el área por pregunta —en lugar de recalcularla
desde el puesto— es lo que hace que cambiar esa composición más adelante no
reescriba el historial de quien ya rindió.
"""

from __future__ import annotations

from django.conf import settings
from django.db import models

from integrations.ia.prompts.schemas import AreaTecnica, Nivel, Puesto


class Convocatoria(models.Model):
    """Un aviso de trabajo que el usuario pegó o subió, ya analizado.

    `texto` está **enmascarado** (sin correos, teléfonos ni enlaces del
    reclutador): es lo que se guarda y lo que viaja a la IA. El archivo original
    nunca se guarda. `perfil` es la salida anclada del análisis
    (`PerfilDetectado.como_dict()`), incluso si no se identificó un puesto: el
    mismo aviso daría el mismo resultado.

    La unicidad por usuario y hash es la caché: analizar dos veces el mismo
    aviso no vuelve a llamar a la IA.
    """

    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="convocatorias"
    )
    texto = models.TextField()
    hash = models.CharField(max_length=64)
    perfil = models.JSONField()
    creado_en = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["usuario", "hash"], name="convocatoria_unica_por_usuario")
        ]
        verbose_name = "convocatoria"
        verbose_name_plural = "convocatorias"

    def __str__(self) -> str:
        return f"Convocatoria {self.pk} de {self.usuario}"

    @property
    def requisitos(self) -> tuple[str, ...]:
        return tuple(self.perfil.get("requisitos", ()))


class Entrevista(models.Model):
    class Estado(models.TextChoices):
        EN_PROGRESO = "en_progreso", "En progreso"
        FINALIZADA = "finalizada", "Finalizada"
        ABANDONADA = "abandonada", "Abandonada"

    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="entrevistas"
    )
    # PROTECT en todo el catálogo: una opción con entrevistas hechas no se
    # borra, se desactiva. Si no, el historial del usuario perdería el dato que
    # da sentido a su puntuación.
    puesto = models.ForeignKey(
        "catalogos.Puesto", on_delete=models.PROTECT, related_name="entrevistas"
    )
    nivel = models.ForeignKey(
        "catalogos.Nivel", on_delete=models.PROTECT, related_name="entrevistas"
    )
    # Nula solo en entrevistas anteriores al catálogo por puesto: iniciar una
    # ahora la exige. En un puesto con capas (Full Stack) es la de frontend y
    # `segunda_tecnologia` la de backend; en los demás, la segunda queda nula.
    tecnologia = models.ForeignKey(
        "catalogos.Tecnologia",
        on_delete=models.PROTECT,
        related_name="entrevistas",
        null=True,
        blank=True,
    )
    segunda_tecnologia = models.ForeignKey(
        "catalogos.Tecnologia",
        on_delete=models.PROTECT,
        related_name="entrevistas_como_segunda",
        null=True,
        blank=True,
    )
    # La convocatoria con que se inició, si hubo una: sus requisitos orientan
    # las preguntas. PROTECT: es parte del contexto de esas preguntas.
    convocatoria = models.ForeignKey(
        Convocatoria,
        on_delete=models.PROTECT,
        related_name="entrevistas",
        null=True,
        blank=True,
    )
    estado = models.CharField(max_length=20, choices=Estado.choices, default=Estado.EN_PROGRESO)
    fecha_inicio = models.DateTimeField(auto_now_add=True)
    fecha_fin = models.DateTimeField(null=True, blank=True)
    puntuacion_promedio = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)

    class Meta:
        ordering = ["-fecha_inicio"]
        indexes = [
            # Sirve al listado del historial, que ordena por fecha.
            models.Index(fields=["usuario", "fecha_inicio"]),
            # El filtro realmente caliente: `marcar_abandonadas` y las
            # estadísticas filtran por usuario + estado en cada consulta del
            # historial, no por usuario + fecha.
            models.Index(fields=["usuario", "estado"]),
        ]
        verbose_name = "entrevista"
        verbose_name_plural = "entrevistas"

    def __str__(self) -> str:
        return f"{self.usuario} — {self.puesto.nombre} ({self.get_estado_display()})"

    @property
    def puesto_enum(self) -> Puesto:
        return Puesto(self.puesto.codigo)

    @property
    def nivel_enum(self) -> Nivel:
        return Nivel(self.nivel.codigo)

    @property
    def tecnologia_nombre(self) -> str | None:
        """El nombre que lee la IA y que ve el usuario: "React", o "React +
        Node.js" con dos capas. Es el mismo texto que tenían las combinaciones
        fijas de Full Stack, así que el prompt no distingue unas de otras.

        Por nombre y no por enum: las tecnologías se dan de alta en el
        catálogo, y la IA solo necesita leerla. `None` en las entrevistas
        anteriores al catálogo por puesto."""
        nombres = [t.nombre for t in (self.tecnologia, self.segunda_tecnologia) if t is not None]
        return " + ".join(nombres) or None


class Intercambio(models.Model):
    entrevista = models.ForeignKey(
        Entrevista, on_delete=models.CASCADE, related_name="intercambios"
    )
    numero = models.PositiveSmallIntegerField()
    # El tema de esta pregunta concreta, derivado del puesto al crearla. Se
    # persiste para que el desglose por área del historial siga describiendo lo
    # que realmente se preguntó aunque el plan del puesto cambie después.
    area = models.ForeignKey(
        "catalogos.Area", on_delete=models.PROTECT, related_name="intercambios"
    )
    pregunta = models.TextField()
    respuesta = models.TextField(blank=True, default="")
    creado_en = models.DateTimeField(auto_now_add=True)
    respondido_en = models.DateTimeField(null=True, blank=True)
    tiempo_respuesta = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text="Segundos entre mostrar la pregunta y recibir la respuesta, medidos en el servidor.",
    )

    class Meta:
        ordering = ["numero"]
        constraints = [
            models.UniqueConstraint(
                fields=["entrevista", "numero"], name="unico_numero_por_entrevista"
            )
        ]
        verbose_name = "intercambio"
        verbose_name_plural = "intercambios"

    def __str__(self) -> str:
        return f"Pregunta {self.numero} de la entrevista {self.entrevista_id}"

    @property
    def area_enum(self) -> AreaTecnica:
        return AreaTecnica(self.area.codigo)
