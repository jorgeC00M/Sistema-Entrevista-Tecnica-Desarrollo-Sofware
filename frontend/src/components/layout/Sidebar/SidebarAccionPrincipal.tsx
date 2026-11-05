import { NavLink } from 'react-router-dom'

import Icono from '@/components/ui/Icono'
import Tooltip from '@/components/ui/Tooltip'
import type { EntrevistaEnCurso } from '@/components/layout/useEntrevistaEnCurso'
import { etiquetaDeContinuar, minutosRestantes, tramoDelReloj } from '@/features/entrevista/tiempo'

interface Props {
  plegado: boolean
  entrevistaEnCurso: EntrevistaEnCurso | null
}

export default function SidebarAccionPrincipal({ plegado, entrevistaEnCurso }: Props) {
  const botonSimularEntrevista = (
    <NavLink
      to="/simular-entrevista"
      title={plegado ? 'Simular entrevista' : undefined}
      className={`flex items-center justify-center gap-2 rounded-full text-sm font-medium foco-claro transition-colors duration-150 ${
        plegado ? 'p-3.5' : 'px-3 py-2.5'
      } ${
        entrevistaEnCurso
          ? 'border border-white/20 text-vidrio-sidebar-muted hover:bg-white/10 hover:text-white'
          : 'bg-white text-vidrio-ink shadow-sm hover:bg-vidrio-bg'
      }`}
    >
      <Icono nombre="mas" className="h-4 w-4" />
      {!plegado && 'Simular entrevista'}
    </NavLink>
  )

  // En los últimos 5 minutos, el mismo ámbar que el reloj del chat.
  const avisa = entrevistaEnCurso !== null && tramoDelReloj(entrevistaEnCurso.segundosRestantes) !== 'normal'

  return (
    <div className="flex flex-col gap-2">
      {entrevistaEnCurso && (
        <NavLink
          to={`/entrevista/${entrevistaEnCurso.id}`}
          title={
            plegado
              ? `Continuar entrevista — ${entrevistaEnCurso.puestoDisplay} · quedan ${minutosRestantes(entrevistaEnCurso.segundosRestantes)} min`
              : undefined
          }
          className={`flex items-center gap-2 rounded-full text-sm font-medium shadow-sm transition-colors duration-150 foco-claro ${
            plegado ? 'justify-center p-3.5' : 'justify-center px-3 py-2.5'
          } ${
            avisa
              ? 'bg-progreso-fondo text-progreso-texto hover:bg-white'
              : 'bg-vidrio-acento text-white hover:bg-vidrio-acento-hover'
          }`}
        >
          <Icono nombre="play" className="h-4 w-4" />
          {!plegado && etiquetaDeContinuar(entrevistaEnCurso.segundosRestantes)}
        </NavLink>
      )}

      {plegado ? <Tooltip texto="Simular entrevista">{botonSimularEntrevista}</Tooltip> : botonSimularEntrevista}
    </div>
  )
}
