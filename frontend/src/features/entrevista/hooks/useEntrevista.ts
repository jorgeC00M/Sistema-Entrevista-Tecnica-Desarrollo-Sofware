import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { ErrorAPI } from '@/api/client'
import { mensajeDeError } from '@/api/errores'
import { obtenerEstado, obtenerResultados, responder } from '@/api/entrevistas'
import { type MensajeDeChat, reconstruirChat } from '@/features/entrevista/chat'
import { useRelojDeEntrevista } from '@/features/entrevista/hooks/useRelojDeEntrevista'
import { INTERVALO_DE_CONSULTA_MS, queHacerConLaPendiente } from '@/features/entrevista/reanudar'
import { invalidarCache } from '@/hooks/usePeticion'
import { errorDeIA } from '@/lib/erroresDeIA'
import type { PreguntaPendiente } from '@/types/entrevista'

/** Título del fallo que se descubre al volver: el código original ya no se conoce. */
const NO_SE_PUDO_EVALUAR = 'No pudimos evaluar tu respuesta.'

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
  // Un error que no es de la IA (red caída, la carga inicial).
  const [error, setError] = useState('')
  // La respuesta guardada en el servidor está en evaluación: se consulta el
  // estado sin reenviarla, también tras recargar.
  const [esperandoEvaluacion, setEsperandoEvaluacion] = useState(false)
  // La evaluación falló: la respuesta sigue guardada y solo queda reintentar.
  const [fallo, setFallo] = useState<{ titulo: string } | null>(null)
  // Lo que «Reintentar» reenvía. Si ya estaba guardada, el servidor ignora el
  // texto y evalúa la guardada: por eso sirve tomarlo del servidor al recargar.
  const [textoAReintentar, setTextoAReintentar] = useState<string | null>(null)
  const [minutosDeEntrevista, setMinutosDeEntrevista] = useState(0)

  // Toda salida del chat hacia el reporte (finalizar, vencer, 409) cierra la
  // entrevista: el sidebar deja de ofrecer «Continuar».
  const alReporte = useCallback(() => {
    invalidarCache('historial')
    navigate(`/entrevista/${id}/resultados`, { replace: true })
  }, [id, navigate])

  const { segundos, vencido, reanclar } = useRelojDeEntrevista(id, alReporte)

  /**
   * Una pendiente con respuesta guardada no se vuelve a pedir: o se espera su
   * evaluación, o se ofrece reintentarla.
   */
  const aplicarPendienteGuardada = useCallback((pendiente: PreguntaPendiente, ahoraServidor: string) => {
    const accion = queHacerConLaPendiente(pendiente, ahoraServidor)
    if (accion === 'responder') return
    setTextoAReintentar(pendiente.respuesta)
    setEsperandoEvaluacion(accion === 'esperar')
    setFallo(accion === 'fallo' ? { titulo: NO_SE_PUDO_EVALUAR } : null)
  }, [])

  // Reconstruye el chat desde el servidor al montar: si el usuario recarga la
  // página a mitad de la entrevista, se retoma donde iba en vez de perder el
  // progreso (la entrevista sigue EN_PROGRESO en el backend).
  useEffect(() => {
    // Se aborta de verdad al salir o al cambiar de entrevista: antes solo se
    // marcaba, y tras el primer `await` se seguía navegando o invalidando la
    // caché por una entrevista que ya no estaba en pantalla.
    const control = new AbortController()
    const cancelado = () => control.signal.aborted

    async function cargar() {
      try {
        const estado = await obtenerEstado(id, control.signal)
        if (cancelado()) return

        if (estado.entrevista.estado !== 'en_progreso') {
          // Pudo cerrarse al abrirla (venció): que el sidebar no la ofrezca más.
          invalidarCache('historial')
          navigate(`/entrevista/${id}/resultados`, { replace: true })
          return
        }

        const resultados = await obtenerResultados(id, control.signal)
        if (cancelado()) return

        const pendiente = estado.pregunta_pendiente
        setMensajes(reconstruirChat(resultados.intercambios, pendiente))
        setNumeroActual(pendiente?.numero ?? estado.total_preguntas)
        setTotalPreguntas(estado.total_preguntas)
        setPuestoDisplay(estado.entrevista.puesto_display)
        setNivelDisplay(estado.entrevista.nivel_display)
        setDesdeConvocatoria(estado.entrevista.desde_convocatoria)
        setMinutosDeEntrevista(
          Math.round((Date.parse(estado.entrevista.fecha_limite) - Date.parse(estado.entrevista.fecha_inicio)) / 60_000),
        )
        reanclar(estado.entrevista)
        if (pendiente) aplicarPendienteGuardada(pendiente, estado.entrevista.ahora)
      } catch (err: unknown) {
        if (!cancelado()) {
          setError(mensajeDeError(err, 'No se pudo cargar la entrevista.'))
        }
      } finally {
        if (!cancelado()) setCargandoInicial(false)
      }
    }

    void cargar()
    return () => control.abort()
  }, [id, navigate, reanclar, aplicarPendienteGuardada])

  // Mientras se evalúa una respuesta guardada, se mira el estado cada pocos
  // segundos. Nunca se reenvía: la petición original sigue en el servidor.
  useEffect(() => {
    if (!esperandoEvaluacion) return
    const control = new AbortController()
    let temporizador = 0

    const consultar = async () => {
      try {
        const estado = await obtenerEstado(id, control.signal)
        if (control.signal.aborted) return
        reanclar(estado.entrevista)
        const pendiente = estado.pregunta_pendiente
        if (estado.entrevista.estado !== 'en_progreso' || pendiente === null) {
          alReporte()
          return
        }
        if (pendiente.numero !== numeroActual) {
          // Ya se evaluó: aparece la siguiente pregunta, sin que el usuario haga nada.
          setMensajes((previos) => [...previos, { autor: 'sistema', texto: pendiente.texto }])
          setNumeroActual(pendiente.numero)
          setEsperandoEvaluacion(false)
          setTextoAReintentar(null)
          return
        }
        aplicarPendienteGuardada(pendiente, estado.entrevista.ahora)
      } catch {
        // Un tropiezo de red no decide nada: se vuelve a mirar, hasta el plazo.
        if (control.signal.aborted) return
      }
      temporizador = window.setTimeout(consultar, INTERVALO_DE_CONSULTA_MS)
    }

    temporizador = window.setTimeout(consultar, INTERVALO_DE_CONSULTA_MS)
    return () => {
      control.abort()
      window.clearTimeout(temporizador)
    }
  }, [esperandoEvaluacion, id, numeroActual, alReporte, reanclar, aplicarPendienteGuardada])

  // En 0 ya no se acepta otra respuesta. Quien cierra la entrevista es el
  // servidor: pedir el estado la cierra, y se va al reporte. Si justo se está
  // evaluando una respuesta, se espera: llegó a tiempo y cuenta.
  useEffect(() => {
    if (!vencido || enviando || esperandoEvaluacion) return
    const control = new AbortController()
    obtenerEstado(id, control.signal)
      .then((estado) => {
        if (estado.entrevista.estado !== 'en_progreso') alReporte()
      })
      .catch(() => {
        if (!control.signal.aborted) setError('Se acabó el tiempo, pero no pudimos cerrar la entrevista.')
      })
    return () => control.abort()
  }, [vencido, enviando, esperandoEvaluacion, id, alReporte])

  const enviar = useCallback(
    async (texto: string, burbujaYaVisible: boolean) => {
      setError('')
      setFallo(null)
      setEnviando(true)
      setTextoAReintentar(texto)
      if (!burbujaYaVisible) setMensajes((previos) => [...previos, { autor: 'usuario', texto }])

      try {
        const resultado = await responder(id, texto)
        reanclar(resultado.entrevista)

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
          setTextoAReintentar(null)
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
        // La IA falló: la respuesta quedó guardada (se guarda antes de llamar a
        // la IA), así que se queda en el chat y solo queda reintentar.
        const deIA = errorDeIA(err)
        if (deIA) {
          setFallo({ titulo: deIA.titulo })
          setEnviando(false)
          return
        }
        // Otro fallo (red caída, el cliente dejó de esperar): se pregunta al
        // servidor si la respuesta llegó. Si llegó, se espera su evaluación
        // como tras recargar; si no, se retira del chat y se ofrece reenviarla.
        try {
          const estado = await obtenerEstado(id)
          const pendiente = estado.pregunta_pendiente
          if (pendiente && pendiente.respuesta !== '') {
            reanclar(estado.entrevista)
            aplicarPendienteGuardada(pendiente, estado.entrevista.ahora)
            setEnviando(false)
            return
          }
        } catch {
          // Tampoco hay servidor: se trata como no recibida.
        }
        setMensajes((previos) => previos.slice(0, -1))
        setError(mensajeDeError(err, 'No se pudo enviar tu respuesta.'))
        setEnviando(false)
      }
    },
    [id, alReporte, reanclar, aplicarPendienteGuardada],
  )

  const enviarRespuesta = useCallback((texto: string) => enviar(texto, false), [enviar])

  // Tras un fallo de la IA la respuesta ya está en pantalla y en el servidor;
  // tras un fallo de red se retiró del chat y vuelve a pintarse al reenviarla.
  const reintentar = useCallback(() => {
    if (textoAReintentar !== null) void enviar(textoAReintentar, fallo !== null)
  }, [textoAReintentar, fallo, enviar])

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
    /** La respuesta guardada se está evaluando: el chat solo mira. */
    esperandoEvaluacion,
    /** La evaluación falló; la respuesta sigue guardada. */
    fallo,
    /** Si hay algo que reenviar con «Reintentar». */
    puedeReintentar: textoAReintentar !== null,
    /** Segundos que quedan; `null` hasta cargar. */
    segundos,
    vencido,
    /** La duración total, del servidor: el texto bajo la cabecera la nombra. */
    minutosDeEntrevista,
    enviarRespuesta,
    reintentar,
  }
}
