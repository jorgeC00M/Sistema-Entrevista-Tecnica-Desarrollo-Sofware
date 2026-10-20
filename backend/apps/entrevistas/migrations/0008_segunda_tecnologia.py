"""Segunda tecnología de una entrevista: la de backend en un puesto con capas.

Nullable y sin relleno: las entrevistas anteriores (incluidas las de Full Stack
con una combinación fija como "React + Node.js") conservan su única tecnología.
"""

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('catalogos', '0011_full_stack_por_capas'),
        ('entrevistas', '0007_convocatoria'),
    ]

    operations = [
        migrations.AddField(
            model_name='entrevista',
            name='segunda_tecnologia',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, related_name='entrevistas_como_segunda', to='catalogos.tecnologia'),
        ),
    ]
