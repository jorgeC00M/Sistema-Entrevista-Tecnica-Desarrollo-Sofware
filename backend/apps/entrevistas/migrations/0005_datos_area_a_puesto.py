"""Rellena los campos nuevos de las entrevistas que ya existían.

Las entrevistas anteriores a este cambio se hicieron sobre un área única, que no
tiene un puesto equivalente: una entrevista de "Bases de Datos" no es una
postulación a Backend, es otra cosa. Se asignan todas a `full_stack` porque es
el puesto que abarca el abanico más amplio, y se deja constancia aquí de que es
una convención de migración y no un dato que el usuario eligiera.

Cada intercambio hereda el área de su entrevista, que es exactamente el tema que
se le preguntó: ahí el dato sí es fiel.
"""

from django.db import migrations

PUESTO_PARA_LO_ANTERIOR = "full_stack"


def rellenar(apps, schema_editor):
    Entrevista = apps.get_model("entrevistas", "Entrevista")
    Intercambio = apps.get_model("entrevistas", "Intercambio")
    Puesto = apps.get_model("catalogos", "Puesto")

    if not Entrevista.objects.exists():
        return

    puesto = Puesto.objects.get(codigo=PUESTO_PARA_LO_ANTERIOR)
    Entrevista.objects.filter(puesto__isnull=True).update(puesto=puesto)

    # Una sola sentencia por entrevista en vez de una por intercambio: el área
    # es la misma para todos los intercambios de una entrevista vieja.
    for entrevista_id, area_id in Entrevista.objects.values_list("id", "area_id"):
        Intercambio.objects.filter(entrevista_id=entrevista_id, area__isnull=True).update(
            area_id=area_id
        )


def revertir(apps, schema_editor):
    """Devuelve `Entrevista.area` desde el área de su primer intercambio.

    No es exacto por naturaleza: una entrevista creada ya con el modelo nuevo
    recorre varias áreas y no cabe en un solo campo. Se toma la de la primera
    pregunta como la más representativa, que es lo mejor que se puede hacer sin
    inventar datos.
    """
    Entrevista = apps.get_model("entrevistas", "Entrevista")
    Intercambio = apps.get_model("entrevistas", "Intercambio")

    for entrevista in Entrevista.objects.filter(area__isnull=True):
        primero = (
            Intercambio.objects.filter(entrevista=entrevista)
            .order_by("numero")
            .values_list("area_id", flat=True)
            .first()
        )
        if primero is not None:
            Entrevista.objects.filter(pk=entrevista.pk).update(area_id=primero)


class Migration(migrations.Migration):
    dependencies = [
        ("entrevistas", "0004_puesto_tecnologia_y_area_por_intercambio"),
        # Los puestos tienen que estar sembrados antes de poder asignarlos.
        ("catalogos", "0004_datos_puestos_y_areas_nuevas"),
    ]

    operations = [migrations.RunPython(rellenar, revertir)]
