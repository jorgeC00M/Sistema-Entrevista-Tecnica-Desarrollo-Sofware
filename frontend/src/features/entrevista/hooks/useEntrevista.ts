import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { ErrorAPI } from '@/api/client'
import { mensajeDeError } from '@/api/errores'
import { obtenerEstado, obtenerResultados, responder } from '@/api/entrevistas'
import type { AutorDeMensaje } from '@/features/entrevista/components/BurbujaPregunta'
import { desfaseDelReloj, segundosRestantes } from '@/features/entrevista/tiempo'
import { invalidarCache } from '@/hooks/usePeticion'

export interface MensajeDeChat {
  autor: AutorDeMensaje
  texto: string
}

export function useEntrevista(id: string) {
  const navigate = useNavigate()

  const [mensajes, setMensajes] = useState<MensajeDeChat[]>([])
  const [numeroActual, setNumeroActual] = useState(1)
  const [totalPreguntas, setTotalPreguntas] = useState(0)
  const [puestoDisplay, setPuestoDisplay] = useState('')
  const [nivelDisplay, setNivelDisplay] = useState('')
  const [desdeConvocatoria, setDesdeConvocatoria] = useState(false)
  const [cargandoInicial, setCargandoInicial] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')
  const [ultimaRespuesta, setUltimaRespuesta] = useState<string | null>(null)
  // El reloj: el límite lo fija el servidor y el desfase corrige el reloj del
  // dispositivo. `segundos` es `null` hasta cargar.
  const [fechaLimite, setFechaLimite] = useState<string | null>(null)
  const [desfaseMs, setDesfaseMs] = useState(0)
  const [segundos, setSegundos] = useState<number | null>(null)
  const [minutosDeEntrevista, setMinutosDeEntrevista] = useState(0)

  // Toda salida del chat hacia el reporte (finalizar, vencer, 409) cierra la
  // entrevista: el sidebar deja de ofrecer «Continuar».
  const alReporte = useCallback(() => {
    invalidarCache('historial')
    navigate(`/entrevista/${id}/resultados`, { replace: true })
  }, [id, navigate])

  // Reconstruye el chat desde el servidor al montar: si el usuario recarga la
  // página a mitad de la entrevista, se retoma en la pregunta pendiente en
  // vez de perder el progreso (la entrevista sigue EN_PROGRESO en el backend).
  useEffect(() => {
    let cancelado = false

    async function cargar() {
      try {
        const estado = await obtenerEstado(id)

        if (estado.entrevista.estado !== 'en_progreso') {
          // Pudo cerrarse al abrirla (venció): que el sidebar no la ofrezca más.
          invalidarCache('historial')
          navigate(`/entrevista/${id}/resultados`, { replace: true })
          return
        }

        const resultados = await obtenerResultados(id)
        if (cancelado) return

        // Solo los turnos ya respondidos: el endpoint de resultados devuelve
        // también los intercambios pendientes (con la respuesta vacía), y el
        // que toca ahora lo aporta `estado.pregunta_pendiente` justo debajo.
        // Sin este filtro la pregunta en curso se pintaría dos veces, con una
        // burbuja de usuario vacía en medio.
        //
        // El criterio es la respuesta y no la evaluación: durante la entrevista
        // la API ya no publica calificaciones, así que filtrar por evaluación
        // dejaría el historial entero fuera.
        const previos: MensajeDeChat[] = resultados.intercambios
          .filter((i) => i.respuesta !== '')
          .flatMap((i) => [
            { autor: 'sistema' as const, texto: i.pregunta },
            { autor: 'usuario' as const, texto: i.respuesta },
          ])
        const pendiente: MensajeDeChat[] = estado.pregunta_pendiente
          ? [{ autor: 'sistema', texto: estado.pregunta_pendiente.texto }]
          : []

        setMensajes([...previos, ...pendiente])
        setNumeroActual(estado.pregunta_pendiente?.numero ?? estado.total_preguntas)
        setTotalPreguntas(estado.total_preguntas)
        setPuestoDisplay(estado.entrevista.puesto_display)
        setNivelDisplay(estado.entrevista.nivel_display)
        setDesdeConvocatoria(estado.entrevista.desde_convocatoria)
        setFechaLimite(estado.entrevista.fecha_limite)
        setMinutosDeEntrevista(
          Math.round((Date.parse(estado.entrevista.fecha_limite) - Date.parse(estado.entrevista.fecha_inicio)) / 60_000),
        )
        setDesfaseMs(desfaseDelReloj(estado.entrevista.ahora, Date.now()))
      } catch (err: unknown) {
        if (!cancelado) {
          setError(mensajeDeError(err, 'No se pudo cargar la entrevista.'))
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

  // Cuenta cada segundo. El instante se toma en el intervalo, no en el render.
  useEffect(() => {
    if (fechaLimite === null) return
    const contar = () => setSegundos(segundosRestantes(fechaLimite, desfaseMs, Date.now()))
    contar()
    const intervalo = window.setInterval(contar, 1000)
    return () => window.clearInterval(intervalo)
  }, [fechaLimite, desfaseMs])

  // En 0 ya no se acepta otra respuesta. Quien cierra la entrevista es el
  // servidor: pedir el estado la cierra, y se va al reporte. Si justo se está
  // evaluando una respuesta, se espera: llegó a tiempo y cuenta.
  const vencido = segundos === 0
  useEffect(() => {
    if (!vencido || enviando) return
    const control = new AbortController()
    obtenerEstado(id, control.signal)
      .then((estado) => {
        if (estado.entrevista.estado !== 'en_progreso') alReporte()
      })
      .catch(() => {
        if (!control.signal.aborted) setError('Se acabó el tiempo, pero no pudimos cerrar la entrevista.')
      })
    return () => control.abort()
  }, [vencido, enviando, id, alReporte])

  const enviarRespuesta = useCallback(
    async (texto: string) => {
      setError('')
      setEnviando(true)
      setUltimaRespuesta(texto)
      setMensajes((previos) => [...previos, { autor: 'usuario', texto }])

      try {
        const resultado = await responder(id, texto)
        setDesfaseMs(desfaseDelReloj(resultado.entrevista.ahora, Date.now()))

        // No se pinta ninguna calificación: la respuesta se evalúa en el
        // servidor —es lo que calibra la exigencia de las preguntas
        // siguientes— pero la nota y la retroalimentación solo se muestran al
        // terminar, en el módulo de resultados. Un entrevistador real tampoco
        // canta el puntaje a mitad de la sesión.
        //
        // Sin siguiente pregunta, la entrevista terminó: finalizada, o cerrada
        // porque el límite venció mientras se evaluaba una respuesta que llegó
        // a tiempo. En los dos casos, al reporte.
        if (resultado.siguiente_pregunta) {
          const siguiente = resultado.siguiente_pregunta
          setMensajes((previos) => [...previos, { autor: 'sistema', texto: siguiente.texto }])
          setNumeroActual(siguiente.numero)
          setEnviando(false)
        } else {
          alReporte()
        }
      } catch (err: unknown) {
        // 409: la entrevista ya no sigue (se acabó el tiempo o se cerró en
        // otra pestaña). No hay nada que reintentar: al reporte.
        if (err instanceof ErrorAPI && err.status === 409) {
          alReporte()
          return
        }
        // La respuesta ya quedó guardada en el servidor (el backend es
        // idempotente ante reintentos): se retira del chat local para no
        // duplicarla visualmente y se ofrece reintentar sin perder lo escrito.
        setMensajes((previos) => previos.slice(0, -1))
        setError(mensajeDeError(err, 'No se pudo evaluar tu respuesta.'))
        setEnviando(false)
      }
    },
    [id, alReporte],
  )

  const reintentar = useCallback(() => {
    if (ultimaRespuesta) void enviarRespuesta(ultimaRespuesta)
  }, [ultimaRespuesta, enviarRespuesta])

  return {
    mensajes,
    numeroActual,
    totalPreguntas,
    puestoDisplay,
    nivelDisplay,
    desdeConvocatoria,
    cargandoInicial,
    enviando,
    error,
    /** Segundos que quedan; `null` hasta cargar. */
    segundos,
    vencido,
    /** La duración total, del servidor: el texto bajo la cabecera la nombra. */
    minutosDeEntrevista,
    enviarRespuesta,
    reintentar,
  }
}
