"""Icono y palabras clave del puesto; puesto de cada tecnología.

`Tecnologia.puesto` nace nullable: las tres tecnologías transversales que ya
existen no tienen puesto, y la restricción "tecnología activa ⇒ con puesto" va
en `0008`, después de que `0007` las desactive. Igual que en `curriculums`,
datos y restricciones no se mezclan en la misma migración.
"""

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('catalogos', '0005_precisar_nombre_de_programacion'),
    ]

    operations = [
        migrations.AddField(
            model_name='puesto',
            name='icono',
            field=models.CharField(blank=True, default='', max_length=30),
        ),
        migrations.AddField(
            model_name='puesto',
            name='palabras_clave',
            field=models.JSONField(blank=True, default=list),
        ),
        migrations.AddField(
            model_name='tecnologia',
            name='puesto',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, related_name='tecnologias', to='catalogos.puesto'),
        ),
    ]
