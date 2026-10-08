import EtiquetaMono from '@/components/ui/EtiquetaMono'
import Icono from '@/components/ui/Icono'
import type { NombreDeIcono } from '@/components/ui/Icono'
import Tarjeta from '@/components/ui/Tarjeta'
import SugerenciaIA from '@/features/curriculum/components/SugerenciaIA'
import type {
  Brecha,
  EstadoDeExperiencia,
  EstadoDeRequisito,
  GrupoDeRequisitos,
  Requisito,
  RequisitoDeExperiencia,
} from '@/types/curriculum'

interface Aspecto {
  icono: NombreDeIcono
  clases: string
}

const ACIERTO: Aspecto = { icono: 'fortaleza', clases: 'bg-exito-texto/12 text-exito-texto' }
// El estado intermedio necesita su propio color: no es un acierto ni un fallo,
// es "lo tienes pero no lo estás aprovechando". Se usa el ámbar que el sistema ya
// reserva para lo intermedio, en vez de introducir una escala nueva.
const INTERMEDIO: Aspecto = { icono: 'mejora', clases: 'bg-progreso-fondo text-progreso-texto' }
const FALLO: Aspecto = { icono: 'cerrar', clases: 'bg-error-fondo text-error-texto' }

const ASPECTO_POR_ESTADO: Record<EstadoDeRequisito, Aspecto> = {
  demostrado: ACIERTO,
  declarado: INTERMEDIO,
  presente: ACIERTO,
  ausente: FALLO,
}

const NOTA_DE_TECNOLOGIA: Record<EstadoDeRequisito, string> = {
  demostrado: 'demostrado en tu experiencia',
  declarado: 'solo en tu lista de habilidades',
  presente: 'aparece en tu CV',
  ausente: 'no aparece en tu CV',
}

// El cargo usa los mismos estados, pero "declarado" significa otra cosa: no está
// en la lista de habilidades, sino como titular bajo el nombre.
const NOTA_DE_CARGO: Record<EstadoDeRequisito, string> = {
  demostrado: 'lo ejerciste en tu experiencia',
  declarado: 'lo nombras, pero no aparece en tu experiencia',
  presente: 'aparece en tu CV',
  ausente: 'no aparece en tu CV',
}

const ASPECTO_DE_EXPERIENCIA: Record<EstadoDeExperiencia, Aspecto> = {
  cumple: ACIERTO,
  no_alcanza: FALLO,
  no_calculable: INTERMEDIO,
}

/** Clave de la sugerencia del requisito de años, la misma que usa el backend. */
const CLAVE_DE_EXPERIENCIA = 'experiencia'

/** Requisito (o `"experiencia"`) → sugerencia de la IA para cerrarlo. */
type Sugerencias = Record<string, string>

/** Una fila del mapa: el mismo aspecto para tecnologías, cargo y experiencia. */
function FilaDeRequisito({
  aspecto,
  etiqueta,
  nota,
  aclaracion,
  sugerencia,
}: {
  aspecto: Aspecto
  etiqueta: string
  nota: string
  aclaracion?: string
  sugerencia?: string
}) {
  return (
    <li className="flex items-start gap-3 py-2">
      <span
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${aspecto.clases}`}
      >
        <Icono nombre={aspecto.icono} className="h-3 w-3" aria-hidden />
      </span>
      <span className="w-32 shrink-0 font-mono-vidrio text-sm text-vidrio-ink">{etiqueta}</span>
      <span className="min-w-0 flex-1 text-sm text-vidrio-texto">
        {nota}
        {aclaracion && <span className="mt-0.5 block text-xs text-vidrio-muted">{aclaracion}</span>}
        {sugerencia && <SugerenciaIA>{sugerencia}</SugerenciaIA>}
      </span>
    </li>
  )
}

function notaDeExperiencia(experiencia: RequisitoDeExperiencia): string {
  if (experiencia.estado === 'no_calculable') {
    return 'el ATS no puede calcular tu experiencia con las fechas de tu CV'
  }
  return `el ATS calcula ${experiencia.calculados}`
}

function FilaDeExperiencia({
  experiencia,
  sugerencia,
}: {
  experiencia: RequisitoDeExperiencia
  sugerencia?: string
}) {
  const { requeridos } = experiencia
  // No se aconseja cambiar la experiencia para alcanzar el mínimo: se avisa de
  // que el cálculo puede quedarse corto por cómo están escritas las fechas.
  const aclaracion =
    experiencia.posible_subestimacion && experiencia.estado !== 'cumple'
      ? 'Puede estar contando menos de la que tienes: escribe todas tus fechas como «Mes Año».'
      : undefined

  return (
    <FilaDeRequisito
      aspecto={ASPECTO_DE_EXPERIENCIA[experiencia.estado]}
      etiqueta={`${requeridos} año${requeridos === 1 ? '' : 's'}`}
      nota={notaDeExperiencia(experiencia)}
      aclaracion={aclaracion}
      sugerencia={sugerencia}
    />
  )
}

function RequisitosDelPuesto({
  experiencia,
  cargo,
  sugerencias,
}: {
  experiencia: RequisitoDeExperiencia | null
  cargo: Requisito | null
  sugerencias: Sugerencias
}) {
  if (!experiencia && !cargo) return null

  return (
    <div>
      <h3 className="text-label-mono text-vidrio-muted uppercase">Requisitos del puesto</h3>
      <ul className="mt-2 divide-y divide-vidrio-linea">
        {experiencia && (
          <FilaDeExperiencia experiencia={experiencia} sugerencia={sugerencias[CLAVE_DE_EXPERIENCIA]} />
        )}
        {cargo && (
          <FilaDeRequisito
            aspecto={ASPECTO_POR_ESTADO[cargo.estado]}
            etiqueta={cargo.termino}
            nota={NOTA_DE_CARGO[cargo.estado]}
            sugerencia={sugerencias[cargo.termino]}
          />
        )}
      </ul>
    </div>
  )
}

function Grupo({
  titulo,
  grupo,
  sugerencias,
}: {
  titulo: string
  grupo: GrupoDeRequisitos
  sugerencias: Sugerencias
}) {
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
        {grupo.requisitos.map((requisito) => (
          <FilaDeRequisito
            key={requisito.termino}
            aspecto={ASPECTO_POR_ESTADO[requisito.estado]}
            etiqueta={requisito.termino}
            nota={NOTA_DE_TECNOLOGIA[requisito.estado]}
            sugerencia={sugerencias[requisito.termino]}
          />
        ))}
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
 * Encima van los requisitos del puesto —años de experiencia y cargo—, que no son
 * tecnologías y no entran en la cobertura: los años son la pregunta de filtro con
 * la que un ATS sí descarta, y el cargo es lo primero que busca el reclutador.
 *
 * No hay porcentaje de ajuste. "4 de 6 requisitos obligatorios" dice lo mismo que
 * un "67% compatible" y, a diferencia de él, se puede defender.
 */
export default function BrechaDeRequisitos({
  brecha,
  sugerencias = {},
}: {
  brecha: Brecha
  /** De la revisión con IA; solo trae claves de requisitos no demostrados. */
  sugerencias?: Sugerencias
}) {
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
        <RequisitosDelPuesto
          experiencia={brecha.experiencia ?? null}
          cargo={brecha.cargo ?? null}
          sugerencias={sugerencias}
        />
        <Grupo
          titulo={brecha.separada ? 'Requisitos obligatorios' : 'Lo que pide la convocatoria'}
          grupo={brecha.obligatorios}
          sugerencias={sugerencias}
        />
        <Grupo titulo="Deseables" grupo={brecha.deseables} sugerencias={sugerencias} />
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
