import AccionesDeRegistro from '@/features/landing/components/AccionesDeRegistro'
import Wrap from '@/features/landing/components/Wrap'
import { clasesRevelado, useRevelarAlEntrar } from '@/features/landing/hooks/useRevelarAlEntrar'

/**
 * El cierre, sobre el mismo fondo claro que el resto de la página.
 *
 * Antes era un bloque azul con dos manchas desenfocadas y un resplandor: una
 * sección de color pegada en mitad de una página clara, con relleno decorativo
 * que no decía nada. Ahora la invitación la sostienen el titular y una sola
 * acción.
 */
export default function CierreCTA() {
  const { ref, visible } = useRevelarAlEntrar<HTMLElement>()

  return (
    <section ref={ref} className="border-t border-vidrio-linea py-[clamp(96px,12vw,152px)]">
      <Wrap className={`flex flex-col items-center text-center ${clasesRevelado(visible)}`}>
        <h2 className="max-w-[22ch] font-serif text-seccion text-balance text-vidrio-ink">
          Tu próxima entrevista empieza aquí, no frente al reclutador
        </h2>
        <p className="mt-5 max-w-[52ch] text-entrada text-pretty text-vidrio-texto">
          Crea tu cuenta y empieza la primera simulación ahora mismo. No necesitas tarjeta ni
          agendar con nadie.
        </p>

        <div className="mt-10 flex flex-col items-center gap-x-6 gap-y-3 sm:flex-row">
          <AccionesDeRegistro textoRegistro="Crear cuenta" fondo="claro" />
        </div>
      </Wrap>
    </section>
  )
}
