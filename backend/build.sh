#!/usr/bin/env bash
# Build command de Render. Configurar en el panel del servicio como:
#   ./build.sh
# y el start command como:
#   gunicorn config.wsgi:application --workers 2 --threads 8 --timeout 120
#
# Por qué esas opciones: sin ellas gunicorn levanta 1 worker `sync`, que
# atiende una petición a la vez y la corta a los 30 s. Responder una pregunta
# espera a la IA 10-40 s, así que con 2 o 3 usuarios uno esperaba al otro y una
# evaluación lenta quedaba a medias. El trabajo es casi todo esperar a la red:
# hilos (2 x 8 = 16 peticiones a la vez) bastan y caben en 512 MB. El timeout
# de 120 s queda por encima de los 90 s que el cliente espera al responder.
#
# `set -o errexit` es lo que hace que un despliegue con migraciones rotas
# falle en el build en lugar de levantar una app a medio migrar.
set -o errexit

pip install --upgrade pip
pip install -r requirements/production.txt

python manage.py collectstatic --no-input
python manage.py migrate
# La tabla de la caché en BD (production.py): ahí cuentan los límites de
# peticiones, compartidos entre workers. Es idempotente.
python manage.py createcachetable
