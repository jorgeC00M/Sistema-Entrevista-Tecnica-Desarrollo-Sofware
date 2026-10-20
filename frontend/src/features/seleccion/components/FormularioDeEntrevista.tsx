import CampoSelect, { type OpcionDeCampo } from '@/features/seleccion/components/CampoSelect'
import {
  type AccionDeSeleccion,
  type CatalogoDeSeleccion,
  type Seleccion,
  agruparPorGrupo,
  capasDe,
  puestoDe,
} from '@/features/seleccion/seleccion'
import type { Capa } from '@/types/catalogos'

interface Props {
  catalogo: CatalogoDeSeleccion
  seleccion: Seleccion
  onAccion: (accion: AccionDeSeleccion) => void
}

const ETIQUETA_DE_CAPA: Record<Capa, string> = {
  '': 'Tecnología',
  frontend: 'Tecnología de frontend',
  backend: 'Tecnología de backend',
}

/**
 * Los campos de la entrevista. En escritorio, todos en una fila (Puesto,
 * Nivel y Tecnología, o una tecnología por capa en Full Stack); en tablet,
 * Puesto y Nivel en una fila y debajo Tecnología; en móvil, apilados. Presentacional: el estado y
 * sus reglas viven en `seleccion.ts`; aquí solo se traduce cada cambio en una
 * acción.
 *
 * El orden del DOM es el de `campoFaltante` (y no se reordena con CSS, para
 * que el Tab y el lector de pantalla sigan lo que se ve): así el primer
 * `<select>` vacío del formulario es siempre el campo que falta, y la página
 * lo usa para mover el foco.
 */
export default function FormularioDeEntrevista({ catalogo, seleccion, onAccion }: Props) {
  const puesto = puestoDe(seleccion, catalogo)
  const capas = puesto ? capasDe(puesto) : ([''] as Capa[])

  return (
    // Clases literales (no `grid-cols-${n}`): Tailwind solo genera las que ve.
    <div
      className={`grid grid-cols-1 items-start gap-5 sm:grid-cols-2 ${
        capas.length > 1 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'
      }`}
    >
      <CampoSelect
        id="campo-puesto"
        etiqueta="Puesto"
        valor={seleccion.puesto}
        opciones={catalogo.puestos.map((p) => ({ valor: p.codigo, etiqueta: p.nombre }))}
        onCambiar={(codigo) => onAccion({ tipo: 'elegirPuesto', codigo })}
        ayuda={puesto?.descripcion ?? 'El rol al que postulas: define los temas de las preguntas.'}
      />

      <CampoSelect
        id="campo-nivel"
        etiqueta="Nivel"
        valor={seleccion.nivel}
        opciones={catalogo.niveles.map((n) => ({
          valor: n.codigo,
          etiqueta: n.descripcion ? `${n.nombre} · ${n.descripcion}` : n.nombre,
        }))}
        onCambiar={(codigo) => onAccion({ tipo: 'elegirNivel', codigo })}
      />

      {capas.map((capa) => (
        <div key={capa || 'unica'} className={capas.length === 1 ? 'sm:col-span-2 lg:col-span-1' : undefined}>
          <CampoSelect
            id={`campo-tecnologia-${capa || 'unica'}`}
            etiqueta={ETIQUETA_DE_CAPA[capa]}
            valor={seleccion.tecnologias[capa] ?? ''}
            opciones={agruparPorGrupo(puesto?.tecnologias.filter((t) => t.capa === capa) ?? []).map(
              ([grupo, tecnologias]): [string, OpcionDeCampo[]] => [
                grupo,
                tecnologias.map((t) => ({ valor: t.codigo, etiqueta: t.nombre })),
              ],
            )}
            onCambiar={(codigo) => onAccion({ tipo: 'elegirTecnologia', capa, codigo })}
            deshabilitado={!puesto}
            ayuda={puesto ? undefined : 'Elige primero el puesto.'}
          />
        </div>
      ))}
    </div>
  )
}
