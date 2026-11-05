"""Deja a lo sumo una entrevista en curso por usuario, antes del índice de 0012.

Antes de `una-entrevista-en-curso` se podía iniciar una entrevista con otra en
curso. Por usuario se conserva la más reciente y las demás pasan a abandonadas
(sin nota, como cualquier abandonada). Revertir no las reabre: no hay forma de
saber cuáles eran.
"""

from django.db import migrations
from django.utils import timezone


def cerrar_sobrantes(apps, schema_editor):
    Entrevista = apps.get_model("entrevistas", "Entrevista")
    vistos = set()
    sobrantes = []
    en_curso = Entrevista.objects.filter(estado="en_progreso").order_by("usuario_id", "-fecha_inicio", "-pk")
    for usuario_id, pk in en_curso.values_list("usuario_id", "pk"):
        if usuario_id in vistos:
            sobrantes.append(pk)
        else:
            vistos.add(usuario_id)
    Entrevista.objects.filter(pk__in=sobrantes).update(estado="abandonada", fecha_fin=timezone.now())


class Migration(migrations.Migration):

    dependencies = [
        ("entrevistas", "0010_tiempo_agotado"),
    ]

    operations = [
        migrations.RunPython(cerrar_sobrantes, migrations.RunPython.noop),
    ]
