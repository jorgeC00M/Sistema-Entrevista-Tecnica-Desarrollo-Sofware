import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { mensajeDeError } from '@/api/errores'
import { abandonarEntrevista } from '@/api/entrevistas'
import Alerta from '@/components/ui/Alerta'
import AlertaDeIA from '@/components/ui/AlertaDeIA'
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
import { invalidarCache } from '@/hooks/usePeticion'

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
    esperandoEvaluacion,
    fallo,
    puedeReintentar,
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

  // La pregunta en pantalla todavía no se respondió, salvo que su respuesta
  // ya esté guardada (en evaluación o con la evaluación fallida).
  const respuestaGuardada = esperandoEvaluacion || fallo !== null
  const respondidas = Math.max(numeroActual - (respuestaGuardada ? 0 : 1), 0)
  // Mientras la IA trabaja nada se puede enviar ni abandonar: abandonar a
  // mitad de esa llamada dejaría su resultado en el aire.
  const ocupado = enviando || esperandoEvaluacion

  const abandonar = async () => {
    setErrorAbandono('')
    setAbandonando(true)
    try {
      await abandonarEntrevista(id ?? '')
      // Ya no hay nada que continuar: el sidebar se entera.
      invalidarCache('historial')
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
            <Boton
              variante="peligro"
              tamano="sm"
              disabled={ocupado}
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
        evaluando={ocupado}
        esLaUltima={totalPreguntas > 0 && numeroActual === totalPreguntas}
      />

      {fallo && (
        <div className="mt-3">
          <AlertaDeIA
            titulo={fallo.titulo}
            detalle="Tu respuesta está guardada; no la pierdes."
            accion={{ texto: 'Reintentar', onClick: reintentar, deshabilitada: enviando }}
          />
        </div>
      )}

      {error && (
        <div className="mt-3">
          <Alerta>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span>{error}</span>
              {puedeReintentar && (
                <Boton variante="texto" tamano="sm" onClick={reintentar}>
                  Reintentar
                </Boton>
              )}
            </div>
          </Alerta>
        </div>
      )}

      {/* Con la respuesta guardada no se escribe otra: se espera o se reintenta. */}
      <CampoRespuesta onEnviar={enviarRespuesta} deshabilitado={ocupado || vencido || respuestaGuardada} />

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
