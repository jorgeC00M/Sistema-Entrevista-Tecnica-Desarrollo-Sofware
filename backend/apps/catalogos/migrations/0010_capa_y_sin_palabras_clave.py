"""Tecnologías por capa y fin de las palabras clave del buscador.

- `Tecnologia.capa` ("", "frontend", "backend") permite que un puesto pida dos
  tecnologías, una por capa (Full Stack). Los datos van en `0011`.
- `Puesto.palabras_clave` solo la usaba el buscador de puestos, que se retiró.

Revertir vuelve a crear `palabras_clave` **vacía**: los sinónimos no se
recuperan. Se acepta porque ya nada los lee; quien los necesite los tiene en
el historial de `datos.py` y de `0007`.
"""

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('catalogos', '0009_niveles_junior_semi_senior_senior'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='puesto',
            name='palabras_clave',
        ),
        migrations.AddField(
            model_name='tecnologia',
            name='capa',
            field=models.CharField(blank=True, choices=[('', 'Sin capa'), ('frontend', 'Frontend'), ('backend', 'Backend')], default='', max_length=10),
        ),
    ]
