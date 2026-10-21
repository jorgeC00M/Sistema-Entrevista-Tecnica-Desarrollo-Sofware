import type { Ref } from 'react'

import Boton from '@/components/ui/Boton'
import Chip from '@/components/ui/Chip'
import Icono from '@/components/ui/Icono'
import {
  type CatalogoDeSeleccion,
  type Seleccion,
  campoFaltante,
  capasDe,
  nivelDe,
  puestoDe,
  tecnologiasElegidas,
} from '@/features/seleccion/seleccion'
import type { PerfilDetectado } from '@/types/catalogos'

interface Props {
  perfil: PerfilDetectado
  /** Lo aplicado y validado contra el catálogo: lo que de verdad se usará. */
  seleccion: Seleccion
  catalogo: CatalogoDeSeleccion
  onIniciar: () => void
  /** Pasa a "Personalizada" con lo detectado cargado, conservando la convocatoria. */
  onCompletar: () => void
  refBoton?: Ref<HTMLButtonElement>
}

const NOMBRE_DE_CAPA = { '': '', frontend: 'frontend', backend: 'backend' } as const

/**
 * Lo que se detectó en la convocatoria, leído de la selección ya aplicada (no
 * del perfil crudo): así un código que el catálogo descartó se ve como
 * faltante. Completo, ofrece "Iniciar entrevista"; incompleto, marca lo que
 * falta y ofrece "Completar en Personalizada".
 */
export default function ResumenDeConvocatoria({
  perfil,
  seleccion,
  catalogo,
  onIniciar,
  onCompletar,
  refBoton,
}: Props) {
  const puesto = puestoDe(seleccion, catalogo)
  const nivel = nivelDe(seleccion, catalogo)
  const completa = campoFaltante(seleccion, catalogo) === null

  const tecnologia = (() => {
    if (!puesto) return null
    const elegidas = tecnologiasElegidas(seleccion, puesto)
    if (elegidas.length === 0) return null
    const capas = capasDe(puesto)
    const nombres = elegidas.map((t) => t.nombre).join(' + ')
    if (elegidas.length === capas.length) return nombres
    const faltante = capas.find((capa) => !elegidas.some((t) => t.capa === capa))
    return faltante ? `${nombres} (falta el ${NOMBRE_DE_CAPA[faltante]})` : nombres
  })()

  const filas: [string, string | null][] = [
    ['Puesto', puesto?.nombre ?? null],
    ['Tecnología', tecnologia],
    ['Nivel', nivel ? `${nivel.nombre} · ${nivel.descripcion}` : null],
  ]

  return (
    <section
      tabIndex={-1}
      aria-labelledby="titulo-detectado"
      className="flex min-w-0 flex-col gap-4 border-t border-vidrio-linea pt-5 outline-none lg:border-t-0 lg:pt-0"
    >
      <h2 id="titulo-detectado" className="flex items-center gap-2 text-sm font-semibold text-vidrio-ink">
        <Icono nombre="fortaleza" className="h-4 w-4 shrink-0 text-exito-texto" />
        Detectamos
      </h2>

      <dl className="divide-y divide-vidrio-linea rounded-control border border-vidrio-borde text-sm">
        {filas.map(([etiqueta, valor]) => (
          <div key={etiqueta} className="flex justify-between gap-4 px-3.5 py-2.5">
            <dt className="text-vidrio-muted">{etiqueta}</dt>
            <dd className={valor ? 'min-w-0 break-words text-right font-medium text-vidrio-ink' : 'min-w-0 text-right text-error-texto'}>
              {valor ?? 'No indicado en el aviso'}
            </dd>
          </div>
        ))}
      </dl>

      {perfil.nivel_supuesto && (
        <p className="text-meta text-vidrio-muted">El aviso no dejaba claro el nivel: se supuso el inicial.</p>
      )}

      {perfil.requisitos.length > 0 && (
        <div className="text-sm">
          <p className="text-vidrio-muted">Las preguntas se apoyarán en:</p>
          <ul className="mt-1.5 flex flex-wrap gap-1.5">
            {perfil.requisitos.map((requisito) => (
              <li key={requisito}>
                <Chip>{requisito}</Chip>
              </li>
            ))}
          </ul>
        </div>
      )}

      {perfil.fuera_de_alcance.length > 0 && (
        <p className="flex items-start gap-2 text-sm text-progreso-texto">
          <Icono nombre="info" className="mt-0.5 h-4 w-4 shrink-0" />
          <span>No se evalúa en el simulador: {perfil.fuera_de_alcance.join(', ')}.</span>
        </p>
      )}

      <div className="flex flex-wrap items-center justify-end gap-3">
        {!completa && (
          <p className="mr-auto text-sm text-vidrio-muted">Falta un dato para empezar: elígelo tú.</p>
        )}
        {completa ? (
          <Boton ref={refBoton} tamano="sm" onClick={onIniciar}>
            Iniciar entrevista
          </Boton>
        ) : (
          <Boton ref={refBoton} variante="secundario" tamano="sm" onClick={onCompletar}>
            Completar en Personalizada
          </Boton>
        )}
      </div>
    </section>
  )
}
