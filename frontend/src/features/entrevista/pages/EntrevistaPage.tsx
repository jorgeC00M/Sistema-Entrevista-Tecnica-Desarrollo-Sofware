import { useParams } from 'react-router-dom'

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
    cargandoInicial,
    enviando,
    error,
    enviarRespuesta,
    reintentar,
  } = useEntrevista(id ?? '')

  if (cargandoInicial) return <Spinner texto="Cargando entrevista…" />

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-2xl flex-col">
      <div className="mb-4">
        <BarraProgreso actual={numeroActual} total={totalPreguntas} />
      </div>

      <ChatEntrevista mensajes={mensajes} evaluando={enviando} />

      {error && (
        <div className="mt-3 flex items-center justify-between gap-3 rounded-control bg-error-fondo px-4 py-3 text-sm text-error-texto ring-1 ring-error-texto/20">
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
