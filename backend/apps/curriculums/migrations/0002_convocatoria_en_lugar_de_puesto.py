"""La referencia del análisis pasa de un puesto a una convocatoria real.

El puesto no afectaba a nada: `ats.analizar()` no lo recibía y elegir backend,
frontend o full-stack producía un resultado idéntico. Se elimina, y entra la
convocatoria que el usuario aporta, que sí es verificable.

Las filas existentes sobreviven al cambio de esquema: pierden qué puesto se había
elegido, que es precisamente el dato que no afectaba a nada. Lo que sí se elimina
son las filas que **solo** se distinguían por el puesto, porque sin él son
duplicados; ver `_deduplicar`.

La restricción de unicidad nueva se crea en la `0003` y no aquí, por una
limitación de Postgres que se explica junto a las operaciones.

**No es reversible, y conviene decirlo en vez de aparentarlo.** Revertirla repone
`puesto_id` como columna no nula y las filas existentes no tienen valor que poner;
no hay ninguno razonable, porque un puesto inventado sería peor que el hueco.
Eliminar una columna sin un valor con el que rellenarla es una operación de ida.
Lo que sí se puede revertir es la `0003`, que solo crea un índice.
"""

from django.db import migrations, models


def _deduplicar(apps, schema_editor):
    """Quita las filas que la restricción nueva ya no admite, dejando la reciente.

    Antes se podía analizar el mismo CV para varios puestos y eran filas
    distintas, porque el puesto formaba parte de la clave. Sin él, esas filas
    colisionan en `(usuario, hash_texto, hash_convocatoria)` y `AddConstraint`
    fallaría con un error de índice único — en una base real, no en los tests.

    Conservar la más reciente no pierde nada: el puesto no afectaba al análisis
    (es la premisa de este cambio), así que las filas duplicadas contienen el
    mismo diagnóstico del mismo documento.
    """
    Curriculum = apps.get_model("curriculums", "Curriculum")

    vistos: set[tuple[int, str]] = set()
    sobrantes: list[int] = []
    # De más reciente a más antigua: la primera de cada grupo es la que se queda.
    for curriculum in Curriculum.objects.order_by("-fecha", "-id").iterator():
        clave = (curriculum.usuario_id, curriculum.hash_texto)
        if clave in vistos:
            sobrantes.append(curriculum.pk)
        else:
            vistos.add(clave)

    if sobrantes:
        # El análisis cuelga del currículum con CASCADE, así que se va con él.
        Curriculum.objects.filter(pk__in=sobrantes).delete()


def _sin_reverso(apps, schema_editor):
    """Revertir el esquema no puede resucitar las filas eliminadas.

    Se declara explícitamente en lugar de dejar la migración irreversible: lo que
    sí debe poder revertirse es la estructura, y que los duplicados no vuelvan es
    una consecuencia asumida, no un descuido.
    """


class Migration(migrations.Migration):
    dependencies = [
        ("catalogos", "0003_puesto_tecnologia"),
        ("curriculums", "0001_initial"),
    ]

    # El orden de estas operaciones no es cosmético y conviene no reordenarlo.
    #
    # Para eliminar una clave foránea, Django emite `SET CONSTRAINTS ... IMMEDIATE`
    # antes del `DROP CONSTRAINT`, y eso deja a la tabla con eventos de trigger
    # pendientes en Postgres. A partir de ahí, cualquier `ALTER TABLE` o
    # `CREATE INDEX` sobre esa misma tabla en la misma transacción falla con "no se
    # puede hacer CREATE INDEX porque tiene eventos de trigger pendientes".
    #
    # Por eso las columnas nuevas se añaden **antes** de quitar `puesto`, y el
    # `DELETE` de la deduplicación va al final: DDL después de DML sobre la misma
    # tabla tiene el mismo problema.
    operations = [
        migrations.AddField(
            model_name="curriculum",
            name="convocatoria",
            field=models.TextField(blank=True, default=""),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name="curriculum",
            name="hash_convocatoria",
            field=models.CharField(default="", max_length=64),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name="analisisats",
            name="brecha",
            field=models.JSONField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="analisisats",
            name="inventario",
            field=models.JSONField(default=list),
        ),
        migrations.AddField(
            model_name="analisisats",
            name="vinetas",
            field=models.JSONField(blank=True, null=True),
        ),
        # La restricción antigua incluye `puesto`, así que hay que soltarla antes
        # de poder eliminar la columna.
        migrations.RemoveConstraint(
            model_name="curriculum",
            name="curriculum_unico_por_usuario_puesto_y_texto",
        ),
        migrations.RemoveField(model_name="curriculum", name="puesto"),
        # Con el puesto ya fuera, las filas que lo usaban para diferenciarse han
        # quedado duplicadas. La restricción que las rechaza se crea en la 0003,
        # no aquí: Postgres no admite un ALTER TABLE después de un DELETE sobre la
        # misma tabla dentro de la misma transacción, y una migración es la unidad
        # de atomicidad. Separar el dato del esquema es además la práctica
        # recomendada por este motivo exacto.
        migrations.RunPython(_deduplicar, _sin_reverso),
    ]
