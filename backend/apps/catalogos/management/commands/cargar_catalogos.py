"""Sincroniza puestos, tecnologías y niveles con `apps/catalogos/datos.py`.

    python manage.py cargar_catalogos

Idempotente: `update_or_create` por código, nunca borra. Sirve para corregir
un texto o dar de alta una tecnología sin escribir una
migración. Lo que ya no figura en `datos.py` se deja como está (para retirar
algo se desactiva desde el admin: las entrevistas hechas lo referencian).

No crea áreas ni toca el plan de preguntas: eso es diseño de la simulación y
vive en `integrations/ia/prompts/schemas.py`.
"""

from __future__ import annotations

from django.core.management.base import BaseCommand
from django.db import transaction

from ...datos import NIVELES, PUESTOS
from ...models import Nivel, Puesto, Tecnologia


class Command(BaseCommand):
    help = "Carga o actualiza el catálogo de puestos, tecnologías y niveles desde datos.py."

    @transaction.atomic
    def handle(self, *args, **opciones):
        creados = actualizados = 0

        def contar(creado: bool) -> None:
            nonlocal creados, actualizados
            if creado:
                creados += 1
            else:
                actualizados += 1

        for orden, datos in enumerate(PUESTOS, start=1):
            puesto, creado = Puesto.objects.update_or_create(
                codigo=datos.codigo,
                defaults={
                    "nombre": datos.nombre,
                    "descripcion": datos.descripcion,
                    "icono": datos.icono,
                    "orden": orden,
                    "activo": True,
                },
            )
            contar(creado)
            for orden_tec, tecnologia in enumerate(datos.tecnologias, start=1):
                _, creado = Tecnologia.objects.update_or_create(
                    codigo=tecnologia.codigo,
                    defaults={
                        "puesto": puesto,
                        "nombre": tecnologia.nombre,
                        "capa": tecnologia.capa,
                        "grupo": tecnologia.grupo,
                        "orden": orden_tec,
                        "activo": True,
                    },
                )
                contar(creado)

        for codigo, nombre, descripcion, orden in NIVELES:
            _, creado = Nivel.objects.update_or_create(
                codigo=codigo, defaults={"nombre": nombre, "descripcion": descripcion, "orden": orden}
            )
            contar(creado)

        self.stdout.write(self.style.SUCCESS(f"Catálogo sincronizado: {creados} creados, {actualizados} revisados."))
