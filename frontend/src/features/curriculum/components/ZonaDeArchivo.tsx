import { useId, useRef, useState } from 'react'
import type { DragEvent } from 'react'

import { EXTENSIONES_ACEPTADAS, MAXIMO_BYTES } from '@/api/curriculums'
import Boton from '@/components/ui/Boton'
import BotonIcono from '@/components/ui/BotonIcono'
import Icono from '@/components/ui/Icono'

interface Props {
  /** Qué documento se pide, para el texto del recuadro ("tu CV", "la convocatoria"). */
  que: string
  archivo: File | null
  deshabilitado?: boolean
  onElegir: (archivo: File | null) => void
  /**
   * Error del servidor para este archivo, ya resuelto por `repartirErrores`.
   * Independiente de `problema`, que es la validación local de formato y
   * peso: las dos pueden mostrarse, una encima de la otra, si el usuario
   * elige un archivo nuevo antes de que el padre limpie el error anterior.
   */
  errorDelServidor?: string
}

function esAceptado(nombre: string): boolean {
  return EXTENSIONES_ACEPTADAS.split(',').some((ext) => nombre.toLowerCase().endsWith(ext))
}

function pesoLegible(bytes: number): string {
  return `${Math.max(1, Math.round(bytes / 1024))} KB`
}

/**
 * Selección de un documento: arrastrándolo o eligiéndolo del disco.
 *
 * Extraído de la subida del CV cuando la convocatoria necesitó lo mismo. Dos
 * copias de esta lógica —arrastre, validación, conteo de archivos soltados,
 * borrado— divergirían en el primer arreglo que se le hiciera a una.
 *
 * El recuadro es un `<button>`, no un `<div>` ni un `<label>`. Un `div` habría
 * necesitado su propio `role`, `tabIndex` y manejo de Enter y Espacio; un `label`
 * ligado al input funciona, pero los linters de accesibilidad lo tratan como
 * elemento no interactivo y colgarle eventos de arrastre levanta un aviso con
 * razón: la regla no modela la asociación label→control. Un botón es interactivo
 * de nacimiento, así que cubre las dos vías con un solo punto de tabulación y sin
 * suprimir reglas.
 *
 * Arrastrar nunca es la única vía: la WCAG pide una alternativa de puntero simple
 * para cualquier gesto de arrastre, y aquí la da el mismo clic.
 */
