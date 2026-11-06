import Icono from '@/components/ui/Icono'

/** Cota del lado cliente, igual que `MAXIMO_CARACTERES_CONVOCATORIA_CV` en el backend. */
const MAXIMO_CARACTERES = 20_000

interface Props {
  texto: string
  deshabilitado: boolean
  onTexto: (texto: string) => void
  /** Error del backend sobre la convocatoria. */
  error?: string
}

/**
 * La convocatoria contra la que medir el CV, en el análisis dirigido.
 *
 * Solo se pega o se escribe (`comparar-con-oferta-en-dos-pasos`): un aviso vive
 * en una página web —LinkedIn, Computrabajo, el sitio de la empresa— y lo
 * natural es copiarlo. Subirla como archivo obligaba a elegir una vía antes de
 * empezar, y casi nadie la usaba.
 */
export default function CampoConvocatoria({ texto, deshabilitado, onTexto, error }: Props) {
  return (
    // Sin título propio: vive en el «Paso 2» de la entrada, que ya dice qué es.
    <div>
      <label htmlFor="convocatoria" className="sr-only">
        Texto de la convocatoria
      </label>
      <textarea
        id="convocatoria"
        value={texto}
        onChange={(evento) => onTexto(evento.target.value)}
        disabled={deshabilitado}
        rows={8}
        maxLength={MAXIMO_CARACTERES}
        // El consejo va aquí y no en un párrafo debajo: sirve antes de pegar,
        // que es justo cuando se ve. Sin esos títulos, los deseables se
        // medirían como obligatorios.
        placeholder="Pega aquí el aviso completo, con sus títulos de requisitos y deseables."
        aria-invalid={Boolean(error)}
        className="campo w-full resize-y px-3 py-2.5 text-sm text-vidrio-ink"
      />
      {error && (
        <p className="mt-1.5 text-sm text-error-texto" role="alert">
          {error}
        </p>
      )}
      {texto.length > 0 && (
        <p className="mt-1.5 flex items-center gap-1.5 text-label-mono text-vidrio-muted uppercase">
          <Icono nombre="info" className="h-3.5 w-3.5" />
          {texto.length} / {MAXIMO_CARACTERES} caracteres
        </p>
      )}
    </div>
  )
}
