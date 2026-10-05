"""Cierra el cambio: puesto y área del intercambio pasan a obligatorios y
`Entrevista.area` desaparece.

Se ejecuta después de `0005`, cuando ya no quedan filas sin rellenar. Al retirar
`Entrevista.area` el modelo deja de poder representar "una entrevista = un área",
que es justamente el supuesto que este cambio elimina.
"""

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [("entrevistas", "0005_datos_area_a_puesto")]

    operations = [
        migrations.AlterField(
            model_name="entrevista",
            name="puesto",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.PROTECT,
                related_name="entrevistas",
                to="catalogos.puesto",
            ),
        ),
        migrations.AlterField(
            model_name="intercambio",
            name="area",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.PROTECT,
                related_name="intercambios",
                to="catalogos.area",
            ),
        ),
        migrations.RemoveField(model_name="entrevista", name="area"),
    ]
