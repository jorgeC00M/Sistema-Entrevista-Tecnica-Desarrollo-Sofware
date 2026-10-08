## Context

Motivación en `proposal.md`; comportamiento en `specs/revision-de-cv/spec.md`.

Estado actual que condiciona el diseño:

- `ats.py::_contar_rangos()` solo **cuenta** periodos. No existe cálculo de
  meses, así que la regla de años necesita primero ese cálculo.
- `extractor.py::_extraer_docx` lee `paragraphs` y `tables`. Cuadros de texto y
  encabezado/pie quedan fuera sin que nadie lo sepa.
- `services.analizar()` reutiliza el análisis si coincide `(usuario,
  hash_texto, hash_convocatoria)`, sin saber con qué reglas se hizo.
- Los 7 nombres de la ficha están escritos a mano en la rama "sin capa de
  texto" de `ats.analizar()`, aparte de los `_verificar_*` que los emiten.
- `parseabilidad` se formatea en `ats.Analisis`, `AnalisisATSSerializer` y
  `CurriculumListaSerializer`; `con_convocatoria` en dos serializers.

Restricciones heredadas: `integrations/documentos/` sin Django; nada de IA ni
red; métricas como texto, nunca porcentaje; la dirección apps → integrations.

## Goals / Non-Goals

**Goals:**
- Añadir una regla nueva = una función y una entrada en un registro, sin tocar
  el flujo de `analizar()`.
- Que los datos curados (ubicaciones, siglas, cargos) vivan en tablas aparte de
  quien las usa, como ya ocurre con `terminos.py` y `secciones.py`.
- Que el extractor *registre* lo que un ATS no lee, sin *mezclarlo* con lo que
  sí lee.

**Non-Goals:**
- Distinguir un encabezado de página en un PDF de una sola página.
- Detectar texto oculto en DOCX (propiedad `w:vanish`): poco frecuente en CV, se
  puede añadir después sin cambiar el contrato.
- Reconocer cualquier cargo o ciudad: solo los de las listas curadas.

## Decisions

### D1. Lo invisible para el ATS se guarda aparte, no dentro de `texto`

`DocumentoExtraido` gana `texto_en_cuadros`, `texto_en_encabezado` y
`caracteres_ocultos` (con default, para no romper los tests que lo construyen a
mano). `texto` sigue siendo "lo que lee un parser típico".

*Alternativa descartada*: sumarlo a `texto`. El espejo afirmaría que el ATS ve
un correo que en realidad no ve, que es exactamente el error que el módulo
denuncia.

### D2. `fechas.py` como módulo propio

Las constantes y el parseo de fechas salen de `ats.py` a `fechas.py`, porque
ahora los usan `ats.py` (antigüedad, formatos mezclados) y `brecha.py` (años
requeridos frente a calculados). `periodos(texto, hoy)` devuelve
`Periodo(inicio, fin, solo_año)`; `meses_de_experiencia(periodos)` ordena y
fusiona intervalos solapados. `hoy` es parámetro: sin él, "– Actualidad" haría
los tests dependientes de la fecha.

Se calcula sobre el bloque `experiencia` de `secciones.segmentar()`. Sin
secciones reconocidas se usa el texto completo y la nota del campo lo dice
(mismo criterio de degradar y avisar que el mapa de evidencia).

### D3. Registro de verificaciones en `ats.py`

```
_VERIFICACIONES: tuple[Callable[[DocumentoExtraido, Contexto, Analisis], None], ...]
```

`Contexto` lleva lo que varias reglas comparten y que hoy se recalcula
(secciones segmentadas, encabezado, periodos), calculado una vez por análisis.
`CAMPOS_DE_LA_FICHA` es la única lista de campos; la rama sin texto la recorre.
Un test comprueba que los campos que emiten las verificaciones son exactamente
`CAMPOS_DE_LA_FICHA`, en ese orden, para que no puedan divergir.

### D4. Hallazgos que se sustituyen, no se suman

Si el correo solo está en el encabezado, `texto_en_encabezado` (crítico) sustituye
a `sin_correo`. Dos avisos sobre el mismo fallo harían creer al usuario que tiene
dos problemas. Se implementa haciendo que la verificación de zonas ocultas corra
antes que la de contacto y deje la causa en el `Contexto`.

### D5. `secciones.encabezado()` comparte criterio con `segmentar()`

Son las líneas antes del primer título reconocido por `titulo_de()`. Si cada
módulo decidiera por su cuenta dónde acaba el encabezado, la ubicación podría
buscarse en un bloque que `segmentar()` considera experiencia.

### D6. Detección en el extractor

- **DOCX, cuadros**: XPath `.//w:txbxContent` sobre el cuerpo. Word guarda cada
  cuadro dos veces (`mc:Choice` y `mc:Fallback`); se recorre solo
  `mc:Choice` o el `w:txbxContent` sin `AlternateContent`, para no duplicar.
