import Icono from '@/components/ui/Icono'
import AccionesDeRegistro from '@/features/landing/components/AccionesDeRegistro'
import VistaPreviaEntrevista from '@/features/landing/components/VistaPreviaEntrevista'
import Wrap from '@/features/landing/components/Wrap'
import { clasesRevelado, useRevelarAlEntrar } from '@/features/landing/hooks/useRevelarAlEntrar'

interface Props {
  totalPreguntas: number | null
}

// Cada rastro describe algo que el sistema hace hoy. "Nota al terminar" y no
// "al instante": la evaluación no se publica mientras la entrevista sigue.
const RASTROS = [
  { icono: 'fortaleza' as const, texto: 'preguntas por entrevista', dinamico: true },
  { icono: 'fortaleza' as const, texto: 'Respuestas escritas', dinamico: false },
  { icono: 'fortaleza' as const, texto: 'Nota al terminar', dinamico: false },
]

export default function Hero({ totalPreguntas }: Props) {
  const { ref, visible } = useRevelarAlEntrar<HTMLElement>()

  return (
    <section
      id="inicio"
      ref={ref}
      className="relative flex min-h-[100svh] items-center overflow-hidden bg-[linear-gradient(180deg,#16254b_0%,var(--color-vidrio-ink)_40%,var(--color-vidrio-acento)_100%)] pt-[clamp(96px,13vh,130px)] pb-[clamp(28px,5vh,48px)] text-white"
    >
      {/* Cuadrícula tenue: decorativa, se desvanece arriba y abajo. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.05) 1px,transparent 1px)',
          backgroundSize: '64px 64px',
          maskImage: 'linear-gradient(180deg,transparent,#000 30%,#000 60%,transparent)',
          WebkitMaskImage: 'linear-gradient(180deg,transparent,#000 30%,#000 60%,transparent)',
        }}
      />
      {/* Resplandor que "respira" al fondo del hero. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[90px] left-1/2 h-[320px] w-[min(760px,90vw)] -translate-x-1/2 animate-[respirar_7s_ease-in-out_infinite] rounded-t-full blur-[8px]"
        style={{
          background:
            'radial-gradient(ellipse at 50% 100%,rgba(255,255,255,.65),rgba(190,212,250,.25) 40%,transparent 70%)',
        }}
      />

      <Wrap className="relative w-full text-center">
        <h1
          className={`mx-auto max-w-[5000px] font-serif text-[2rem] leading-[1.1] font-semibold tracking-[-0.02em] text-balance sm:text-[2.8rem] lg:text-[3.8rem] ${clasesRevelado(visible)}`}
        >
          Practica tu próxima entrevista, antes de la evaluación real
        </h1>

        <p
          className={`mx-auto mt-[clamp(12px,2.2vh,20px)] max-w-[600px] text-[clamp(0.98rem,2vh,1.08rem)] leading-[1.6] text-white/82 ${clasesRevelado(visible)} delay-100`}
        >
          Un entrevistador con inteligencia artificial te hace las preguntas del puesto al que
          postulas, evalúa lo que respondes y te dice qué mejorar. Y antes de postular, revisa
          qué lee un ATS de tu CV. Sin agendar con nadie y cuantas veces quieras.
        </p>

        <div
          className={`mt-[clamp(18px,3.2vh,28px)] flex flex-wrap items-center justify-center gap-3 ${clasesRevelado(visible)} delay-200`}
        >
          <AccionesDeRegistro textoRegistro="Crear cuenta gratis" />
        </div>

        <div
          className={`mt-[clamp(12px,2vh,18px)] flex flex-wrap justify-center gap-[22px] text-sm text-white/70 ${clasesRevelado(visible)} delay-200`}
        >
          {RASTROS.map((r) => (
            <span key={r.texto} className="flex items-center gap-1.5">
              <Icono nombre={r.icono} className="h-[15px] w-[15px] text-[#bcd0f5]" />
              {r.dinamico && totalPreguntas !== null ? `${totalPreguntas} ${r.texto}` : r.texto}
            </span>
          ))}
        </div>

        <div className={`${clasesRevelado(visible)} delay-300`}>
          <VistaPreviaEntrevista />
        </div>
      </Wrap>
    </section>
  )
}
