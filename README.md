# Sistema-Entrevista-Tecnica-Desarrollo-Sofware
## Base de datos
- PostgreSQL gestionado con Neon (serverless).
- Conexión vía DATABASE_URL en variable de entorno (.env, nunca en el código).
- Usar dj-database-url + psycopg2-binary en settings.py.
- Recordar sslmode=require en el connection string.