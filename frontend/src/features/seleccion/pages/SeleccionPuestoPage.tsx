import { useId, useReducer, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { VIGENCIA_DEL_CATALOGO_MS, obtenerPuestos } from '@/api/catalogos'
import { ErrorAPI } from '@/api/client'
import { mensajeDeError } from '@/api/errores'
import { iniciarEntrevista, obtenerUltimaConfiguracion } from '@/api/entrevistas'
import Alerta from '@/components/ui/Alerta'
import Pestanas from '@/components/ui/Pestanas'
import Spinner from '@/components/ui/Spinner'
import { type EntrevistaEnCurso, useEntrevistaEnCurso } from '@/components/layout/useEntrevistaEnCurso'
import { desfaseDelReloj, segundosRestantes } from '@/features/entrevista/tiempo'
import AvisoDeEntrevistaEnCurso from '@/features/seleccion/components/AvisoDeEntrevistaEnCurso'
import FormularioDeEntrevista from '@/features/seleccion/components/FormularioDeEntrevista'
import ModalDeInicio from '@/features/seleccion/components/ModalDeInicio'
import PanelDeConvocatoria from '@/features/seleccion/components/PanelDeConvocatoria'
import RepetirConfiguracion from '@/features/seleccion/components/RepetirConfiguracion'
import ResumenDeConvocatoria from '@/features/seleccion/components/ResumenDeConvocatoria'
import ResumenDeEntrevista from '@/features/seleccion/components/ResumenDeEntrevista'
import {
  type AccionDeSeleccion,
  type Campo,
  type Seleccion,
  SELECCION_VACIA,
  campoFaltante,
  nivelDe,
  nombreDeTecnologias,
  puestoDe,
  reducirSeleccion,
  tecnologiasElegidas,
} from '@/features/seleccion/seleccion'
import { invalidarCache, usePeticion } from '@/hooks/usePeticion'
import { nombresDeAreas } from '@/lib/catalogos'
import { prefiereMovimientoReducido } from '@/lib/movimiento'
import type { CatalogoDePuestos, ConvocatoriaAnalizada, UltimaConfiguracion } from '@/types/catalogos'
import type { Entrevista } from '@/types/entrevista'

/** Lo que falta, en la barra y en el anuncio. */
const FALTA: Record<Campo, string> = {
  puesto: 'Elige un puesto para empezar',
  tecnologia: 'Elige la tecnología',
  nivel: 'Elige el nivel',
}

type Modo = 'manual' | 'convocatoria'

const MODOS = [
  { valor: 'manual', etiqueta: 'Personalizada' },
  { valor: 'convocatoria', etiqueta: 'Con convocatoria' },
]

/** La entrevista en curso que informa un 409 al iniciar, en la forma del sidebar. */
function enCursoDelConflicto(err: unknown): EntrevistaEnCurso | null {
  if (!(err instanceof ErrorAPI) || err.status !== 409) return null
  const entrevista = (err.datos as { entrevista_en_curso?: Entrevista | null } | null)?.entrevista_en_curso
  if (!entrevista) return null
  const desfase = desfaseDelReloj(entrevista.ahora, Date.now())
  return {
    id: entrevista.id,
    puestoDisplay: entrevista.puesto_display,
    segundosRestantes: segundosRestantes(entrevista.fecha_limite, desfase, Date.now()),
  }
}

function desplazarSuave(elemento: HTMLElement | null) {
  elemento?.scrollIntoView({ behavior: prefiereMovimientoReducido() ? 'auto' : 'smooth', block: 'nearest' })
}

/**
 * Simular entrevista: carga el catálogo y, con él, muestra el formulario.
 *
 * Nada del catálogo está escrito aquí: puestos, tecnologías (con su capa y su
 * grupo) y niveles llegan de `GET /api/catalogos/puestos/`.
 */
export default function SeleccionPuestoPage() {
  const catalogo = usePeticion('catalogo-puestos', obtenerPuestos, {
    vigenciaMs: VIGENCIA_DEL_CATALOGO_MS,
    mensajeDeError: 'No se pudieron cargar los puestos.',
  })
  // Su fallo no bloquea la pantalla: sin ella simplemente no se ofrece repetir.
  const ultima = usePeticion('ultima-configuracion', obtenerUltimaConfiguracion, { vigenciaMs: 0 })

  if (catalogo.error) return <Alerta>{catalogo.error}</Alerta>
  if (catalogo.cargando || !catalogo.datos) return <Spinner texto="Cargando puestos…" />

  return <ConfiguracionDeEntrevista catalogo={catalogo.datos} ultima={ultima.datos ?? null} />
}

interface PropsDeConfiguracion {
  catalogo: CatalogoDePuestos
  ultima: UltimaConfiguracion | null
}

/**
 * Dos pestañas sobre una misma selección. "Personalizada": los campos (puesto,
 * nivel, tecnología) y su resumen. "Con convocatoria": el aviso, su análisis y
 * lo detectado, sin campos. "Iniciar entrevista", en cualquiera de las dos,
 * abre `ModalDeInicio`; solo su "Comenzar" crea la entrevista.
 *
 * El estado y sus reglas viven en `seleccion.ts`; aquí solo se despacha y se
 * mueve el foco. `?puesto=` y `?nivel=` preseleccionan (llegan desde el reporte
 * y desde el análisis de CV) sin iniciar nada. "Repetir última" y la
 * convocatoria rellenan la selección con la misma acción `aplicar`.
 */
function ConfiguracionDeEntrevista({ catalogo, ultima }: PropsDeConfiguracion) {
  const navigate = useNavigate()
  const [parametros] = useSearchParams()
  const [seleccion, despachar] = useReducer(
    (estado: Seleccion, accion: AccionDeSeleccion) => reducirSeleccion(estado, accion, catalogo),
    null,
    () =>
      reducirSeleccion(
        SELECCION_VACIA,
        { tipo: 'aplicar', puesto: parametros.get('puesto'), nivel: parametros.get('nivel') },
        catalogo,
      ),
  )
  const [modo, setModo] = useState<Modo>('manual')
  const [confirmando, setConfirmando] = useState(false)
  // Solo puede haber una en curso: el aviso de arriba y el modal la nombran.
  // `conflicto` es la que el modal debe tratar: la que sabía la interfaz al
  // abrirlo, o la que informó el servidor con un 409.
  const enCurso = useEntrevistaEnCurso()
  const [conflicto, setConflicto] = useState<EntrevistaEnCurso | null>(null)
  const [error, setError] = useState('')
  const [iniciando, setIniciando] = useState(false)
  const [anuncio, setAnuncio] = useState('')
  // El último análisis: lo que muestra la pestaña "Con convocatoria".
  const [analizada, setAnalizada] = useState<ConvocatoriaAnalizada | null>(null)
  // La convocatoria cuyo perfil está en uso: sus requisitos orientarán las
  // preguntas aunque el usuario la complete en "Personalizada". Pasar a esa
  // pestaña con las pestañas la descarta.
  const [convocatoriaId, setConvocatoriaId] = useState<number | null>(null)
  const formulario = useRef<HTMLDivElement>(null)
  const botonIniciar = useRef<HTMLButtonElement>(null)
  const botonDeConvocatoria = useRef<HTMLButtonElement>(null)
  const idPestanas = useId()
  const idPanel = useId()

  const puesto = puestoDe(seleccion, catalogo)
  const nivel = nivelDe(seleccion, catalogo)
  const tecnologias = puesto ? tecnologiasElegidas(seleccion, puesto) : []
  const falta = campoFaltante(seleccion, catalogo)
  const nombrePorArea = nombresDeAreas(catalogo.areas)

  /**
   * El primer `<select>` vacío y habilitado: los campos están en el orden de
   * `campoFaltante`, así que es el que falta. Sin ninguno, "Iniciar entrevista". Se lee
   * del DOM al momento de enfocar, ya con lo aplicado en pantalla; por eso
   * sirve también a los modales, que evalúan `focoAlCerrar` con la función de
   * su primer render.
   */
  const destinoDelFoco = (): HTMLElement | null => {
    const vacio = Array.from(formulario.current?.querySelectorAll('select') ?? []).find(
      (select) => !select.disabled && select.value === '',
    )
    return vacio ?? botonIniciar.current
  }

  const focoTrasAplicar = () => {
    const destino = destinoDelFoco()
    window.requestAnimationFrame(() => desplazarSuave(destino))
    return destino
  }

  /** Rellena varios campos de una vez y anuncia qué falta. */
  const aplicar = (accion: Extract<AccionDeSeleccion, { tipo: 'aplicar' }>, origen: string) => {
    const pendiente = campoFaltante(reducirSeleccion(seleccion, accion, catalogo), catalogo)
    despachar(accion)
    setAnuncio(pendiente ? `${origen} aplicada. ${FALTA[pendiente]}.` : `${origen} aplicada.`)
  }

  const repetir = () => {
    if (!ultima) return
    // Es una configuración elegida a mano: se ve (y se ajusta) en "Personalizada".
    setModo('manual')
    setConvocatoriaId(null)
    aplicar(
      {
        tipo: 'aplicar',
        puesto: ultima.puesto,
        tecnologias: [ultima.tecnologia, ultima.segunda_tecnologia],
        nivel: ultima.nivel,
      },
      'Configuración anterior',
    )
  }

  /** Lleva lo detectado a la selección y la convocatoria a la entrevista. */
  const usarConvocatoria = ({ id, perfil }: ConvocatoriaAnalizada) => {
    if (!perfil.puesto) return
    aplicar(
      { tipo: 'aplicar', puesto: perfil.puesto, tecnologias: perfil.tecnologias, nivel: perfil.nivel },
      'Configuración de la convocatoria',
    )
    setConvocatoriaId(id)
  }

  /** Tras analizar, el foco va al botón del resumen: "Iniciar" o "Completar". */
  const alAnalizar = (convocatoria: ConvocatoriaAnalizada) => {
    setAnalizada(convocatoria)
    usarConvocatoria(convocatoria)
    window.requestAnimationFrame(() => {
      botonDeConvocatoria.current?.focus({ preventScroll: true })
      desplazarSuave(botonDeConvocatoria.current)
    })
  }

  const cambiarModo = (valor: string) => {
    setModo(valor as Modo)
    // Elegir "Personalizada" es dejar de partir del aviso: sus requisitos dejan
    // de usarse, los campos se quedan. Volver a "Con convocatoria" vuelve a
    // aplicar lo detectado, para que su resumen diga lo que de verdad se usará.
    if (valor === 'manual') setConvocatoriaId(null)
    else if (analizada) usarConvocatoria(analizada)
  }

  /** Falta un dato del aviso: se elige a mano sin soltar la convocatoria. */
  const completarEnPersonalizada = () => {
    setModo('manual')
    window.requestAnimationFrame(() => {
      const destino = destinoDelFoco()
      destino?.focus({ preventScroll: true })
      desplazarSuave(destino)
    })
  }

  const abrirInicio = () => {
    setError('')
    setConflicto(enCurso)
    setConfirmando(true)
  }

  const iniciar = async (abandonar = false) => {
    const [primera, segunda] = tecnologias
    if (!puesto || !nivel || !primera || falta !== null) return
    setError('')
    setIniciando(true)
    try {
      const datos = await iniciarEntrevista({
        puesto: puesto.codigo,
        tecnologia: primera.codigo,
        segunda_tecnologia: segunda?.codigo ?? null,
        nivel: nivel.codigo,
        convocatoria: convocatoriaId,
        abandonar_en_curso: abandonar,
      })
      // El sidebar y el historial se enteran de la nueva (y de la abandonada).
      invalidarCache('historial')
      navigate(`/entrevista/${datos.entrevista.id}`)
    } catch (err) {
      // Otra en curso que la interfaz no conocía (otra pestaña, caché vieja):
      // el modal pasa a preguntar qué hacer con ella, con datos del servidor.
      const otra = enCursoDelConflicto(err)
      if (otra) setConflicto(otra)
      else setError(mensajeDeError(err, 'No se pudo iniciar la entrevista.'))
      setIniciando(false)
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-serif text-headline-xl font-semibold text-balance text-vidrio-ink">
            Configura tu entrevista
          </h1>
          <p className="mt-1 text-cuerpo text-vidrio-texto">
            Elige puesto, tecnología y nivel, o parte de una convocatoria real.
          </p>
        </div>
        {ultima && (
          <RepetirConfiguracion configuracion={ultima} onConfirmar={repetir} focoTrasConfirmar={focoTrasAplicar} />
        )}
      </div>

      {enCurso && <AvisoDeEntrevistaEnCurso entrevista={enCurso} />}

      {/* Un contenedor y no un <form>: un <form> haría que cualquier botón interno
          sin `type` (como "Analizar convocatoria") lo enviara. */}
      <div className="flex flex-col gap-6 rounded-control border border-vidrio-borde bg-white px-4 py-5 sm:px-6 sm:py-6">
        <Pestanas
          etiqueta="Cómo configurar la entrevista"
          pestanas={MODOS}
          seleccionada={modo}
          onSeleccionar={cambiarModo}
          idBase={idPestanas}
          idPanel={idPanel}
        />

        <div
          role="tabpanel"
          id={idPanel}
          aria-labelledby={`${idPestanas}-${modo}`}
          tabIndex={0}
          className="foco-anillo flex flex-col gap-6 rounded-control"
        >
          {/* Montado siempre: al volver a esta pestaña se conservan el texto, el archivo y el último análisis. */}
          <div hidden={modo !== 'convocatoria'}>
            <PanelDeConvocatoria
              onAnalizada={alAnalizar}
              resumen={
                analizada && (
                  <ResumenDeConvocatoria
                    perfil={analizada.perfil}
                    seleccion={seleccion}
                    catalogo={catalogo}
                    onIniciar={abrirInicio}
                    onCompletar={completarEnPersonalizada}
                    refBoton={botonDeConvocatoria}
                  />
                )
              }
            />
          </div>

          {modo === 'manual' && (
            <>
              <div ref={formulario}>
                <FormularioDeEntrevista
                  catalogo={catalogo}
                  seleccion={seleccion}
                  onAccion={(accion) => despachar(accion)}
                />
              </div>

              <ResumenDeEntrevista
                eleccion={
                  puesto && nivel && falta === null
                    ? { puesto: puesto.nombre, tecnologia: nombreDeTecnologias(seleccion, puesto), nivel: nivel.nombre }
                    : null
                }
                falta={falta ? FALTA[falta] : ''}
                areas={(puesto?.areas ?? []).map((codigo) => nombrePorArea.get(codigo) ?? codigo)}
                totalPreguntas={catalogo.preguntas_por_entrevista}
                onIniciar={abrirInicio}
                refBoton={botonIniciar}
                desdeConvocatoria={convocatoriaId !== null}
              />
            </>
          )}
        </div>
      </div>

      {confirmando && puesto && nivel && (
        <ModalDeInicio
          puesto={puesto.nombre}
          tecnologia={nombreDeTecnologias(seleccion, puesto)}
          nivel={nivel.nombre}
          desdeConvocatoria={convocatoriaId !== null}
          totalPreguntas={catalogo.preguntas_por_entrevista}
          cargando={iniciando}
          error={error}
          enCurso={conflicto}
          onComenzar={() => void iniciar()}
          onContinuarEnCurso={() => conflicto && navigate(`/entrevista/${conflicto.id}`)}
          onAbandonarYEmpezar={() => void iniciar(true)}
          onCancelar={() => setConfirmando(false)}
        />
      )}

      <p className="sr-only" aria-live="polite">
        {anuncio}
      </p>
    </div>
  )
}
