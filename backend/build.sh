#!/usr/bin/env bash
# Build command de Render. Configurar en el panel del servicio como:
#   ./build.sh
# y el start command como:
#   gunicorn config.wsgi:application
#
# `set -o errexit` es lo que hace que un despliegue con migraciones rotas
# falle en el build en lugar de levantar una app a medio migrar.
set -o errexit

pip install --upgrade pip
pip install -r requirements/production.txt

python manage.py collectstatic --no-input
python manage.py migrate
