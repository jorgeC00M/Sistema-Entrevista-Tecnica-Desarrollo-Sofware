"""Mide qué tan estable es la nota del evaluador (test–retest).

    python manage.py medir_consistencia --repeticiones 3
    python manage.py medir_consistencia --repeticiones 3 --proveedor gemini

Cada caso de `apps/evaluaciones/consistencia/casos.json` se evalúa K veces con
el proveedor configurado. Se informa la media y la desviación estándar de la
nota y el porcentaje de repeticiones que caen en la misma banda. No escribe
nada en la base de datos. Cuesta K × 8 llamadas al proveedor.
"""

from __future__ import annotations

import statistics

from django.core.management.base import BaseCommand, CommandError

from integrations.ia.factory import get_proveedor

from ...consistencia.medicion import REPETICIONES_MINIMAS, medir


class Command(BaseCommand):
    help = "Evalúa K veces un conjunto fijo de respuestas y mide la variación de la nota."

    def add_arguments(self, parser):
        parser.add_argument("--repeticiones", type=int, default=3, help="Veces que se evalúa cada caso (mínimo 2).")
        parser.add_argument(
            "--proveedor", default=None, help="fake | gemini | anthropic. Por defecto, IA_PROVEEDOR."
        )

    def handle(self, *args, repeticiones, proveedor, **opciones):
        if repeticiones < REPETICIONES_MINIMAS:
            raise CommandError(
                f"Se necesitan al menos {REPETICIONES_MINIMAS} repeticiones para medir variación."
            )

        motor = get_proveedor(proveedor)
        self.stdout.write(f"Proveedor: {motor.nombre} ({motor.modelo}) · {repeticiones} repeticiones por caso\n")

        resultados = medir(motor, repeticiones)

        for r in resultados:
            if not r.notas:
                self.stdout.write(f"{r.caso.id:32} sin notas ({r.fallos} fallos del proveedor)")
                continue
            self.stdout.write(
                f"{r.caso.id:32} notas={list(r.notas)} media={r.media:.1f} "
                f"desv={r.desviacion:.2f} banda={r.banda_modal} ({r.coincidencia_de_banda:.0%}) "
                f"esperada={r.caso.banda_esperada}"
                + (f" fallos={r.fallos}" if r.fallos else "")
            )

        medidos = [r for r in resultados if len(r.notas) >= 2]
        if not medidos:
            self.stdout.write(self.style.WARNING("\nNingún caso obtuvo dos notas: no hay variación que medir."))
            return

        desviacion_media = statistics.fmean(r.desviacion for r in medidos)
        coincidencia_media = statistics.fmean(r.coincidencia_de_banda for r in medidos)
        acierto = sum(r.banda_modal == r.caso.banda_esperada for r in medidos) / len(medidos)
        self.stdout.write(
            "\nResumen: "
            f"desviación estándar media={desviacion_media:.2f} puntos · "
            f"misma banda en el {coincidencia_media:.0%} de las repeticiones · "
            f"banda modal = banda esperada en {acierto:.0%} de los casos"
        )
