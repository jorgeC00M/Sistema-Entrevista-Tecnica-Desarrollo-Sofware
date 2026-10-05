"""Currículums analizados y el resultado de su análisis.

**No se guarda el archivo subido.** Se parsea en memoria y se conserva solo el
texto extraído y el análisis. Hay tres razones y ninguna es una concesión:

- El plan gratuito de Render tiene disco efímero: cualquier archivo escrito
  desaparece al reiniciar o redesplegar. Guardarlo daría una falsa sensación de
  persistencia.
- Un CV lleva el teléfono, el correo y a veces la dirección de una persona real.
  Menos datos personales en reposo es mejor por defecto.
- Después de parsearlo, el archivo no sirve para nada: nunca hay que devolvérselo
  al usuario, que tiene el original.

**No hay puesto.** Lo hubo, y no afectaba a nada: la función que analiza no lo
recibía y elegir backend, frontend o full-stack producía un resultado idéntico. La
referencia del análisis de contenido es ahora la convocatoria que el usuario
aporta, que sí es verificable — "la convocatoria pide Docker y tu CV no lo
menciona" es un hecho, mientras que las áreas de `PLAN_POR_PUESTO` se definieron
para diseñar entrevistas y no son lo que pide el mercado.
"""

from __future__ import annotations

import hashlib

from django.conf import settings
from django.db import models


def hash_de_texto(texto: str) -> str:
    """Huella del texto, para reconocer un contenido ya analizado.

    Se calcula sobre el texto y no sobre los bytes del archivo a propósito:
    reexportar el mismo CV desde Word produce bytes distintos y texto idéntico.
    Lo que interesa es si hay algo nuevo que analizar.

    Un texto vacío —el caso de "sin convocatoria"— devuelve el hash de la cadena
    vacía, que es un valor válido y no NULL. Eso es deliberado: ver la nota en
    `Curriculum.hash_convocatoria`.
    """
    return hashlib.sha256(texto.strip().encode("utf-8")).hexdigest()


class Curriculum(models.Model):
    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="curriculums"
    )
    nombre_archivo = models.CharField(max_length=255)
    formato = models.CharField(max_length=10)
    paginas = models.PositiveSmallIntegerField()
    # Lo que el parser pudo leer del CV. Es la entrada del análisis y lo que se
    # anonimizaría antes de enviar nada a un proveedor de IA.
    texto = models.TextField()
    # Sin índice propio, por lo mismo que `hash_convocatoria`: la única consulta
    # que lo usa filtra por `(usuario, hash_texto, hash_convocatoria)` a la vez, y
    # el índice compuesto de la restricción de unicidad la sirve por prefijo. Uno
    # de columna única nunca se elegiría para esa consulta: solo costaría
    # mantenerlo en cada escritura.
    hash_texto = models.CharField(max_length=64)

    # La convocatoria contra la que se analizó, vacía si no se aportó ninguna.
    # Es contenido de un tercero —una empresa— y se guarda solo para el caché y
    # para el análisis del propio usuario; no se publica ni se comparte.
    convocatoria = models.TextField(blank=True)
    # Se guarda el hash de la cadena vacía cuando no hay convocatoria, **nunca
    # NULL**. Postgres trata los NULL como distintos entre sí, así que con NULL la
    # restricción de unicidad no dispararía y el caché quedaría roto justo en el
    # caso más común, acumulando filas duplicadas sin dar ningún error.
    #
    # Sin índice propio a propósito: la única consulta que lo usa filtra por
    # `(usuario, hash_texto, hash_convocatoria)` a la vez, y el índice compuesto
    # de la restricción de unicidad ya la sirve. Uno de columna única nunca se
    # elegiría para esa consulta: sería un índice que solo cuesta mantener.
    hash_convocatoria = models.CharField(max_length=64)

    fecha = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-fecha"]
        constraints = [
            # El mismo CV contra la misma convocatoria se analiza una vez.
            # Resubirlo devuelve el análisis guardado en lugar de repetir el
            # trabajo. Contra otra convocatoria sí es un análisis nuevo: la
            # referencia es parte de lo que se analizó.
            models.UniqueConstraint(
                fields=["usuario", "hash_texto", "hash_convocatoria"],
                name="curriculum_unico_por_usuario_texto_y_convocatoria",
            )
        ]
        indexes = [models.Index(fields=["usuario", "fecha"])]

    def __str__(self) -> str:
        referencia = "con convocatoria" if self.convocatoria else "sin convocatoria"
        return f"CV de {self.usuario} {referencia} ({self.fecha:%Y-%m-%d})"


class AnalisisATS(models.Model):
    """Resultado del análisis.

    Los cuatro bloques se guardan como JSON en vez de en tablas propias porque son
    el resultado de un análisis, no entidades del dominio: no se consultan por
    separado ni se relacionan con nada. Lo que sí se necesita consultable —cuántos
    campos se extrajeron— se materializa en columnas.
    """

    curriculum = models.OneToOneField(
        Curriculum, on_delete=models.CASCADE, related_name="analisis"
    )

    # Qué vería un ATS: la ficha campo por campo y lo que la rompió.
    campos = models.JSONField()
    hallazgos = models.JSONField()
    campos_detectados = models.PositiveSmallIntegerField()
    campos_intentados = models.PositiveSmallIntegerField()

    # NULL cuando no hubo convocatoria, o cuando la hubo y no mencionaba ningún
    # término reconocible. No es lo mismo que una brecha vacía: "0 de 0
    # requisitos" no dice nada y "no cumples ninguno" sería falso.
    brecha = models.JSONField(null=True, blank=True)
    # Los términos que el CV declara de forma legible. Ocupa el lugar de la brecha
    # cuando no hay convocatoria, y es lo que convierte la advertencia de
    # habilidades en gráficos de sospecha en prueba: si están en barritas, esto
    # sale vacío.
    inventario = models.JSONField(default=list)
    # Viñetas de logro frente a viñetas de tarea. No es una verificación de ATS
    # —a un ATS le da igual si hay métricas— sino consejo para quien lee el CV
    # después, y la interfaz debe presentarlo separado.
    vinetas = models.JSONField(null=True, blank=True)

    fecha = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "análisis ATS"
        verbose_name_plural = "análisis ATS"

    def __str__(self) -> str:
        return f"Análisis {self.campos_detectados}/{self.campos_intentados} de {self.curriculum_id}"
