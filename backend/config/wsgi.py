import os

from django.core.wsgi import get_wsgi_application

# Gunicorn (Render) entra por aquí. En local, `manage.py runserver` ya dejó
# DJANGO_SETTINGS_MODULE apuntando a config.settings.local y setdefault no lo pisa.
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.production")

application = get_wsgi_application()
