## 1. Catálogo (backend)

- [x] 1.1 Respaldo de la base local con `pg_dump` y `Tecnologia.grupo` (D1), con la migración `0012`. Se verifica que el respaldo existe y que `makemigrations --check` no muestra cambios pendientes.
- [x] 1.2 En `datos.py`, las 53 tecnologías con `grupo` y `capa`, y en `cargar_catalogos`, el campo `grupo`. Se verifica con `python -c` contando 7/10/13/6/7/10 por puesto y que ningún código supera 30 caracteres.
- [x] 1.3 Migración `0013_frameworks`, reversible (D2, D4). Se verifica aplicándola, revirtiendo a `0011` y volviendo a aplicar, con fotos SQL de entrevistas y catálogo: la reversión restaura exactamente el estado de `0011`, y reaplicar da el mismo resultado; las entrevistas solo cambian por el renombre de "C# .NET" de Escritorio.
- [x] 1.4 Exponer `grupo` en `TecnologiaDePuestoSerializer` y actualizar los tests: conteos, `backend_python` → `backend_django`, `full_stack_node` → `full_stack_express`, tests nuevos de frameworks por puesto, de agrupación y de que una tecnología retirada da 400. Se verifica con `python manage.py test` completo en verde.

## 2. Frontend

- [x] 2.1 Agregar `grupo` a `TecnologiaDePuesto`, crear `agruparPorGrupo` en `seleccion.ts` con su test y mostrar los rótulos de grupo en `EleccionDeTecnologia`. Se verifica con `tsc`, `pnpm test`, `pnpm run lint` (sin avisos nuevos) y `pnpm run build`.

## 3. Documentación y prueba manual

- [x] 3.1 Actualizar en `CLAUDE.md` el conteo de tecnologías, el campo `grupo` y el criterio "dividir desactiva, precisar renombra". Se verifica releyendo el texto contra `datos.py`.
- [ ] 3.2 Prueba manual en el navegador: Backend agrupado por lenguaje, Full Stack con las dos capas, QA por tipo y Frontend sin grupos; iniciar una entrevista con Django y ver "Django" en la cabecera. Si no se puede ejecutar, queda **sin marcar**.
