import { matchPath } from 'react-router-dom'

interface TituloDeRuta {
  patron: string
  titulo: string
  subtitulo?: string
}

/**
 * Mapa estático de ruta a título, en vez de que cada página lo declare al
 * montarse.
 *
 * Un contexto donde cada página avisa su título da más flexibilidad, pero si
 * una página nueva olvida declararlo el encabezado queda vacío — justo lo que
 * prohíbe la spec. Con un mapa fijo eso es imposible: una ruta que falte cae
 * al título por defecto, nunca a un hueco en blanco.
 *
 * Las rutas con parámetro van primero y se resuelven con `matchPath`, no con
 * comparación exacta.
 */
const TITULOS: TituloDeRuta[] = [
  {
    patron: '/entrevista/:id/resultados',
    titulo: 'Resultados',
    subtitulo: 'La evaluación de cada una de tus respuestas',
  },
  {
    patron: '/entrevista/:id',
    titulo: 'Entrevista',
    subtitulo: 'Responde a tu ritmo; puedes retomarla si te vas a medias',
  },
  {
    patron: '/simular-entrevista',
    titulo: 'Simular entrevista',
    subtitulo: 'Elige el puesto al que quieres postular y el nivel de exigencia',
  },
  {
    patron: '/mi-cv/analisis/*',
    titulo: 'Analizar CV',
    subtitulo: 'Qué lee un ATS de tu currículum',
  },
  {
    patron: '/mi-cv/oferta/*',
    titulo: 'Comparar con oferta',
    subtitulo: 'Cómo encaja tu currículum en una convocatoria',
  },
  {
    patron: '/historial',
    titulo: 'Historial y progreso',
    subtitulo: 'Tus entrevistas anteriores y tu evolución en el tiempo',
  },
  {
    patron: '/perfil',
    titulo: 'Mi perfil',
    subtitulo: 'Los datos de tu cuenta',
  },
]

const TITULO_POR_DEFECTO: TituloDeRuta = { patron: '*', titulo: 'Antesala' }

export function resolverTitulo(pathname: string): TituloDeRuta {
  for (const entrada of TITULOS) {
    if (matchPath(entrada.patron, pathname)) return entrada
  }
  return TITULO_POR_DEFECTO
}
