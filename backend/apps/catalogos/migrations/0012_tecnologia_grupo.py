"""Rótulo de presentación de una tecnología: su lenguaje o tipo de prueba. Solo esquema."""

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('catalogos', '0011_full_stack_por_capas'),
    ]

    operations = [
        migrations.AddField(
            model_name='tecnologia',
            name='grupo',
            field=models.CharField(blank=True, default='', max_length=40),
        ),
    ]
