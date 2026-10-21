import { useState } from 'react'
import type { ReactNode } from 'react'

import { mensajeDeError } from '@/api/errores'
import { analizarConvocatoria } from '@/api/entrevistas'
import Alerta from '@/components/ui/Alerta'
import Boton from '@/components/ui/Boton'
import Icono from '@/components/ui/Icono'
import Textarea from '@/components/ui/Textarea'
import ZonaDeArchivo from '@/features/curriculum/components/ZonaDeArchivo'
import EleccionDeVia, { type Via } from '@/features/seleccion/components/EleccionDeVia'
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
 * La pestaña "Con convocatoria": dos tarjetas para elegir cómo dar el aviso
 * (pegar el texto o subir el archivo), el campo de la elegida y "Analizar
 * convocatoria"; y lo detectado, debajo en móvil y tablet, a la derecha en
 * escritorio. Ahí, antes del primer análisis, un aviso ocupa su lugar para que
 * la entrada no salte cuando aparezca el resultado.
 *
 * Solo se ve el campo de la tarjeta elegida, y solo eso se envía: el servidor
 * acepta uno de los dos. Lo escrito o el archivo de la otra se conserva por si
 * el usuario vuelve a ella. El análisis lo hace el servidor (IA anclada al
 * catálogo); aquí solo se envía.
 */
export default function PanelDeConvocatoria({ onAnalizada, resumen }: Props) {
  const [via, setVia] = useState<Via>('texto')
  const [texto, setTexto] = useState('')
  const [archivo, setArchivo] = useState<File | null>(null)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  const largo = texto.trim().length
  const listo = via === 'texto' ? largo >= MINIMO_CARACTERES : archivo !== null

  const analizar = async () => {
    setError('')
    setCargando(true)
    try {
      const analizada = await analizarConvocatoria(
        via === 'archivo' && archivo ? { archivo } : { texto: texto.trim() },
      )
      onAnalizada(analizada)
    } catch (err) {
      // 422 (no es de software), 400 (archivo ilegible) y 503 llegan con su mensaje.
      setError(mensajeDeError(err, 'No se pudo analizar la convocatoria.'))
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
      <div className="flex min-w-0 flex-col gap-5">
        <EleccionDeVia via={via} onCambiar={setVia} deshabilitado={cargando} />

        {via === 'texto' ? (
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
        ) : (
          <ZonaDeArchivo que="la convocatoria" archivo={archivo} deshabilitado={cargando} onElegir={setArchivo} />
        )}

        {error && (
          <Alerta variante="enLinea" className="text-sm">
            {error}
          </Alerta>
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
