import { useParams } from 'react-router-dom'

import Cronometro from '@/components/ui/Cronometro'
import EtiquetaMono from '@/components/ui/EtiquetaMono'
import Spinner from '@/components/ui/Spinner'
import BarraProgreso from '@/features/entrevista/components/BarraProgreso'
import CampoRespuesta from '@/features/entrevista/components/CampoRespuesta'
import ChatEntrevista from '@/features/entrevista/components/ChatEntrevista'
import { useEntrevista } from '@/features/entrevista/hooks/useEntrevista'

export default function EntrevistaPage() {
  const { id } = useParams<{ id: string }>()
  const {
    mensajes,
    numeroActual,
    totalPreguntas,
    areaDisplay,
    nivelDisplay,
    cargandoInicial,
    enviando,
    error,
    enviarRespuesta,
    reintentar,
  } = useEntrevista(id ?? '')

  if (cargandoInicial) return <Spinner texto="Cargando entrevista…" tono="vidrio" />

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-2xl flex-col">
      <div className="mb-4 rounded-vidrio border border-vidrio-borde bg-vidrio-card p-4 backdrop-blur-[18px]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="truncate font-serif text-headline-sm font-semibold text-vidrio-ink">
              Entrevista · {areaDisplay}
            </h1>
            <EtiquetaMono tono="suelto">Nivel {nivelDisplay}</EtiquetaMono>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-label-mono text-vidrio-muted uppercase">Pregunta</p>
              <p className="font-mono-vidrio text-metric-counter text-vidrio-ink">
                {String(numeroActual).padStart(2, '0')} / {String(totalPreguntas).padStart(2, '0')}
              </p>
            </div>
            <Cronometro />
          </div>
        </div>

        <div className="mt-3">
          <BarraProgreso actual={numeroActual} total={totalPreguntas} />
        </div>
      </div>

      <ChatEntrevista mensajes={mensajes} evaluando={enviando} />

      {error && (
        <div className="mt-3 flex items-center justify-between gap-3 rounded-vidrio bg-error-fondo px-4 py-3 text-sm text-error-texto ring-1 ring-error-texto/20">
          <span>{error}</span>
          <button
            type="button"
            onClick={reintentar}
            className="font-medium underline hover:no-underline"
          >
            Reintentar
          </button>
        </div>
      )}

      <CampoRespuesta onEnviar={enviarRespuesta} deshabilitado={enviando} />
    </div>
  )
}
