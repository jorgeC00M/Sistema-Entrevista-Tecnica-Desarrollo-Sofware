import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { ErrorAPI } from '@/api/client'
import { mensajeDeError } from '@/api/errores'
import { iniciarEntrevista } from '@/api/entrevistas'
import { type EntrevistaEnCurso, useEntrevistaEnCurso } from '@/components/layout/useEntrevistaEnCurso'
import { invalidarCache } from '@/hooks/usePeticion'
import { type ErrorDeIA, errorDeIA } from '@/lib/erroresDeIA'
import { anclaDelReloj, segundosRestantes } from '@/lib/tiempo'
import type { DatosIniciarEntrevista, Entrevista } from '@/types/entrevista'

/** La entrevista en curso que informa un 409 al iniciar, en la forma del sidebar. */
function enCursoDelConflicto(err: unknown): EntrevistaEnCurso | null {
  if (!(err instanceof ErrorAPI) || err.status !== 409) return null
  const entrevista = (err.datos as { entrevista_en_curso?: Entrevista | null } | null)?.entrevista_en_curso
  if (!entrevista) return null
  // El 409 acaba de llegar: su llegada es ahora.
  const ahora = performance.now()
  return {
    id: entrevista.id,
    puestoDisplay: entrevista.puesto_display,
    segundosRestantes: segundosRestantes(anclaDelReloj(entrevista.fecha_limite, entrevista.ahora, ahora), ahora),
  }
}

/**
 * El paso de «Iniciar entrevista» a la entrevista creada: el modal, la que ya
 * está en curso y los errores.
 *
 * `datos` es lo que se enviará (o `null` si la selección no está completa); la
 * página lo arma con su selección. Solo puede haber una en curso: `conflicto`
 * es la que el modal debe tratar, la que sabía la interfaz al abrirlo o la que
 * informó el servidor con un 409 (otra pestaña, caché vieja).
 */
export function useInicioDeEntrevista(datos: Omit<DatosIniciarEntrevista, 'abandonar_en_curso'> | null) {
  const navigate = useNavigate()
  const enCurso = useEntrevistaEnCurso()
  const [confirmando, setConfirmando] = useState(false)
  const [conflicto, setConflicto] = useState<EntrevistaEnCurso | null>(null)
  const [error, setError] = useState('')
  const [errorIA, setErrorIA] = useState<ErrorDeIA | null>(null)
  const [iniciando, setIniciando] = useState(false)

  const abrir = () => {
    setError('')
    setErrorIA(null)
    setConflicto(enCurso)
    setConfirmando(true)
  }

  const iniciar = async (abandonar = false) => {
    if (!datos) return
    setError('')
    setErrorIA(null)
    setIniciando(true)
    try {
      const creada = await iniciarEntrevista({ ...datos, abandonar_en_curso: abandonar })
      // El sidebar y el historial se enteran de la nueva (y de la abandonada).
      invalidarCache('historial')
      navigate(`/entrevista/${creada.entrevista.id}`)
    } catch (err) {
      const otra = enCursoDelConflicto(err)
      if (otra) setConflicto(otra)
      else {
        setErrorIA(errorDeIA(err))
        setError(mensajeDeError(err, 'No se pudo iniciar la entrevista.'))
      }
      setIniciando(false)
    }
  }

  return {
    /** La entrevista en curso que conoce la interfaz (para el aviso de arriba). */
    enCurso,
    confirmando,
    conflicto,
    error,
    errorIA,
    iniciando,
    abrir,
    cerrar: () => setConfirmando(false),
    iniciar,
    continuarEnCurso: () => conflicto && navigate(`/entrevista/${conflicto.id}`),
  }
}
