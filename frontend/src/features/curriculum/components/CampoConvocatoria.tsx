import { useState } from 'react'

import EtiquetaMono from '@/components/ui/EtiquetaMono'
import Icono from '@/components/ui/Icono'
import Tarjeta from '@/components/ui/Tarjeta'
import ZonaDeArchivo from '@/features/curriculum/components/ZonaDeArchivo'

/** Cota del lado cliente, igual que `MAXIMO_CARACTERES_CONVOCATORIA` en el backend. */
export const MAXIMO_CARACTERES = 20_000

type Via = 'pegar' | 'archivo'

interface Props {
  texto: string
  archivo: File | null
  deshabilitado: boolean
  onTexto: (texto: string) => void
  onArchivo: (archivo: File | null) => void
  /**
   * Error del backend sobre la convocatoria, de cualquiera de sus dos campos
   * (`convocatoria` o `archivo_convocatoria`). Un solo prop basta porque las
   * dos vías son excluyentes: lo que llegó a enviarse es lo que la pestaña
   * activa tiene puesto, así que el error siempre corresponde a ella.
   */
  error?: string
}

/**
 * La convocatoria contra la que medir el CV. Opcional.
 *
 * Pegar es la vía principal y archivo la secundaria, no al revés: una convocatoria
 * vive en una página web —LinkedIn, Computrabajo, el sitio de la empresa— así que
 * lo natural es copiar texto. Subirla sale casi gratis porque el extractor del
 * backend ya maneja PDF y DOCX, y algunas empresas la mandan así.
 *
 * Cambiar de pestaña limpia la otra vía: el backend rechaza recibir las dos, y es
 * mejor que la interfaz lo haga imposible que mostrar ese error después.
 */
export default function CampoConvocatoria({
  texto,
  archivo,
  deshabilitado,
  onTexto,
  onArchivo,
  error,
}: Props) {
  const [via, setVia] = useState<Via>('pegar')

  const cambiarVia = (nueva: Via) => {
    if (nueva === via) return
    setVia(nueva)
    if (nueva === 'pegar') onArchivo(null)
    else onTexto('')
  }

  const pestana = (valor: Via, etiqueta: string) => (
    <button
      type="button"
      onClick={() => cambiarVia(valor)}
      disabled={deshabilitado}
      aria-pressed={via === valor}
      className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vidrio-acento disabled:cursor-not-allowed disabled:opacity-50 ${
        via === valor
          ? 'bg-vidrio-acento text-white shadow-sm'
          : 'text-vidrio-texto hover:text-vidrio-ink'
      }`}
    >
      {etiqueta}
    </button>
  )

  return (
    <Tarjeta className="p-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-headline-sm font-semibold text-vidrio-ink">La convocatoria</span>
        <EtiquetaMono>Opcional</EtiquetaMono>
      </div>

      {/* Se dice antes de elegir, no después: así el usuario ve qué gana en vez
          de descubrir lo que se perdió al final. */}
      <p className="mt-1.5 text-sm text-vidrio-texto">
        Si la pegas, además te decimos qué requisitos concretos de esa oferta evidencia tu CV y
        cuáles no. Sin ella revisamos que el ATS pueda leerlo y qué tecnologías extrae.
      </p>

      <div className="mt-4 flex gap-1 rounded-full bg-vidrio-field p-1">
        {pestana('pegar', 'Pegar texto')}
        {pestana('archivo', 'Subir archivo')}
      </div>

      {via === 'pegar' ? (
        <div className="mt-3">
          <label htmlFor="convocatoria" className="sr-only">
            Texto de la convocatoria
          </label>
          <textarea
            id="convocatoria"
            value={texto}
            onChange={(evento) => onTexto(evento.target.value)}
            disabled={deshabilitado}
            rows={6}
            maxLength={MAXIMO_CARACTERES}
            placeholder={
              'Pega aquí la descripción del puesto, con sus requisitos.\n\n' +
              'Si la oferta separa requisitos de deseables, conserva esos títulos: los usamos para no darle la misma gravedad a un deseable que a un obligatorio.'
            }
            className={`w-full resize-y rounded-vidrio border bg-white px-3 py-2.5 text-sm text-vidrio-ink placeholder:text-vidrio-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vidrio-acento disabled:cursor-not-allowed disabled:opacity-60 ${
              error ? 'border-error-texto' : 'border-vidrio-linea'
            }`}
          />
          {error && (
            <p className="mt-1.5 text-sm text-error-texto" role="alert">
              {error}
            </p>
          )}
          {texto.length > 0 && (
            <p className="mt-1.5 flex items-center gap-1.5 text-label-mono text-vidrio-muted uppercase">
              <Icono nombre="info" className="h-3.5 w-3.5" aria-hidden />
              {texto.length} / {MAXIMO_CARACTERES} caracteres
            </p>
          )}
        </div>
      ) : (
        <div className="mt-3">
          <ZonaDeArchivo
            que="la convocatoria"
            archivo={archivo}
            deshabilitado={deshabilitado}
            onElegir={onArchivo}
            errorDelServidor={error}
          />
        </div>
      )}
    </Tarjeta>
  )
}
