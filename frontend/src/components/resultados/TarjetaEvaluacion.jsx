function colorPuntuacion(puntuacion) {
  if (puntuacion >= 80) return 'text-emerald-600'
  if (puntuacion >= 60) return 'text-amber-600'
  return 'text-red-600'
}

export default function TarjetaEvaluacion({ numero, pregunta, respuesta, evaluacion }) {
  return (
    <article className="rounded-xl bg-white p-4 ring-1 ring-slate-200 sm:p-5">
      <div className="mb-3 flex items-start justify-between gap-3">
        <h3 className="text-sm font-medium text-slate-500">Pregunta {numero}</h3>
        <span className={`text-lg font-semibold ${colorPuntuacion(evaluacion.puntuacion)}`}>
          {evaluacion.puntuacion}/100
        </span>
      </div>

      <p className="mb-3 text-sm font-medium text-slate-800">{pregunta}</p>
      <p className="mb-4 rounded-lg bg-slate-50 p-3 text-sm whitespace-pre-wrap text-slate-600">
        {respuesta}
      </p>

      <dl className="grid gap-3 sm:grid-cols-3">
        <div>
          <dt className="text-xs font-semibold text-emerald-600 uppercase">Fortalezas</dt>
          <dd className="mt-1 text-sm text-slate-600">{evaluacion.fortalezas}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold text-amber-600 uppercase">Debilidades</dt>
          <dd className="mt-1 text-sm text-slate-600">{evaluacion.debilidades}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold text-indigo-600 uppercase">Sugerencias</dt>
          <dd className="mt-1 text-sm text-slate-600">{evaluacion.sugerencias}</dd>
        </div>
      </dl>
    </article>
  )
}
