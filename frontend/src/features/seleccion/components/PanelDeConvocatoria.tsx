import { useState } from 'react'
import type { ReactNode } from 'react'

import { mensajeDeError } from '@/api/errores'
import { analizarConvocatoria } from '@/api/entrevistas'
import Alerta from '@/components/ui/Alerta'
import AlertaDeIA from '@/components/ui/AlertaDeIA'
import Boton from '@/components/ui/Boton'
import Icono from '@/components/ui/Icono'
import Textarea from '@/components/ui/Textarea'
import { type ErrorDeIA, errorDeIA } from '@/lib/erroresDeIA'
import type { ConvocatoriaAnalizada } from '@/types/catalogos'

/** Igual que en el backend (`AnalizarConvocatoriaSerializer`). */
const MINIMO_CARACTERES = 30
const MAXIMO_CARACTERES = 5000

interface Props {
  /** Se llama tras cada análisis exitoso: la página aplica el perfil. */
  onAnalizada: (convocatoria: ConvocatoriaAnalizada) => void
  /** Lo detectado (lo arma la página): debajo del botón, o a la derecha en escritorio. */
  resumen?: ReactNode
}

/**
 * La pestaña "Con convocatoria": el texto del aviso y "Analizar convocatoria";
 * y lo detectado, debajo en móvil y tablet, a la derecha en escritorio. Ahí,
 * antes del primer análisis, un aviso ocupa su lugar para que la entrada no
 * salte cuando aparezca el resultado.
 *
 * Solo se pega o se escribe (`convocatoria-de-entrevista-solo-texto`, igual que
 * en el CV): un aviso vive en una página web y lo natural es copiarlo; elegir
 * entre pegar y subir un archivo era un paso más antes de empezar. El análisis
 * lo hace el servidor (IA anclada al catálogo); aquí solo se envía.
 */
export default function PanelDeConvocatoria({ onAnalizada, resumen }: Props) {
  const [texto, setTexto] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [errorIA, setErrorIA] = useState<ErrorDeIA | null>(null)

  const largo = texto.trim().length
  const listo = largo >= MINIMO_CARACTERES

  const analizar = async () => {
    setError('')
    setErrorIA(null)
    setCargando(true)
    try {
      onAnalizada(await analizarConvocatoria(texto.trim()))
    } catch (err) {
      // 400 (aviso corto) y 422 (no es de software) llegan con su mensaje;
      // un fallo de la IA, con su código y el aviso de IA.
      setErrorIA(errorDeIA(err))
      setError(mensajeDeError(err, 'No se pudo analizar la convocatoria.'))
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
      <div className="flex min-w-0 flex-col gap-5">
        <div className="flex flex-col gap-2">
          <Textarea
            id="convocatoria-texto"
            etiqueta="Texto de la convocatoria"
            value={texto}
            onChange={(evento) => setTexto(evento.target.value)}
            maxLength={MAXIMO_CARACTERES}
            maximoCaracteres={MAXIMO_CARACTERES}
            rows={6}
            disabled={cargando}
            placeholder="Pega aquí el aviso: puesto, requisitos y nivel que piden."
          />
          {largo > 0 && largo < MINIMO_CARACTERES && (
            <p className="text-meta text-vidrio-muted">
              Pega el aviso completo: con tan poco texto no se identifica el puesto.
            </p>
          )}
        </div>

        {errorIA ? (
          <AlertaDeIA
            titulo={errorIA.titulo}
            detalle="Tu texto sigue aquí."
          />
        ) : (
          error && (
            <Alerta variante="enLinea" className="text-sm">
              {error}
            </Alerta>
          )
        )}

        <div className="flex justify-end">
          <Boton onClick={analizar} disabled={!listo} cargando={cargando}>
            Analizar convocatoria
          </Boton>
          <span className="sr-only" aria-live="polite">
            {cargando ? 'Analizando la convocatoria…' : ''}
          </span>
        </div>
      </div>

      {resumen ?? (
        <div className="hidden min-h-48 flex-col items-center justify-center gap-2 rounded-control border border-dashed border-vidrio-borde px-6 py-8 text-center lg:flex">
          <Icono nombre="documento" className="h-6 w-6 text-vidrio-tenue" />
          <p className="max-w-xs text-sm text-vidrio-muted">
            Aquí verás el puesto, la tecnología y el nivel detectados.
          </p>
        </div>
      )}
    </div>
  )
}
