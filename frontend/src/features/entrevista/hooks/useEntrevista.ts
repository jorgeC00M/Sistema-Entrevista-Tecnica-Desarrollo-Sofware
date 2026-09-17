import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { ErrorAPI } from '@/api/client'
import { obtenerEstado, obtenerResultados, responder } from '@/api/entrevistas'
import type { AutorDeMensaje } from '@/features/entrevista/components/BurbujaPregunta'

export interface MensajeDeChat {
  autor: AutorDeMensaje
  texto: string
}

export function useEntrevista(id: string) {
  const navigate = useNavigate()

  const [mensajes, setMensajes] = useState<MensajeDeChat[]>([])
  const [numeroActual, setNumeroActual] = useState(1)
  const [totalPreguntas, setTotalPreguntas] = useState(0)
  const [cargandoInicial, setCargandoInicial] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')
  const [ultimaRespuesta, setUltimaRespuesta] = useState<string | null>(null)

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

        const previos: MensajeDeChat[] = resultados.intercambios.flatMap((i) => [
          { autor: 'sistema' as const, texto: i.pregunta },
          { autor: 'usuario' as const, texto: i.respuesta },
        ])
        const pendiente: MensajeDeChat[] = estado.pregunta_pendiente
          ? [{ autor: 'sistema', texto: estado.pregunta_pendiente.texto }]
          : []

        setMensajes([...previos, ...pendiente])
        setNumeroActual(estado.pregunta_pendiente?.numero ?? estado.total_preguntas)
        setTotalPreguntas(estado.total_preguntas)
      } catch (err: unknown) {
        if (!cancelado) {
          setError(err instanceof ErrorAPI ? err.message : 'No se pudo cargar la entrevista.')
        }
      } finally {
        if (!cancelado) setCargandoInicial(false)
      }
    }

    void cargar()
    return () => {
      cancelado = true
    }
  }, [id, navigate])

  const enviarRespuesta = useCallback(
    async (texto: string) => {
      setError('')
      setEnviando(true)
      setUltimaRespuesta(texto)
      setMensajes((previos) => [...previos, { autor: 'usuario', texto }])

      try {
        const resultado = await responder(id, texto)

        if (resultado.siguiente_pregunta) {
          const siguiente = resultado.siguiente_pregunta
          setMensajes((previos) => [...previos, { autor: 'sistema', texto: siguiente.texto }])
          setNumeroActual(siguiente.numero)
          setEnviando(false)
        } else {
          navigate(`/entrevista/${id}/resultados`)
        }
      } catch (err: unknown) {
        // La respuesta ya quedó guardada en el servidor (el backend es
        // idempotente ante reintentos): se retira del chat local para no
        // duplicarla visualmente y se ofrece reintentar sin perder lo escrito.
        setMensajes((previos) => previos.slice(0, -1))
        setError(err instanceof ErrorAPI ? err.message : 'No se pudo evaluar tu respuesta.')
        setEnviando(false)
      }
    },
    [id, navigate],
  )

  const reintentar = useCallback(() => {
    if (ultimaRespuesta) void enviarRespuesta(ultimaRespuesta)
  }, [ultimaRespuesta, enviarRespuesta])

  return {
    mensajes,
    numeroActual,
    totalPreguntas,
    cargandoInicial,
    enviando,
    error,
    enviarRespuesta,
    reintentar,
  }
}
