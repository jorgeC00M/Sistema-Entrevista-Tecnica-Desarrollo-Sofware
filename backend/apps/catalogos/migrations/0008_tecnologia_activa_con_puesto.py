"""Una tecnología activa siempre pertenece a un puesto.

En su propia migración, después de que `0007` desactive las tecnologías
transversales que no tienen puesto: con ellas activas la restricción fallaría.
"""

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("catalogos", "0007_catalogo_por_puesto")]

    operations = [
        migrations.AddConstraint(
            model_name="tecnologia",
            constraint=models.CheckConstraint(
                condition=models.Q(("activo", False), ("puesto__isnull", False), _connector="OR"),
                name="tecnologia_activa_con_puesto",
            ),
        ),
    ]