- **DOCX, encabezado/pie**: `section.header` / `section.footer` (y sus variantes
  de primera página) de cada sección.
- **PDF, encabezado/pie**: con ≥ 2 páginas, líneas cuyo `top` cae en el 8 %
  superior o inferior y cuyo texto (sin dígitos, por la numeración) se repite en
  todas las páginas.
- **PDF, texto oculto**: `page.chars` con `non_stroking_color` blanco o
  `size < 4`, excluyendo los caracteres cuyo centro cae dentro de un
  `page.rects` con relleno no blanco.

*Alternativa descartada*: renderizar la página y comparar colores de píxeles.
Exacto, pero añade una dependencia pesada para un caso de borde.

### D7. Idioma por palabras vacías

`idioma.detectar()` cuenta apariciones de ~30 palabras vacías por idioma y exige
una proporción mínima (2:1) y un mínimo absoluto; si no, devuelve `None`.
*Alternativa descartada*: `langdetect`. Dependencia nueva, no determinista sin
fijar semilla, y para dos idiomas una lista basta.

### D8. Años y cargo de la convocatoria

`convocatoria.anos_requeridos()` usa patrones para "mínimo/al menos/más de N
años", "N+ años", "N years", con numerales escritos uno–diez. Si hay varios, toma
el del bloque obligatorio; si no se separa, el mayor. `convocatoria.cargo()`
busca en `CARGOS` y devuelve el canónico; el CV se busca con las mismas
variantes, de modo que "Backend Developer" y "Desarrollador Backend" coinciden.

### D9. Versión de reglas y huella del documento

- `ats.VERSION_DE_REGLAS = 2`; `AnalisisATS.version_reglas` (default 1, que es lo
  que son todos los análisis existentes).
- `services.analizar()`: caché vigente → se devuelve; caché con versión menor →
  se recalcula con `AnalisisATS.objects.update_or_create(curriculum=...)`.
- El hash del CV pasa a `documento.huella` (texto + cuadros + encabezado). Los
  hashes existentes dejan de coincidir y esos CV se reanalizan una vez como
  registro nuevo: aceptable, sin migración de datos.

*Alternativa descartada*: incluir la versión en la `UniqueConstraint`. Crearía
un registro por versión y el historial mostraría el mismo CV varias veces.

### D10. Serializado y modelo sin duplicación

- `AnalisisATS.parseabilidad` y `Curriculum.con_convocatoria` como propiedades;
  los serializers usan `source=`. Se borran los `get_*`.
- La brecha se serializa con `dataclasses.asdict` sobre `Brecha` completa (que
  ahora incluye `experiencia`, `cargo`, `idioma_distinto`), en lugar del
  `grupo()` a mano. Las propiedades calculadas de `Grupo` (`cubiertos`,
  `cobertura`) se convierten en campos para que `asdict` las incluya.
- `_guardar_analisis` se parte en `_construir_analisis` (puro, devuelve el dict)
  y la escritura, para poder probar el contenido sin base de datos.

### D11. Frontend

Solo `BrechaDeRequisitos.tsx` cambia de verdad: un bloque "Requisitos del
puesto" con experiencia y cargo encima de los grupos. Se extrae
`FilaDeRequisito` si la fila hoy está en línea, para reutilizar el mismo estilo
de estado. Ubicación y hallazgos nuevos aparecen sin cambios porque
`EspejoDelATS` y `ListaDeHallazgos` iteran lo que llega.

## Risks / Trade-offs

- [Falsos positivos de ubicación ("Santa Cruz" en un nombre de empresa)] → se
  busca solo en el encabezado.
- [Falsos positivos de cargo] → solo cargos curados y solo si la convocatoria
  nombra uno; si no, la regla no aparece.
- [Fechas mal escritas subestiman la experiencia] → el estado `no_alcanza` lo
  advierte cuando hay `formatos_de_fecha_mezclados` o periodos solo con año.
- [Cambiar el hash reanaliza CV ya subidos] → una vez por CV; el historial
  mostrará la entrada nueva junto a la vieja. Se acepta frente a migrar hashes
  sin poder recalcular `huella` (el archivo no se guarda).
- [Ficha "x/8" junto a análisis antiguos "x/7" en el historial] → es cierto: se
  midieron con reglas distintas. Se recalculan al volver a subirlos.
- [Texto blanco legítimo sin rectángulo de fondo (imagen de fondo)] → umbral de
  20 caracteres y redacción del hallazgo como "comprueba si" en lugar de
  afirmar intención.

## Migration Plan

1. `0006_analisisats_version_reglas`: `AddField` con default 1. Sin FK, sin DML,
   reversible.
2. Despliegue normal; no hay backfill: los análisis viejos se recalculan al
   volver a subir el CV.
3. Rollback: revertir la migración elimina la columna; el código anterior
   ignora los campos nuevos de los JSON.
