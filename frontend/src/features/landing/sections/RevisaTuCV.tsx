import Icono from '@/components/ui/Icono'
import Tarjeta from '@/components/ui/Tarjeta'
import EncabezadoSeccion from '@/features/landing/components/EncabezadoSeccion'
import ListaDeFunciones from '@/features/landing/components/ListaDeFunciones'
import type { Funcion } from '@/features/landing/components/ListaDeFunciones'
import NotaAclaratoria from '@/features/landing/components/NotaAclaratoria'
import Wrap from '@/features/landing/components/Wrap'
import { clasesRevelado, useRevelarAlEntrar } from '@/features/landing/hooks/useRevelarAlEntrar'

const PARTES: Funcion[] = [
  {
    icono: 'identificacion',
    colorIcono: 'text-vidrio-acento',
    titulo: 'Qué ve el ATS',
    texto:
      'La ficha que armaría el sistema de selección con tu CV y qué la rompe: columnas, tablas, texto escondido en el encabezado o un PDF escaneado.',
  },
  {
    icono: 'resultados',
    colorIcono: 'text-exito-texto',
    titulo: 'Frente a una convocatoria',
    texto:
      'Si pegas la oferta, ves cada requisito como demostrado en tu experiencia, solo declarado en tus habilidades o ausente, junto con los años y el cargo que pide.',
  },
  {
    icono: 'sugerencia',
    colorIcono: 'text-progreso-texto',
    titulo: 'Sugerencias para corregirlo',
    texto:
      'Una IA propone cómo reescribir tus viñetas y qué podrían preguntarte en la entrevista. Va rotulado aparte: nunca cambia lo que se midió.',
  },
]

// La misma ficha que muestra el espejo del ATS en la aplicación, con un dato
// que no se pudo leer: es el caso que el módulo existe para enseñar.
const FICHA: { campo: string; valor: string; leido: boolean }[] = [
  { campo: 'Nombre', valor: 'Valeria Mamani Rocha', leido: true },
  { campo: 'Correo', valor: 'valeria.mamani@example.com', leido: true },
  { campo: 'Teléfono', valor: '+591 71234567', leido: true },
  { campo: 'Ubicación', valor: 'Cochabamba, Bolivia', leido: true },
  { campo: 'Experiencia', valor: 'sección reconocida', leido: true },
  { campo: 'Educación', valor: 'sección reconocida', leido: true },
  { campo: 'Habilidades', valor: 'dentro de un gráfico de barras: no se lee', leido: false },
  { campo: 'Antigüedad', valor: '2 años y 4 meses', leido: true },
]

/**
 * El módulo de CV, mostrado con un ejemplo de la ficha que arma el ATS en lugar
 * de tres tarjetas iguales: así se entiende de un vistazo qué hace, incluido el
 * campo que no se pudo leer.
 *
 * Contenido fijo, sin depender del catálogo: si el catálogo falla, la sección
 * sigue explicando el servicio. La nota del final no es un adorno: no publicar
 * un puntaje es una decisión del módulo.
 */
export default function RevisaTuCV() {
  const { ref, visible } = useRevelarAlEntrar<HTMLElement>()
  const leidos = FICHA.filter((fila) => fila.leido).length

  return (
    <section id="cv" ref={ref} className="scroll-mt-24 py-[clamp(80px,10vw,128px)]">
      <Wrap
        className={`grid items-start gap-x-16 gap-y-12 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] ${clasesRevelado(visible)}`}
      >
        <div>
          <EncabezadoSeccion
            titulo="Revisa tu CV antes de postular"
            descripcion="Un ATS no te rechaza con una nota: si tus datos no entran a sus campos, no apareces en la búsqueda del reclutador."
          />
          <ListaDeFunciones funciones={PARTES} />
          <NotaAclaratoria>
            No te damos un puntaje sobre 100: los ATS reales no puntúan, filtran. Te mostramos qué
            lee el sistema de tu CV y qué hace que no te encuentren.
          </NotaAclaratoria>
        </div>

        <Tarjeta como="figure" className="p-6 sm:p-8 lg:mt-24">
          <figcaption className="flex flex-wrap items-baseline justify-between gap-3">
            <span className="text-tarjeta text-vidrio-ink">Lo que el ATS leyó de un CV</span>
            <span className="font-mono-vidrio text-meta text-vidrio-muted">
              Ejemplo · {leidos}/{FICHA.length} campos
            </span>
          </figcaption>

          <dl className="mt-5 divide-y divide-vidrio-linea">
            {FICHA.map(({ campo, valor, leido }) => (
              <div key={campo} className="grid grid-cols-[1rem_7rem_minmax(0,1fr)] items-baseline gap-x-3 py-2.5">
                <Icono
                  nombre={leido ? 'fortaleza' : 'cerrar'}
                  className={`h-4 w-4 self-center ${leido ? 'text-exito-texto' : 'text-error-texto'}`}
                  aria-hidden
                />
                <dt className="text-meta font-medium text-vidrio-ink">{campo}</dt>
                <dd className={`text-meta ${leido ? 'text-vidrio-texto' : 'font-medium text-error-texto'}`}>
                  {valor}
                </dd>
              </div>
            ))}
          </dl>
        </Tarjeta>
      </Wrap>
    </section>
  )
}
