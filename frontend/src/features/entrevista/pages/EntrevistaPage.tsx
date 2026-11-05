import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { mensajeDeError } from '@/api/errores'
import { abandonarEntrevista } from '@/api/entrevistas'
import Boton from '@/components/ui/Boton'
import EtiquetaMono from '@/components/ui/EtiquetaMono'
import ModalDeConfirmacion from '@/components/ui/ModalDeConfirmacion'
import Spinner from '@/components/ui/Spinner'
import Tarjeta from '@/components/ui/Tarjeta'
import BarraProgreso from '@/features/entrevista/components/BarraProgreso'
import CampoRespuesta from '@/features/entrevista/components/CampoRespuesta'
import ChatEntrevista from '@/features/entrevista/components/ChatEntrevista'
import RelojDeEntrevista from '@/features/entrevista/components/RelojDeEntrevista'
import { useEntrevista } from '@/features/entrevista/hooks/useEntrevista'

export default function EntrevistaPage() {
  const { id } = useParams<{ id: string }>()
  const {
    mensajes,
    numeroActual,
    totalPreguntas,
    puestoDisplay,
    nivelDisplay,
    desdeConvocatoria,
    cargandoInicial,
    enviando,
    error,
    segundos,
    vencido,
    minutosDeEntrevista,
    enviarRespuesta,
    reintentar,
  } = useEntrevista(id ?? '')
  const navigate = useNavigate()
  const [confirmandoAbandono, setConfirmandoAbandono] = useState(false)
  const [abandonando, setAbandonando] = useState(false)
  const [errorAbandono, setErrorAbandono] = useState('')

  if (cargandoInicial) return <Spinner texto="Cargando entrevista…" />

  // La pregunta en pantalla todavía no se respondió.
  const respondidas = Math.max(numeroActual - 1, 0)

  const abandonar = async () => {
    setErrorAbandono('')
    setAbandonando(true)
    try {
      await abandonarEntrevista(id ?? '')
      // `replace`: "atrás" no debe volver a una entrevista que ya no sigue.
      navigate(`/entrevista/${id}/resultados`, { replace: true })
    } catch (err) {
      setErrorAbandono(mensajeDeError(err, 'No se pudo abandonar la entrevista.'))
      setAbandonando(false)
    }
  }

  const cancelarAbandono = () => {
    setConfirmandoAbandono(false)
    setErrorAbandono('')
  }

  return (
    // `dvh` y no `vh`: en el móvil `100vh` incluye la barra del navegador y
    // dejaba el campo de respuesta debajo del borde visible.
    <div className="flex h-[calc(100dvh-8rem)] max-w-3xl flex-col">
      <Tarjeta className="mb-4 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="truncate font-serif text-headline-sm font-semibold text-vidrio-ink">
              Entrevista · {puestoDisplay}
            </h1>
            <EtiquetaMono tono="suelto">
              Nivel {nivelDisplay}
              {desdeConvocatoria && ' · Basada en tu convocatoria'}
            </EtiquetaMono>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-label-mono text-vidrio-muted uppercase">Pregunta</p>
              <p className="font-mono-vidrio text-metric-counter text-vidrio-ink">
                {String(numeroActual).padStart(2, '0')} / {String(totalPreguntas).padStart(2, '0')}
              </p>
            </div>
            {segundos !== null && <RelojDeEntrevista segundos={segundos} />}
            {/* Deshabilitado mientras se evalúa una respuesta: abandonar a
                mitad de esa llamada dejaría su resultado en el aire. */}
            <Boton
              variante="peligro"
              tamano="sm"
              disabled={enviando}
              onClick={() => setConfirmandoAbandono(true)}
            >
              Abandonar
            </Boton>
          </div>
        </div>

        <div className="mt-3">
          <BarraProgreso actual={numeroActual} total={totalPreguntas} />
        </div>

        {/* La ausencia de notas durante la entrevista es deliberada, y que solo
            la terminada tenga nota también: decirlo antes evita sorpresas. */}
        <p className="mt-3 text-body-sm text-vidrio-muted">
          Tienes {minutosDeEntrevista} minutos para las {totalPreguntas} preguntas. Tu calificación aparece solo si
          terminas la entrevista, como en una entrevista real.
        </p>
      </Tarjeta>

      <ChatEntrevista
        mensajes={mensajes}
        evaluando={enviando}
        esLaUltima={totalPreguntas > 0 && numeroActual === totalPreguntas}
      />

      {error && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-vidrio bg-error-fondo px-4 py-3 text-sm text-error-texto ring-1 ring-error-texto/20">
          <span>{error}</span>
          <Boton variante="texto" tamano="sm" onClick={reintentar}>
            Reintentar
          </Boton>
        </div>
      )}

      <CampoRespuesta onEnviar={enviarRespuesta} deshabilitado={enviando || vencido} />

      {confirmandoAbandono && (
        <ModalDeConfirmacion
          titulo="Abandonar entrevista"
          textoConfirmar="Abandonar"
          cargando={abandonando}
          onCancelar={cancelarAbandono}
          onConfirmar={abandonar}
        >
          {respondidas > 0 ? (
            <p>
              Se cerrará con {respondidas === 1 ? 'la pregunta' : `las ${respondidas} preguntas`} que
              respondiste. No tendrá nota: verás la retroalimentación de lo que respondiste, y no
              podrás retomarla.
            </p>
          ) : (
            <p>No respondiste ninguna pregunta. No tendrá nota y no podrás retomar esta entrevista.</p>
          )}
          {errorAbandono && (
            <p role="alert" className="mt-3 text-error-texto">
              {errorAbandono}
            </p>
          )}
        </ModalDeConfirmacion>
      )}
    </div>
  )
}
