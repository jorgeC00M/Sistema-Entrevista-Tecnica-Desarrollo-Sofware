"""Prueba de carga: estudiantes que hacen una entrevista completa a la vez.

Cada usuario simulado se registra, inicia una entrevista de Backend, responde
las 5 preguntas con una pausa de lectura y escritura, y abre su historial.
Mientras tanto mira el detalle como lo haría el chat. Se corre contra el
servidor con el proveedor falso y una latencia artificial, así mide la
capacidad del servidor sin gastar cuota de IA. Ver `README.md`.

No es un test de Django: `manage.py test` no lo descubre (el archivo no se llama
`test*.py`).
"""

import uuid

from locust import HttpUser, between, task

PREGUNTAS = 5
RESPUESTA = (
    "Usaría un índice compuesto sobre las columnas del filtro y revisaría el plan "
    "de ejecución con EXPLAIN antes y después para comprobar la mejora."
)


class Estudiante(HttpUser):
    # Lo que tarda una persona en leer la pregunta y escribir la respuesta.
    wait_time = between(2, 5)

    def on_start(self):
        email = f"carga-{uuid.uuid4().hex[:12]}@example.com"
        respuesta = self.client.post(
            "/api/auth/registro",
            json={"email": email, "password": "clave-de-carga-123", "nombre_completo": "Usuario de carga"},
            name="registro",
        )
        respuesta.raise_for_status()
        self.client.headers["Authorization"] = f"Bearer {respuesta.json()['access']}"

    @task
    def entrevista_completa(self):
        inicio = self.client.post(
            "/api/entrevistas/",
            json={
                "puesto": "backend",
                "nivel": "junior",
                "tecnologia": "backend_django",
                # Si la anterior quedó a medias, se abandona: hay una en curso por usuario.
                "abandonar_en_curso": True,
            },
            name="iniciar",
        )
        if inicio.status_code != 201:
            return
        entrevista = inicio.json()["entrevista"]["id"]

        for _ in range(PREGUNTAS):
            self.client.get(f"/api/entrevistas/{entrevista}/", name="detalle")
            self.wait()
            respuesta = self.client.post(
                f"/api/entrevistas/{entrevista}/responder/",
                json={"respuesta": RESPUESTA},
                name="responder",
            )
            if respuesta.status_code != 200 or respuesta.json().get("siguiente_pregunta") is None:
                break

        self.client.get("/api/entrevistas/", name="historial")
