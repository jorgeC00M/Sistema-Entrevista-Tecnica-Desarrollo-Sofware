import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Alerta from '../components/comunes/Alerta'
import Boton from '../components/comunes/Boton'
import { ErrorAPI } from '../api/cliente'
import { iniciarEntrevista } from '../api/entrevistas'

const AREAS = [
  { valor: 'programacion', etiqueta: 'Programación' },
  { valor: 'bases_de_datos', etiqueta: 'Bases de Datos' },
  { valor: 'estructuras_de_datos', etiqueta: 'Estructuras de Datos' },
  { valor: 'desarrollo_web', etiqueta: 'Desarrollo Web' },
]

const NIVELES = [
  { valor: 'basico', etiqueta: 'Básico' },
  { valor: 'intermedio', etiqueta: 'Intermedio' },
]

function OpcionSeleccionable({ activo, onClick, children, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border px-4 py-3 text-sm font-medium transition ${
        activo
          ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
      } ${className}`}
    >
      {children}
    </button>
  )
}

export default function SeleccionArea() {
  const navigate = useNavigate()
  const [area, setArea] = useState('')
  const [nivel, setNivel] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  const manejarInicio = async () => {
    if (!area || !nivel) return
    setError('')
    setCargando(true)
    try {
      const datos = await iniciarEntrevista({ area, nivel })
      navigate(`/entrevista/${datos.entrevista.id}`)
    } catch (err) {
      setError(err instanceof ErrorAPI ? err.message : 'No se pudo iniciar la entrevista.')
      setCargando(false)
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-1 text-lg font-semibold text-slate-900">Nueva entrevista</h1>
      <p className="mb-6 text-sm text-slate-500">
        Elige un área técnica y un nivel de dificultad. La entrevista consta de 5 preguntas.
      </p>

      <Alerta tipo="error">{error}</Alerta>

      <div className="mt-4 space-y-6">
        <fieldset>
          <legend className="mb-2 text-sm font-medium text-slate-700">Área técnica</legend>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {AREAS.map((a) => (
              <OpcionSeleccionable key={a.valor} activo={area === a.valor} onClick={() => setArea(a.valor)}>
                {a.etiqueta}
              </OpcionSeleccionable>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-2 text-sm font-medium text-slate-700">Nivel</legend>
          <div className="flex gap-2">
            {NIVELES.map((n) => (
              <OpcionSeleccionable
                key={n.valor}
                activo={nivel === n.valor}
                onClick={() => setNivel(n.valor)}
                className="flex-1"
              >
                {n.etiqueta}
              </OpcionSeleccionable>
            ))}
          </div>
        </fieldset>

        <Boton className="w-full" disabled={!area || !nivel} cargando={cargando} onClick={manejarInicio}>
          Comenzar entrevista
        </Boton>
      </div>
    </div>
  )
}
