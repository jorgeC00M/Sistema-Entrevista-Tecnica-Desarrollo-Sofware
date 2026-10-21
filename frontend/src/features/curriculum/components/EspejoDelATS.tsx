import type { ReactNode } from 'react'

import EtiquetaMono from '@/components/ui/EtiquetaMono'
import Icono from '@/components/ui/Icono'
import Tarjeta from '@/components/ui/Tarjeta'
import type { AnalisisATS } from '@/types/curriculum'

interface Props {
  analisis: AnalisisATS
  /** Bajo el título: la cobertura de requisitos, en el Resumen. */
  meta?: ReactNode
}

/**
 * La ficha que un ATS armaría con este currículum, campo por campo.
 *
 * Es el componente central de la pantalla, y la razón es que convierte un
 * diagnóstico en algo que el usuario **ve**. Decirle "tus habilidades no se
 * detectan" le pide que confíe; mostrarle la fila «Habilidades — no detectado»
 * junto a su propio CV, no. Se muestra una sola vez, en el Resumen.
 *
 * No hay barra de progreso ni puntaje sobre 100 a propósito: los ATS reales no
 * puntúan, y un número así se leería como una nota de calidad del CV. Lo que se
 * muestra es cuántos de los campos que el ATS intenta llenar se pudieron llenar.
 */
export default function EspejoDelATS({ analisis, meta }: Props) {
  const todos = analisis.campos_detectados === analisis.campos_intentados
  const ninguno = analisis.campos_detectados === 0

  return (
    <Tarjeta className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-serif text-headline-md font-semibold text-vidrio-ink">
          Esto es lo que el ATS ve de tu CV
        </h2>
        <EtiquetaMono tono={todos ? 'marca' : 'neutro'}>{analisis.parseabilidad} campos</EtiquetaMono>
      </div>

      {meta}

      <p className="mt-1.5 text-sm text-vidrio-texto">
        {ninguno
          ? 'El ATS no pudo extraer ningún dato. Para el reclutador, tu CV está en blanco.'
          : todos
            ? 'Todos los datos que un ATS busca se extraen correctamente.'
            : 'Los campos sin detectar no llegan a la base de datos del reclutador, así que no apareces cuando busca por ellos.'}
      </p>

      {/* Lista de definición válida: cada `div` agrupa solo un `dt` y un `dd`.
          El icono va dentro del `dt`. En móvil el valor baja a su propia línea:
          una columna fija de etiqueta dejaba muy poco ancho a correos y enlaces. */}
      <dl className="mt-4 divide-y divide-vidrio-linea">
        {analisis.campos.map((campo) => (
          <div key={campo.nombre} className="flex flex-wrap items-start gap-x-3 gap-y-0.5 py-2.5">
            <dt className="flex basis-full items-start gap-3 text-sm font-medium text-vidrio-ink sm:w-40 sm:shrink-0 sm:basis-auto">
              <span
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                  campo.detectado ? 'bg-exito-fondo text-exito-texto' : 'bg-error-fondo text-error-texto'
                }`}
              >
                <Icono nombre={campo.detectado ? 'fortaleza' : 'cerrar'} className="h-3 w-3" />
              </span>
              <span>
                {campo.nombre}
                <span className="sr-only">{campo.detectado ? ', detectado' : ', no detectado'}</span>
              </span>
            </dt>

            {/* El valor extraído va en monoespaciada: es lo que leyó la
                máquina, no una frase redactada para el usuario. */}
            <dd
              className={`min-w-0 flex-1 pl-8 text-sm break-words sm:pl-0 ${
                campo.detectado ? 'font-mono-vidrio text-vidrio-texto' : 'text-vidrio-muted italic'
              }`}
            >
              {campo.detectado ? campo.valor || 'detectado' : campo.nota || 'no detectado'}
            </dd>
          </div>
        ))}
      </dl>
    </Tarjeta>
  )
}
