import { Link } from 'react-router-dom'

import IconoNav from '@/components/ui/IconoNav'
import type { EntrevistaEnCurso } from '@/components/layout/useEntrevistaEnCurso'

interface Props {
  entrevista: EntrevistaEnCurso
  plegado: boolean
  onNavegar?: () => void
}

export default function ContinuarEntrevista({ entrevista, plegado, onNavegar }: Props) {
  const resumen = `${entrevista.areaDisplay} · pregunta ${entrevista.numeroActual} de ${entrevista.totalPreguntas}`

  return (
    <Link
      to={`/entrevista/${entrevista.id}`}
      onClick={onNavegar}
      title={plegado ? `Continuar entrevista — ${resumen}` : undefined}
      className={`group flex items-center gap-3 rounded-lg bg-amber-500/10 text-amber-300 ring-1 ring-amber-500/30 transition-colors duration-150 hover:bg-amber-500/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400 ${
        plegado ? 'justify-center p-2.5' : 'px-3 py-2.5'
      }`}
    >
      <span className="flex h-5 w-5 shrink-0 items-center justify-center text-amber-400">
        <IconoNav nombre="play" className="h-4 w-4" />
      </span>
      {!plegado && (
        <span className="min-w-0">
          <span className="block text-sm font-medium text-amber-200">Continuar entrevista</span>
          <span className="block truncate text-xs text-amber-400">{resumen}</span>
        </span>
      )}
    </Link>
  )
}
