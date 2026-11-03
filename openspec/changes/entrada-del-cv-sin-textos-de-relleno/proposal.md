## Why

En la entrada de «Revisar mi CV» hay dos textos que Jorge ve como relleno:
- la nota de privacidad bajo «Tu CV», que ocupa dos líneas;
- un párrafo bajo el cuadro de la convocatoria: «Si la oferta separa requisitos de deseables, conserva esos títulos…».

Los dos ocupan alto. Sin embargo, ninguno es inútil:
- la nota de privacidad es una garantía verdadera sobre un CV real;
- el consejo evita que los deseables se midan como obligatorios.

Jorge aprobó reducirlos en vez de borrarlos.

## What Changes

- **Nota de privacidad en una línea:** «No guardamos tu archivo ni enviamos tus datos de contacto a la IA.», con el candado. Reemplaza a «No guardamos el archivo, solo el texto. A la IA llegan solo secciones de tu CV, con tu nombre, correo y teléfono tapados.».
- **Consejo de la convocatoria en el placeholder:** se borra el párrafo bajo el cuadro de texto y el placeholder pasa a decir «Pega aquí el aviso completo, con sus títulos de requisitos y deseables.».
- **Código muerto:** el `aria-describedby="convocatoria-instruccion"` del cuadro apuntaba a ese párrafo y se quita.

## Capabilities

### New Capabilities
- `revision-de-cv`: el texto de privacidad y el consejo de la convocatoria en la entrada. La capacidad aún no tiene spec principal, así que la delta es ADDED, como en los cambios anteriores.

### Modified Capabilities

## Impact

- **Frontend:** `features/curriculum/components/EntradaDelAnalisis.tsx` y `CampoConvocatoria.tsx`.
- **Specs:** la delta de `cv-critica-p1`, sin archivar, describe la nota larga. Se ajusta para que no contradiga este cambio.
- **Documentación:** `CLAUDE.md`.
- **Sin cambios** en el backend ni en lo que se envía a la IA. La garantía sigue siendo verdadera: `revision.py` y `anonimizar.py` no cambian.
