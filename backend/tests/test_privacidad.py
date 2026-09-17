from django.contrib.auth import get_user_model
from django.test import TestCase

from entrevistas.services import entrevista as servicio
from entrevistas.services.ia.base import ProveedorIA
from entrevistas.services.ia.schemas import AreaTecnica, Evaluacion, Nivel, Pregunta

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

    def generar_pregunta(self, area, nivel, numero, previas):
        for tema in previas:
            self.textos_recibidos.append(tema.pregunta)
        return Pregunta(texto=f"Pregunta de prueba #{numero}", numero=numero)

    def evaluar_respuesta(self, area, nivel, pregunta, respuesta):
        self.textos_recibidos.append(pregunta)
        self.textos_recibidos.append(respuesta)
        return Evaluacion(puntuacion=70, fortalezas="ok", debilidades="ok", sugerencias="ok")


class PrivacidadTest(TestCase):
    def test_ningun_dato_personal_llega_al_proveedor_de_ia(self):
        usuario = Usuario.objects.create_user(
            email=EMAIL_SENSIBLE,
            password="clave-segura-123",
            nombre_completo=NOMBRE_SENSIBLE,
            carnet=CARNET_SENSIBLE,
        )
        proveedor = ProveedorEspiaIA()

        entrevista = servicio.iniciar(usuario, AreaTecnica.PROGRAMACION, Nivel.BASICO, proveedor=proveedor)
        servicio.responder(entrevista, "Mi respuesta a la primera pregunta", proveedor=proveedor)

        texto_completo = " ".join(proveedor.textos_recibidos)
        self.assertNotIn(NOMBRE_SENSIBLE, texto_completo)
        self.assertNotIn(EMAIL_SENSIBLE, texto_completo)
        self.assertNotIn(CARNET_SENSIBLE, texto_completo)


if __name__ == "__main__":
    import unittest

    unittest.main()
