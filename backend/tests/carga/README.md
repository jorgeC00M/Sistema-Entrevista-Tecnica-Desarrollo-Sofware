# Prueba de carga

Mide cuántos estudiantes pueden hacer una entrevista a la vez sin que nadie espere de más. Usa el proveedor falso (`IA_PROVEEDOR=fake`) con una **latencia artificial**, así que reproduce lo que tarda la IA real sin gastar cuota.

`locustfile.py` simula a cada estudiante:
1. se registra;
2. inicia una entrevista de Backend · Django · Junior;
3. mira el detalle y responde las 5 preguntas, con 2 a 5 s de pausa entre una y otra;
4. abre su historial.

## Preparar

```bash
pip install -r requirements/local.txt      # trae locust
python manage.py migrate                   # contra una base de prueba, no la de producción
```

**Gunicorn no corre en Windows.** Usa WSL (Ubuntu) o una máquina Linux para levantar el servidor. Locust sí corre en Windows.

## Levantar el servidor

Una respuesta hace **dos** llamadas a la IA (evaluar y generar la siguiente pregunta). Con `IA_FAKE_LATENCIA_MS=12000`, cada respuesta tarda unos 25 s, como con la IA real.

```bash
export DJANGO_SETTINGS_MODULE=config.settings.carga   # sube los límites de peticiones; solo para esto
export IA_PROVEEDOR=fake
export IA_FAKE_LATENCIA_MS=12000

# Configuración de este cambio:
gunicorn config.wsgi:application --workers 2 --threads 8 --timeout 120 --bind 0.0.0.0:8000

# Para comparar con la configuración anterior (1 worker sync, corta a los 30 s):
gunicorn config.wsgi:application --bind 0.0.0.0:8000
```

## Correr la carga

En otra terminal, sin interfaz web, con 25, 50 y 100 usuarios que van llegando de a 2 por segundo durante 5 minutos:

```bash
locust -f tests/carga/locustfile.py --host http://127.0.0.1:8000 --headless -u 25  -r 2 -t 5m --csv resultados-25
locust -f tests/carga/locustfile.py --host http://127.0.0.1:8000 --headless -u 50  -r 2 -t 5m --csv resultados-50
locust -f tests/carga/locustfile.py --host http://127.0.0.1:8000 --headless -u 100 -r 2 -t 5m --csv resultados-100
```

Sin `--headless`, Locust abre http://localhost:8089 con gráficas en vivo.

## Cómo leer el resultado

En `resultados-N_stats.csv`, mira la fila **`responder`**:
- **Mediana (p50):** lo normal es unos 25 s (la latencia simulada). Si sube mucho, hay peticiones esperando un hilo libre.
- **p95:** si pasa de 90 s, el navegador habría dejado de esperar.
- **Fallos (`Failure Count`):** deberían ser 0. Un 502 o 504 suele ser el `--timeout` del servidor; un 503, la IA, que aquí no falla.

En la fila **`iniciar`**, el p95 muestra qué pasa cuando muchos empiezan a la vez.

Para la tesis, anota por cada N la mediana, el p95 y los fallos de `responder`, con las dos configuraciones.

## Lo que esta prueba no mide

- **La cuota por minuto del proveedor real**, que con 100 usuarios suele ser el límite verdadero: unas 40 llamadas por minuto.
- **El plan gratuito de Render** (0,1 de CPU y la instancia que se duerme). Correr contra Render exigiría desplegar `config.settings.carga`, y no se hace.
