import EtiquetaMono from '@/components/ui/EtiquetaMono'
import Icono from '@/components/ui/Icono'
import type { NombreDeIcono } from '@/components/ui/Icono'
import Tarjeta from '@/components/ui/Tarjeta'
import type { Brecha, EstadoDeRequisito, GrupoDeRequisitos } from '@/types/curriculum'

/**
 * El estado intermedio necesita su propio color: no es un acierto ni un fallo,
 * es "lo tienes pero no lo estás aprovechando". Se usa el ámbar que el sistema ya
 * reserva para lo intermedio, en vez de introducir una escala nueva.
 */
const POR_ESTADO: Record<EstadoDeRequisito, { icono: NombreDeIcono; clases: string; nota: string }> =
  {
    demostrado: {
      icono: 'fortaleza',
      clases: 'bg-exito-texto/12 text-exito-texto',
      nota: 'demostrado en tu experiencia',
    },
    declarado: {
      icono: 'mejora',
      clases: 'bg-progreso-fondo text-progreso-texto',
      nota: 'solo en tu lista de habilidades',
    },
    presente: {
      icono: 'fortaleza',
      clases: 'bg-exito-texto/12 text-exito-texto',
      nota: 'aparece en tu CV',
    },
    ausente: {
      icono: 'cerrar',
      clases: 'bg-error-fondo text-error-texto',
      nota: 'no aparece en tu CV',
    },
  }

function Grupo({ titulo, grupo }: { titulo: string; grupo: GrupoDeRequisitos }) {
  if (grupo.requisitos.length === 0) return null

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-label-mono text-vidrio-muted uppercase">{titulo}</h3>
        <EtiquetaMono tono={grupo.cubiertos === grupo.requisitos.length ? 'marca' : 'neutro'}>
          {grupo.cobertura}
        </EtiquetaMono>
      </div>

      <ul className="mt-2 divide-y divide-vidrio-linea">
        {grupo.requisitos.map((requisito) => {
          const estado = POR_ESTADO[requisito.estado]
          return (
            <li key={requisito.termino} className="flex items-center gap-3 py-2">
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${estado.clases}`}
              >
                <Icono nombre={estado.icono} className="h-3 w-3" aria-hidden />
              </span>
              <span className="w-32 shrink-0 font-mono-vidrio text-sm text-vidrio-ink">
                {requisito.termino}
              </span>
              <span className="min-w-0 flex-1 text-sm text-vidrio-texto">{estado.nota}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/**
 * Dónde evidencia el CV cada requisito que la convocatoria pide.
 *
 * Tres estados y no dos, y esa es la decisión que da valor al módulo: "Django" en
 * una lista separada por comas y "Django" dentro de un logro indexan igual para la
 * máquina y valen muy distinto para la persona que lee. Un reclutador hace esa
 * diferencia; el candidato promedio no sabe que existe.
 *
 * No hay porcentaje de ajuste. "4 de 6 requisitos obligatorios" dice lo mismo que
 * un "67% compatible" y, a diferencia de él, se puede defender.
 */
export default function BrechaDeRequisitos({ brecha }: { brecha: Brecha }) {
  return (
    <Tarjeta className="p-5">
      <h2 className="font-serif text-headline-md font-semibold text-vidrio-ink">
        Frente a esta convocatoria
      </h2>

      {!brecha.con_evidencia && (
        // Encadena con `secciones_no_reconocidas`: una debilidad de formato
        // degrada el análisis de contenido, y decirlo es más honesto que mostrar
        // un mapa a medias sin explicación.
        <p className="mt-1.5 text-sm text-progreso-texto">
          No se pudo precisar <em>dónde</em> evidencias cada requisito, porque no se reconocieron
          las secciones de tu CV. Corrige los títulos y vuelve a analizarlo para ver el detalle.
        </p>
      )}

      <div className="mt-4 space-y-5">
        <Grupo
          titulo={brecha.separada ? 'Requisitos obligatorios' : 'Lo que pide la convocatoria'}
          grupo={brecha.obligatorios}
        />
        <Grupo titulo="Deseables" grupo={brecha.deseables} />
      </div>

      {brecha.extras.length > 0 && (
        <div className="mt-5 border-t border-vidrio-linea pt-4">
          <p className="text-label-mono text-vidrio-muted uppercase">Tienes pero no te lo piden</p>
          {/* No cuenta ni a favor ni en contra: informa de qué ocupa espacio sin
              aportar a *esta* postulación. */}
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {brecha.extras.map((termino) => (
              <li
                key={termino}
                className="rounded-chip bg-vidrio-field px-2 py-0.5 font-mono-vidrio text-xs text-vidrio-muted"
              >
                {termino}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Tarjeta>
  )
}
