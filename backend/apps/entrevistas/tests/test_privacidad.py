from django.contrib.auth import get_user_model
from django.test import TestCase

from apps.entrevistas import services as servicio
from tests.conftest import nivel_de, puesto_de
from integrations.ia.base import ProveedorIA
from integrations.ia.prompts.schemas import Evaluacion, Niveles, Pregunta

Usuario = get_user_model()

# Datos identificatorios de la usuaria de prueba: no deben aparecer en ningún
# texto enviado al proveedor de IA bajo ninguna circunstancia.
NOMBRE_SENSIBLE = "Egresada Con Datos Sensibles"
EMAIL_SENSIBLE = "egresada.sensible@example.com"
CARNET_SENSIBLE = "9876543"


class ProveedorEspiaIA(ProveedorIA):
    """Registra cada texto que recibe, para auditar qué sale realmente hacia
    un proveedor externo."""

    nombre = "espia"
    modelo = "espia-1"

    def __init__(self):
        self.textos_recibidos: list[str] = []

    def generar_preguntas_iniciales(self, contexto, areas):
        return [
            Pregunta(texto=f"Pregunta de prueba #{numero}", numero=numero)
            for numero, _ in enumerate(areas, start=1)
        ]

    def generar_pregunta(self, contexto, area, numero, previas):
        for tema in previas:
            self.textos_recibidos.append(tema.pregunta)
        return Pregunta(texto=f"Pregunta de prueba #{numero}", numero=numero)

    def evaluar_respuesta(self, contexto, area, pregunta, respuesta):
        self.textos_recibidos.append(pregunta)
        self.textos_recibidos.append(respuesta)
        return Evaluacion(
            niveles=Niveles(correccion=3, completitud=2, claridad=3),
            fortalezas="ok",
            debilidades="ok",
            sugerencias="ok",
            puntos_clave=("Primer punto", "Segundo punto"),
        )


class PrivacidadTest(TestCase):
    def test_ningun_dato_personal_llega_al_proveedor_de_ia(self):
        usuario = Usuario.objects.create_user(
            email=EMAIL_SENSIBLE,
            password="clave-segura-123",
            nombre_completo=NOMBRE_SENSIBLE,
            carnet=CARNET_SENSIBLE,
        )
        proveedor = ProveedorEspiaIA()

        entrevista = servicio.iniciar(usuario, puesto_de("backend"), nivel_de("junior"), proveedor=proveedor)
        servicio.responder(entrevista, "Mi respuesta a la primera pregunta", proveedor=proveedor)

        texto_completo = " ".join(proveedor.textos_recibidos)
        self.assertNotIn(NOMBRE_SENSIBLE, texto_completo)
        self.assertNotIn(EMAIL_SENSIBLE, texto_completo)
        self.assertNotIn(CARNET_SENSIBLE, texto_completo)


if __name__ == "__main__":
    import unittest

    unittest.main()