export default function ZonaDeArchivo({
  que,
  archivo,
  deshabilitado = false,
  onElegir,
  errorDelServidor,
}: Props) {
  const entrada = useRef<HTMLInputElement>(null)
  const [arrastrando, setArrastrando] = useState(false)
  const [problema, setProblema] = useState('')
  const idAyuda = useId()
  const idError = useId()

  // El backend valida lo mismo —es la única validación que cuenta— pero
  // comprobarlo aquí ahorra subir hasta dos megas para decirle al usuario algo
  // que se sabía antes de empezar.
  const validar = (seleccionado: File | undefined) => {
    setProblema('')
    if (!seleccionado) return

    if (!esAceptado(seleccionado.name)) {
      setProblema(
        'Solo se aceptan PDF o DOCX. Una imagen no la puede leer ningún ATS: exporta el documento desde Word o Google Docs.',
      )
      onElegir(null)
      return
    }
    if (seleccionado.size > MAXIMO_BYTES) {
      setProblema(
        `El archivo pesa ${pesoLegible(seleccionado.size)} y el máximo es ${pesoLegible(MAXIMO_BYTES)}.`,
      )
      onElegir(null)
      return
    }
    onElegir(seleccionado)
  }

  const quitar = () => {
    setProblema('')
    onElegir(null)
    // Limpiar el valor del input, no solo el estado: si no, volver a elegir el
    // mismo archivo no dispara `change` —el valor no cambió— y parecería que la
    // selección se ignora.
    if (entrada.current) entrada.current.value = ''
  }

  const sobrevolar = (evento: DragEvent<HTMLButtonElement>) => {
    if (deshabilitado) return
    // Sin `preventDefault` el navegador abre el archivo soltado en lugar de
    // entregárselo a la página.
    evento.preventDefault()
    evento.dataTransfer.dropEffect = 'copy'
    setArrastrando(true)
  }

  const salir = (evento: DragEvent<HTMLButtonElement>) => {
    // `dragleave` también se dispara al pasar sobre un hijo del recuadro; sin
    // esta comprobación el resaltado parpadea mientras se arrastra por dentro.
    const destino = evento.relatedTarget
    if (destino instanceof Node && evento.currentTarget.contains(destino)) return
    setArrastrando(false)
  }

  const soltar = (evento: DragEvent<HTMLButtonElement>) => {
    evento.preventDefault()
    setArrastrando(false)
    if (deshabilitado) return

    const soltados = evento.dataTransfer.files
    // Arrastró texto, una imagen de una web o un enlace: no hay archivo.
    if (soltados.length === 0) return
    if (soltados.length > 1) {
      // Se avisa en vez de quedarse con el primero en silencio: el usuario no
      // sabría cuál de los dos se usó.
      setProblema('Arrastra un solo archivo.')
      return
    }
    validar(soltados[0])
  }

  return (
    <div>
      <input
        ref={entrada}
        type="file"
        accept={EXTENSIONES_ACEPTADAS}
        className="sr-only"
        tabIndex={-1}
        onChange={(evento) => validar(evento.target.files?.[0])}
      />

      {/* Con un archivo elegido, el recuadro se reduce a la fila del archivo:
          seguir invitando a arrastrar haría dudar de si ya se eligió. */}
      {archivo ? (
        <div className="flex items-center gap-2 rounded-control bg-vidrio-field px-3 py-2">
          <Icono nombre="documento" className="h-4 w-4 shrink-0 text-vidrio-tenue" />
          <span title={archivo.name} className="min-w-0 flex-1 truncate font-mono-vidrio text-sm text-vidrio-texto">
            {archivo.name}
          </span>
          <span className="shrink-0 text-label-mono text-vidrio-muted uppercase">{pesoLegible(archivo.size)}</span>
          <Boton
            variante="texto"
            tamano="sm"
            onClick={() => entrada.current?.click()}
            disabled={deshabilitado}
            aria-describedby={problema || errorDelServidor ? idError : undefined}
          >
            Cambiar
          </Boton>
          <BotonIcono
            icono="cerrar"
            aria-label={`Quitar ${archivo.name}`}
            tamano="sm"
            onClick={quitar}
            disabled={deshabilitado}
          />
        </div>
      ) : (
        <button
          type="button"
          disabled={deshabilitado}
          onClick={() => entrada.current?.click()}
          onDragOver={sobrevolar}
          onDragEnter={sobrevolar}
          onDragLeave={salir}
          onDrop={soltar}
          aria-describedby={`${idAyuda}${problema || errorDelServidor ? ` ${idError}` : ''}`}
          className={`flex w-full flex-col items-center gap-2 rounded-vidrio border-2 border-dashed px-4 py-7 text-center foco-anillo transition-colors duration-150 ${
            deshabilitado
              ? 'cursor-not-allowed border-vidrio-linea opacity-60'
              : 'cursor-pointer border-vidrio-linea hover:border-vidrio-acento/50 hover:bg-vidrio-field'
          } ${arrastrando ? 'border-vidrio-acento bg-vidrio-acento-suave' : ''}`}
        >
          <span
            className={`flex h-11 w-11 items-center justify-center rounded-control ${
              arrastrando ? 'bg-vidrio-acento text-white' : 'bg-vidrio-field text-vidrio-muted'
            }`}
          >
            <Icono nombre={arrastrando ? 'resultados' : 'mas'} className="h-5 w-5" />
          </span>

          <span className="text-sm text-vidrio-texto">
            {arrastrando ? (
              <strong className="font-semibold text-vidrio-acento">Suelta {que} aquí</strong>
            ) : (
              <>
                {/* Arrastrar solo existe con puntero: en un celular se dice "toca". */}
                <span className="hidden [@media(hover:hover)]:inline">Arrastra {que} aquí o </span>
                <span className="[@media(hover:hover)]:hidden">Toca para </span>
                <span className="font-semibold text-vidrio-acento underline">elegir un archivo</span>
              </>
            )}
          </span>
          <span id={idAyuda} className="text-meta text-vidrio-muted">
            PDF o DOCX, hasta {pesoLegible(MAXIMO_BYTES)}
          </span>
        </button>
      )}

      {/* El local primero: si el formato ya está mal, no tiene sentido
          mostrar también un error de servidor sobre un archivo que ya se
          descartó. `errorDelServidor` solo aplica mientras no haya uno
          nuevo que lo contradiga. */}
      {problema ? (
        <p id={idError} className="mt-3 text-sm text-error-texto" role="alert">
          {problema}
        </p>
      ) : (
        errorDelServidor && (
          <p id={idError} className="mt-3 text-sm text-error-texto" role="alert">
            {errorDelServidor}
          </p>
        )
      )}
    </div>
  )
}
