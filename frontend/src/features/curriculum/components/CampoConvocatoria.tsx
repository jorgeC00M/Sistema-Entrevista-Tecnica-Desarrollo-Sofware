import { useState } from 'react'

import ControlSegmentado from '@/components/ui/ControlSegmentado'
import Icono from '@/components/ui/Icono'
import ZonaDeArchivo from '@/features/curriculum/components/ZonaDeArchivo'

/** Cota del lado cliente, igual que `MAXIMO_CARACTERES_CONVOCATORIA` en el backend. */
const MAXIMO_CARACTERES = 20_000

type Via = 'pegar' | 'archivo'

const VIAS = [
  { valor: 'pegar', etiqueta: 'Pegar texto' },
  { valor: 'archivo', etiqueta: 'Subir archivo' },
]

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
  // Al volver con "Analizar otro" puede traer ya un archivo: se abre en esa vía.
  const [via, setVia] = useState<Via>(archivo ? 'archivo' : 'pegar')

  const cambiarVia = (nueva: Via) => {
    if (nueva === via) return
    setVia(nueva)
    if (nueva === 'pegar') onArchivo(null)
    else onTexto('')
  }

  return (
    // Sin tarjeta ni título propios: vive dentro de la entrada del análisis, bajo
    // el botón "Comparar con una convocatoria (opcional)", que ya dice qué es.
    <div>
      {/* Se dice antes de elegir, no después: así el usuario ve qué gana en vez
          de descubrir lo que se perdió al final. */}
      <p className="text-sm text-vidrio-texto">
        Si la pegas, además te decimos qué requisitos concretos de esa oferta evidencia tu CV y
        cuáles no. Sin ella revisamos que el ATS pueda leerlo y qué tecnologías extrae.
      </p>

      <ControlSegmentado
        etiqueta="Cómo compartes la convocatoria"
        ocultarEtiqueta
        opciones={VIAS}
        seleccionado={via}
        onSeleccionar={(valor) => cambiarVia(valor as Via)}
        deshabilitado={deshabilitado}
        className="mt-4"
      />

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
            placeholder="Pega aquí la descripción del puesto, con sus requisitos."
            aria-invalid={Boolean(error)}
            aria-describedby="convocatoria-instruccion"
            className="campo w-full resize-y px-3 py-2.5 text-sm text-vidrio-ink"
          />
          {/* Visible y no solo en el placeholder, que desaparece al pegar. */}
          <p id="convocatoria-instruccion" className="mt-1.5 text-meta text-vidrio-muted">
            Si la oferta separa requisitos de deseables, conserva esos títulos: así no se le da la
            misma gravedad a un deseable que a un obligatorio.
          </p>
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
    </div>
  )
}
