import { useId, useState } from 'react'
import type { Ref } from 'react'

import { MAXIMO_BYTES } from '@/api/curriculums'
import Boton from '@/components/ui/Boton'
import EtiquetaMono from '@/components/ui/EtiquetaMono'
import Icono from '@/components/ui/Icono'
import Tarjeta from '@/components/ui/Tarjeta'
import CampoConvocatoria from '@/features/curriculum/components/CampoConvocatoria'
import ZonaDeArchivo from '@/features/curriculum/components/ZonaDeArchivo'

/** El máximo del backend, legible: "2 MB". Calculado, para que no diverja. */
const MAXIMO_LEGIBLE = `${MAXIMO_BYTES / (1024 * 1024)} MB`

interface Props {
  archivo: File | null
  convocatoria: string
  archivoConvocatoria: File | null
  analizando: boolean
  /** Por campo del formulario: `archivo`, `convocatoria`, `archivoConvocatoria`. */
  errores: Record<string, string>
  /** Lo que no es de un campo (red, tiempo agotado): va junto al botón que lo causó. */
  errorGeneral: string
  onArchivo: (archivo: File | null) => void
  onConvocatoria: (texto: string) => void
  onArchivoConvocatoria: (archivo: File | null) => void
  onAnalizar: () => void
  /** Contenedor de la zona del CV: la página lleva ahí el foco al volver con "Analizar otro". */
  refZonaDelCv?: Ref<HTMLDivElement>
}

/**
 * Lo que se pide para analizar, en una sola tarjeta y en orden de importancia:
 * el CV (obligatorio), luego la convocatoria (opcional y plegada) y "Analizar
 * mi CV". Antes la convocatoria iba primero y el usuario se topaba con lo
 * opcional antes de lo que sí hacía falta.
 *
 * Al plegar la convocatoria se vacía: lo que no se ve no se envía.
 *
 * Se aceptan PDF y DOCX. Admitir PDF es deliberado y no una concesión: los
 * fallos de parseo viven ahí, así que rechazarlo dejaría al módulo sin poder
 * diagnosticar el caso más común, que es justo lo que vale.
 */
export default function EntradaDelAnalisis({
  archivo,
  convocatoria,
  archivoConvocatoria,
  analizando,
  errores,
  errorGeneral,
  onArchivo,
  onConvocatoria,
  onArchivoConvocatoria,
  onAnalizar,
  refZonaDelCv,
}: Props) {
  // Abierta si ya trae algo, como al volver con "Analizar otro".
  const [conConvocatoria, setConConvocatoria] = useState(Boolean(convocatoria || archivoConvocatoria))
  const idConvocatoria = useId()

  const alternarConvocatoria = () => {
    if (conConvocatoria) {
      onConvocatoria('')
      onArchivoConvocatoria(null)
    }
    setConConvocatoria(!conConvocatoria)
  }

  return (
    <Tarjeta className="p-5">
      <div className="flex items-center gap-2">
        <h2 className="font-serif text-headline-md font-semibold text-vidrio-ink">Tu currículum</h2>
        <EtiquetaMono>PDF o DOCX · máx. {MAXIMO_LEGIBLE}</EtiquetaMono>
      </div>

      <div ref={refZonaDelCv} className="mt-3">
        <ZonaDeArchivo
          que="tu CV"
          archivo={archivo}
          deshabilitado={analizando}
          onElegir={onArchivo}
          errorDelServidor={errores.archivo}
        />
        {/* Dicho donde el estudiante entrega su CV real, y verdad comprobable:
            el archivo no se guarda (`apps/curriculums`) y a la IA solo llegan
            secciones con los datos personales tapados (`revision.py`,
            `anonimizar.py`). */}
        <p className="mt-2 flex items-start gap-2 text-meta text-vidrio-muted">
          <Icono nombre="candado" className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>
            No guardamos el archivo, solo el texto. A la IA llegan solo secciones de tu CV, con tu
            nombre, correo y teléfono tapados.
          </span>
        </p>
      </div>

      <div className="mt-4 border-t border-vidrio-linea pt-4">
        <Boton
          variante="texto"
          tamano="sm"
          icono={conConvocatoria ? 'cerrar' : 'mas'}
          aria-expanded={conConvocatoria}
          aria-controls={idConvocatoria}
          onClick={alternarConvocatoria}
          disabled={analizando}
        >
          {conConvocatoria ? 'Quitar la convocatoria' : 'Comparar con una convocatoria (opcional)'}
        </Boton>
        <div id={idConvocatoria} hidden={!conConvocatoria} className="mt-3">
          {conConvocatoria && (
            <CampoConvocatoria
              texto={convocatoria}
              archivo={archivoConvocatoria}
              deshabilitado={analizando}
              onTexto={onConvocatoria}
              onArchivo={onArchivoConvocatoria}
              error={errores.convocatoria ?? errores.archivoConvocatoria}
            />
          )}
        </div>
      </div>

      {/* El error y el progreso, junto al botón: en un celular, un aviso arriba
          de la página queda fuera de la vista justo después de pulsar. */}
      {errorGeneral && (
        <p role="alert" className="mt-4 rounded-control bg-error-fondo px-3 py-2 text-sm text-error-texto">
          {errorGeneral}
        </p>
      )}

      <div className="mt-4 flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-end">
        <p aria-live="polite" className="text-meta text-vidrio-muted sm:mr-auto">
          {analizando ? 'Leyendo tu CV y aplicando las reglas del ATS…' : ''}
        </p>
        <Boton className="w-full sm:w-auto" disabled={!archivo} cargando={analizando} onClick={onAnalizar}>
          Analizar mi CV
        </Boton>
      </div>
      {!archivo && <p className="mt-2 text-right text-meta text-vidrio-muted">Elige tu CV para poder analizarlo.</p>}
    </Tarjeta>
  )
}
