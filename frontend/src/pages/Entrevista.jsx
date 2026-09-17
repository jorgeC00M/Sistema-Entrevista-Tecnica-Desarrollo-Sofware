import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Cargando from '../components/comunes/Cargando'
import CampoRespuesta from '../components/entrevista/CampoRespuesta'
import IndicadorProgreso from '../components/entrevista/IndicadorProgreso'
import Mensaje from '../components/entrevista/Mensaje'
import { ErrorAPI } from '../api/cliente'
import { obtenerEstado, obtenerResultados, responder } from '../api/entrevistas'

export default function Entrevista() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [mensajes, setMensajes] = useState([])
  const [numeroActual, setNumeroActual] = useState(1)
  const [totalPreguntas, setTotalPreguntas] = useState(5)
  const [cargandoInicial, setCargandoInicial] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')
  const [ultimaRespuesta, setUltimaRespuesta] = useState(null)

  // Reconstruye el chat desde el servidor al montar: si el usuario recarga la
  // página a mitad de la entrevista, se retoma en la pregunta pendiente en
  // vez de perder el progreso (la entrevista sigue EN_PROGRESO en el backend).
  useEffect(() => {
    let cancelado = false

    async function cargar() {
      try {
        const estado = await obtenerEstado(id)

        if (estado.entrevista.estado !== 'en_progreso') {
          navigate(`/entrevista/${id}/resultados`, { replace: true })
          return
        }

        const resultados = await obtenerResultados(id)
        if (cancelado) return

        const previos = resultados.intercambios.flatMap((i) => [
          { autor: 'sistema', texto: i.pregunta },
          { autor: 'usuario', texto: i.respuesta },
        ])
        const pendiente = estado.pregunta_pendiente
          ? [{ autor: 'sistema', texto: estado.pregunta_pendiente.texto }]
          : []

        setMensajes([...previos, ...pendiente])
        setNumeroActual(estado.pregunta_pendiente?.numero ?? estado.total_preguntas)
        setTotalPreguntas(estado.total_preguntas)
      } catch (err) {
        if (!cancelado) {
          setError(err instanceof ErrorAPI ? err.message : 'No se pudo cargar la entrevista.')
        }
      } finally {
        if (!cancelado) setCargandoInicial(false)
      }
    }

    cargar()
    return () => {
      cancelado = true
    }
  }, [id, navigate])

  const manejarEnvio = async (texto) => {
    setError('')
    setEnviando(true)
    setUltimaRespuesta(texto)
    setMensajes((previos) => [...previos, { autor: 'usuario', texto }])

    try {
      const resultado = await responder(id, texto)

      if (resultado.siguiente_pregunta) {
        setMensajes((previos) => [
          ...previos,
          { autor: 'sistema', texto: resultado.siguiente_pregunta.texto },
        ])
        setNumeroActual(resultado.siguiente_pregunta.numero)
        setEnviando(false)
      } else {
        navigate(`/entrevista/${id}/resultados`)
      }
    } catch (err) {
      // La respuesta ya quedó guardada en el servidor (el backend es
      // idempotente ante reintentos): se retira del chat local para no
      // duplicarla visualmente y se ofrece reintentar sin perder lo escrito.
      setMensajes((previos) => previos.slice(0, -1))
      setError(err instanceof ErrorAPI ? err.message : 'No se pudo evaluar tu respuesta.')
      setEnviando(false)
    }
  }

  const reintentar = () => {
    if (ultimaRespuesta) manejarEnvio(ultimaRespuesta)
  }

  if (cargandoInicial) return <Cargando texto="Cargando entrevista…" />

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-2xl flex-col">
      <div className="mb-4">
        <IndicadorProgreso actual={numeroActual} total={totalPreguntas} />
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto rounded-xl bg-slate-100 p-4">
        {mensajes.map((mensaje, indice) => (
          <Mensaje key={indice} autor={mensaje.autor}>
            {mensaje.texto}
          </Mensaje>
        ))}

        {enviando && (
          <div className="flex items-center gap-2 px-2 text-sm text-slate-500">
            <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" />
            <span>Evaluando tu respuesta…</span>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-3 flex items-center justify-between gap-3 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
          <span>{error}</span>
          <button type="button" onClick={reintentar} className="font-medium underline hover:no-underline">
            Reintentar
          </button>
        </div>
      )}

      <CampoRespuesta onEnviar={manejarEnvio} deshabilitado={enviando} />
    </div>
  )
}
