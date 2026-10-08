import EncabezadoSeccion from '@/features/landing/components/EncabezadoSeccion'
import NotaAclaratoria from '@/features/landing/components/NotaAclaratoria'
import TarjetaDeFuncion from '@/features/landing/components/TarjetaDeFuncion'
import type { Funcion } from '@/features/landing/components/TarjetaDeFuncion'
import Wrap from '@/features/landing/components/Wrap'
import { clasesRevelado, useRevelarAlEntrar } from '@/features/landing/hooks/useRevelarAlEntrar'

const PARTES: Funcion[] = [
  {
    icono: 'identificacion',
    colorIcono: 'bg-vidrio-acento-suave text-vidrio-acento',
    titulo: 'Qué ve el ATS',
    texto:
      'La ficha que armaría el sistema de selección con tu CV —contacto, ubicación, secciones, años de experiencia— y qué la rompe: columnas, tablas, texto escondido en el encabezado o un PDF escaneado.',
  },
  {
    icono: 'resultados',
    colorIcono: 'bg-exito-fondo text-exito-texto',
    titulo: 'Frente a una convocatoria',
    texto:
      'Si pegas la oferta, ves cada requisito como demostrado en tu experiencia, solo declarado en tus habilidades o ausente, junto con los años y el cargo que pide.',
  },
  {
    icono: 'sugerencia',
    colorIcono: 'bg-progreso-fondo text-progreso-texto',
    titulo: 'Sugerencias para corregirlo',
    texto:
      'Una IA propone cómo reescribir tus viñetas, cómo cerrar los requisitos que faltan y qué podrían preguntarte en la entrevista. Va rotulado aparte: nunca cambia lo que se midió.',
  },
]

/**
 * El módulo de CV, que la landing no mencionaba.
 *
 * Contenido fijo, sin depender del catálogo: si el catálogo falla esta sección
 * sigue explicando el servicio. Cada afirmación corresponde a algo que el módulo
 * hace hoy (`integrations/documentos/` y `apps/curriculums/revision.py`).
 *
 * La nota del final no es un adorno: no publicar un puntaje es una decisión del
 * módulo, y decirlo aquí evita que alguien espere un "73/100" que no va a recibir.
 */
export default function RevisaTuCV() {
  const { ref, visible } = useRevelarAlEntrar<HTMLElement>()

  return (
    <section id="cv" ref={ref} className="scroll-mt-24 py-[clamp(64px,8vw,100px)]">
      <Wrap className={clasesRevelado(visible)}>
        <EncabezadoSeccion
          indice="03"
          titulo="Revisa tu CV antes de postular"
          descripcion="Un ATS no te rechaza con una nota: si tus datos no entran a sus campos, no apareces en la búsqueda del reclutador."
        />

        <div className="grid gap-5 md:grid-cols-3">
          {PARTES.map((parte) => (
            <TarjetaDeFuncion key={parte.titulo} {...parte} />
          ))}
        </div>

        <NotaAclaratoria>
          No te damos un puntaje sobre 100: los ATS reales no puntúan, filtran. Te mostramos qué
          lee el sistema de tu CV y qué hace que no te encuentren.
        </NotaAclaratoria>
      </Wrap>
    </section>
  )
}
