import AccionesDeRegistro from '@/features/landing/components/AccionesDeRegistro'
import Wrap from '@/features/landing/components/Wrap'
import { clasesRevelado, useRevelarAlEntrar } from '@/features/landing/hooks/useRevelarAlEntrar'

export default function CierreCTA() {
  const { ref, visible } = useRevelarAlEntrar<HTMLElement>()

  return (
    <section
      ref={ref}
      className="relative overflow-hidden bg-vidrio-acento py-[clamp(88px,11vw,128px)] text-[#dfe8fb]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 -left-24 h-[420px] w-[420px] rounded-full bg-[#5b86d4] opacity-50 blur-[70px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 -bottom-44 h-[380px] w-[380px] rounded-full bg-vidrio-ink opacity-50 blur-[70px]"
      />
      {/* Resplandor central detrás del título — respira igual que el del
          hero (mismo keyframe `respirar`, ya neutralizado por la regla
          global de prefers-reduced-motion). */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 h-[420px] w-[min(720px,90vw)] -translate-x-1/2 -translate-y-1/2 animate-[respirar_7s_ease-in-out_infinite] rounded-full bg-white/15 blur-[80px]"
      />

      <Wrap className={`relative text-center ${clasesRevelado(visible)}`}>
        <h2 className="mx-auto max-w-[900px] font-serif text-[clamp(2rem,3.6vw,3rem)] leading-[1.15] font-semibold text-white">
          ¿Quieres iniciar con la entrevista?
        </h2>
        <p className="mx-auto mt-[14px] max-w-[560px] text-[1.05rem] leading-[1.6]">
          Crea tu cuenta y empieza la primera simulación ahora mismo. No necesitas tarjeta ni
          agendar con nadie.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <AccionesDeRegistro textoRegistro="Crear cuenta" />
        </div>
      </Wrap>
    </section>
  )
}
