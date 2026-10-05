"""Primer paso del cambio de "una entrevista = un área" a "una entrevista = un
puesto que recorre varias áreas".

Los campos nuevos entran como NULL porque las filas que ya existen todavía no
tienen con qué rellenarlos. La migración `0005` los completa a partir del área
vieja y la `0006` los vuelve obligatorios y retira `Entrevista.area`. Separarlo
en tres pasos es lo que permite aplicarlo sobre una base con datos sin perderlos.

`Entrevista.area` se afloja aquí a NULL aunque solo se retire en la `0006`: al
revertir, la `0005` necesita un campo donde volver a escribir antes de que este
paso vuelva a exigirlo. Sin eso la secuencia solo iría hacia adelante.
"""

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        ("entrevistas", "0003_entrevista_entrevistas_usuario_8cd9a6_idx"),
        ("catalogos", "0003_puesto_tecnologia"),
    ]

    operations = [
        migrations.AlterField(
            model_name="entrevista",
            name="area",
            field=models.ForeignKey(
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name="entrevistas",
                to="catalogos.area",
            ),
        ),
        migrations.AddField(
            model_name="entrevista",
            name="puesto",
            field=models.ForeignKey(
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name="entrevistas",
                to="catalogos.puesto",
            ),
        ),
        migrations.AddField(
            model_name="entrevista",
            name="tecnologia",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name="entrevistas",
                to="catalogos.tecnologia",
            ),
        ),
        migrations.AddField(
            model_name="intercambio",
            name="area",
            field=models.ForeignKey(
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name="intercambios",
                to="catalogos.area",
            ),
        ),
    ]
