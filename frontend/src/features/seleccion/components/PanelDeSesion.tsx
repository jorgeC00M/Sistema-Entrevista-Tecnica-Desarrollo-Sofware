import Boton from '@/components/ui/Boton'
import EtiquetaMono from '@/components/ui/EtiquetaMono'
import Icono from '@/components/ui/Icono'
import { CLASES_TARJETA } from '@/components/ui/Tarjeta'
import type { Nivel, Puesto, Tecnologia } from '@/types/catalogos'

interface Props {
  puestoElegido?: Puesto
  nivelElegido?: Nivel
  /** Ausente cuando el usuario no fija stack: no es lo mismo que uno llamado "indiferente". */
  tecnologiaElegida?: Tecnologia
  /** Nombres de los temas que recorrerán las preguntas del puesto elegido. */
  areas: string[]
  totalPreguntas: number
  cargando: boolean
  onComenzar: () => void
}

/** Nombra lo que falta, en vez de dejar que un botón apagado lo insinúe. */
function mensajeDeFalta(hayPuesto: boolean, hayNivel: boolean): string {
  if (!hayPuesto && !hayNivel) return 'Elige un puesto y un nivel para comenzar.'
  if (!hayPuesto) return 'Elige un puesto para comenzar.'
  return 'Elige un nivel para comenzar.'
}

/**
 * Resumen de la sesión que está por iniciarse, con la acción que la inicia.
 *
 * Existe para que la acción principal esté siempre alcanzable: pegajoso al
 * costado en pantallas anchas, barra inferior fija en estrechas. Antes el botón
 * vivía al final del contenido y había que recorrer cinco bloques para llegar.
 *
 * Es además el único sitio donde se enumeran los temas del puesto. Esa lista
 * estaba repetida en las tres tarjetas de puesto, que es lo que las volvía
 * altas; aquí aparece una sola vez y ya como confirmación de lo elegido.
 *
 * Las dos presentaciones comparten un solo nodo y un solo botón: lo que cambia
 * por ancho es qué secciones se muestran, no cuántos controles existen.
 */
export default function PanelDeSesion({
  puestoElegido,
  nivelElegido,
  tecnologiaElegida,
  areas,
  totalPreguntas,
  cargando,
  onComenzar,
}: Props) {
  const completo = Boolean(puestoElegido && nivelElegido)

  return (
    <aside
      className={`${CLASES_TARJETA} fixed inset-x-0 bottom-0 z-30 rounded-none border-x-0 border-b-0 p-4 lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto lg:rounded-vidrio lg:border-x lg:border-b lg:p-5`}
    >
      <div className="hidden lg:block">
        <EtiquetaMono tono="marca">Tu sesión</EtiquetaMono>

        <p className="mt-3 font-serif text-headline-md font-semibold text-vidrio-ink">
          {puestoElegido ? puestoElegido.nombre : 'Sin puesto elegido'}
        </p>
        <p className="mt-0.5 text-sm text-vidrio-texto">
          {nivelElegido ? `Nivel ${nivelElegido.nombre}` : 'Nivel sin elegir'}
          {tecnologiaElegida && <> · {tecnologiaElegida.nombre}</>}
        </p>

        <div className="mt-4 flex items-start gap-2.5 border-t border-vidrio-linea pt-4">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-control bg-vidrio-acento-suave text-vidrio-acento">
            <Icono nombre="reloj" className="h-4 w-4" />
          </span>
          {/* La calificación se calcula tras cada respuesta —calibra las
              siguientes— pero no se publica hasta el final. Decirlo aquí evita
              que su ausencia durante la entrevista se lea como un fallo. */}
          <p className="text-sm text-vidrio-texto">
            {totalPreguntas} {totalPreguntas === 1 ? 'pregunta' : 'preguntas'} · la calificación y la
            retroalimentación aparecen al terminar.
          </p>
        </div>

        {areas.length > 0 && (
          <div className="mt-4 border-t border-vidrio-linea pt-4">
            <p className="text-label-mono text-vidrio-muted uppercase">Temas que cubre</p>
            <ul className="mt-2 space-y-1.5">
              {areas.map((area) => (
                <li key={area} className="flex items-start gap-2 text-sm text-vidrio-texto">
                  <Icono nombre="area" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-vidrio-muted" />
                  {area}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 lg:mt-5 lg:flex-col lg:items-stretch lg:border-t lg:border-vidrio-linea lg:pt-4">
        <Boton
          variante="vidrio"
          forma="pildora"
          className="order-2 shrink-0 lg:order-1 lg:w-full"
          disabled={!completo}
          cargando={cargando}
          onClick={onComenzar}
        >
          Comenzar Entrevista
        </Boton>

        <p className="order-1 min-w-0 text-sm text-vidrio-muted lg:order-2 lg:text-center">
          {completo ? (
            <>
              <span className="lg:hidden">
                {puestoElegido?.nombre} · {nivelElegido?.nombre}
              </span>
              <span className="hidden lg:inline">
                Podrás retomar la entrevista si la dejas a medias.
              </span>
            </>
          ) : (
            mensajeDeFalta(Boolean(puestoElegido), Boolean(nivelElegido))
          )}
        </p>
      </div>
    </aside>
  )
}
