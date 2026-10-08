## 1. Fechas y experiencia calculada

- [x] 1.1 Crear `integrations/documentos/fechas.py` moviendo desde `ats.py` las
  constantes de meses, formatos, separador y fin abierto. Ajustar los imports de
  `ats.py`. Verificar con `python manage.py test tests.integration.test_ats` que
  nada cambia.
- [x] 1.2 Implementar `periodos(texto, hoy)` y `meses_de_experiencia()` con
  fusión de solapados y marca `solo_año`. Crear `tests/integration/test_fechas.py`
  (solapados, "Actualidad" con `hoy` fijo, solo años, sin periodos). Verificar que
  pasa.
- [x] 1.3 En `ats.py`, el campo Antigüedad pasa a "N años y M meses" calculado
  sobre el bloque `experiencia` de `segmentar()`, con caída al texto completo y
  nota. Eliminar `_contar_rangos()` tras confirmar con `grep` que no tiene más
  usos. Verificar con un test de que la educación no suma.

## 2. Registro de reglas y ficha única

- [x] 2.1 Añadir `CAMPOS_DE_LA_FICHA` (8 campos, con Ubicación) y
  `VERSION_DE_REGLAS = 2` en `ats.py`; la rama sin capa de texto recorre la
  constante. Verificar que `sin_capa_de_texto` da "0/8".
- [x] 2.2 Introducir `Contexto` (segmentos, encabezado, periodos) y
  `_VERIFICACIONES`; `analizar()` las recorre. Añadir el test que comprueba que
  los campos emitidos son exactamente `CAMPOS_DE_LA_FICHA` y en orden. Verificar
  que toda `tests.integration` pasa con "7/7" actualizado a "8/8".
- [x] 2.3 Añadir `secciones.encabezado()` usando `titulo_de()`. Test: devuelve
  las líneas previas al primer título y cadena vacía si no hay títulos.

## 3. Reglas sobre el texto

- [x] 3.1 Crear `ubicaciones.py` y `_verificar_ubicacion` (campo + `sin_ubicacion`,
  media). Tests: "Cochabamba, Bolivia" detectado; ciudad solo en experiencia no
  cuenta; sin lugar → debilidad.
- [x] 3.2 Añadir `SIGLAS` en `terminos.py` y `_verificar_siglas` (un único
  hallazgo `solo_sigla_o_solo_nombre`, info). Tests: solo "AWS" avisa; "Amazon
  Web Services (AWS)" no.
- [x] 3.3 Crear `idioma.py::detectar()`. Crear `tests/integration/test_idioma.py`
  (español, inglés, ambiguo → `None`). Verificar que pasa.

## 4. Lo que el ATS no lee

- [x] 4.1 Ampliar `DocumentoExtraido` con `texto_en_cuadros`,
  `texto_en_encabezado`, `caracteres_ocultos` (defaults) y la propiedad `huella`.
  Verificar que los tests existentes que lo construyen a mano siguen pasando.
- [x] 4.2 DOCX: extraer cuadros (`w:txbxContent` sin duplicar `mc:Fallback`) y
  encabezado/pie de cada sección, sin sumarlos a `texto`. Generar en
  `tests/fixtures/cv/generar.py` un DOCX con cuadro de texto y otro con el correo
  en el encabezado. Test: el texto del cuadro está en `texto_en_cuadros` una sola
  vez.
- [x] 4.3 PDF: encabezado/pie repetido en ≥ 2 páginas y caracteres ocultos
  (blanco o < 4 pt, excluyendo los que están sobre un rectángulo de color).
  Generar fixtures: texto blanco, texto blanco sobre banda azul, dos páginas con
  pie repetido. Tests para los tres casos.
- [x] 4.4 `_verificar_zonas_ocultas` y `_verificar_texto_oculto`, con la
  sustitución de `sin_correo`/`sin_telefono` por el hallazgo crítico cuando el dato
  está en el encabezado. Test: un único hallazgo crítico y la nota del campo
  Correo menciona el encabezado.

## 5. Convocatoria: años, cargo e idioma

- [x] 5.1 `convocatoria.anos_requeridos()` con numerales escritos. Tests:
  "mínimo 3 años", "3+ años", "al menos tres años", "3 years", sin años → `None`,
  obligatorio prevalece sobre deseable.
- [x] 5.2 `CARGOS` en `terminos.py` y `convocatoria.cargo()`. Test: "Backend
  Developer" y "Desarrollador Backend" dan el mismo canónico.
- [x] 5.3 Ampliar `Brecha` con `experiencia`, `cargo` e `idioma_distinto`;
  convertir `cubiertos`/`cobertura` de `Grupo` en campos. Tests en
  `test_brecha.py`: `cumple`, `no_alcanza` (con aviso de subestimación si hay
  fechas mezcladas), `no_calculable`, cargo demostrado/ausente, idioma distinto.

## 6. App Django

- [x] 6.1 `AnalisisATS.version_reglas` (default 1) y migración
  `0006_analisisats_version_reglas`. Propiedades `AnalisisATS.parseabilidad` y
  `Curriculum.con_convocatoria`. Verificar `python manage.py migrate` y
  `makemigrations --check` sin cambios pendientes.
- [x] 6.2 `services.py`: hash con `documento.huella`; recalcular con
  `update_or_create` cuando la versión es menor; separar `_construir_analisis`;
  serializar la brecha con `asdict` y borrar `grupo()`; emitir `idioma_distinto`.
  Tests de app: versión vieja recalcula sin duplicar; vigente no recalcula; solo
  cambia el encabezado → dos registros.
- [x] 6.3 `serializers.py`: `parseabilidad` y `con_convocatoria` con `source=`,
  borrando los cuatro `get_*`. `admin.py`: `version_reglas` en `list_display`.
  Verificar con `python manage.py test apps.curriculums`.

## 7. Frontend

- [x] 7.1 `types/curriculum.ts`: `EstadoDeExperiencia`, `RequisitoDeExperiencia`,
  `Brecha.experiencia`, `Brecha.cargo`, `Brecha.idioma_distinto`. Verificar con
  `pnpm exec tsc --noEmit`.
- [ ] 7.2 `BrechaDeRequisitos.tsx`: bloque "Requisitos del puesto" con
  experiencia (pedidos frente a calculados, "aprox." cuando aplique) y cargo,
  extrayendo `FilaDeRequisito` si la fila está en línea. Verificar en el
  navegador con una convocatoria "mínimo 3 años".
- [x] 7.3 Eliminar `DESTINO_PRINCIPAL` de `components/layout/destinos.ts` tras
  confirmar con `grep` que no se usa. Verificar con `pnpm run lint` (sin subir de
  6 advertencias) y `pnpm run build`.

## 8. Cierre

- [x] 8.1 Suite completa `python manage.py test`: todo verde; solo cambian a
  propósito los tests que fijaban "7/7".
- [ ] 8.2 Prueba manual: DOCX con correo en el encabezado → crítico; el mismo CV
  contra una convocatoria "mínimo 3 años" en inglés → fila de experiencia y aviso
  de idioma; volver a subir un CV antiguo → se recalcula sin duplicarse en el
  historial.
- [x] 8.3 Actualizar `CLAUDE.md`: reglas nuevas, `VERSION_DE_REGLAS` y cuándo
  subirla, el punto ciego DOCX resuelto, ficha de 8 campos y número de tests.
