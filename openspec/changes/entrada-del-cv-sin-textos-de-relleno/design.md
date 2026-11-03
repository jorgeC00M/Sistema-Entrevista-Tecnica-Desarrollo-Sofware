## Context

`cv-critica-p1` agregó bajo `ZonaDeArchivo`, en la tarjeta «Tu CV» de `EntradaDelAnalisis`, una nota de privacidad de dos líneas con el icono `candado`. `CampoConvocatoria` tiene, bajo el `textarea`, un `<p id="convocatoria-instruccion">` enlazado con `aria-describedby`. Ese párrafo se agregó visible porque el placeholder desaparece al pegar.

## Goals / Non-Goals

**Goals:**
- Ganar alto en la entrada sin perder la garantía de privacidad ni el consejo sobre los títulos.

**Non-Goals:**
- Cambiar qué se envía a la IA, el texto de «PDF o DOCX…» o la frase de la tarjeta «Convocatoria».

## Decisions

**D1. La privacidad se acorta, no se borra.**
- El usuario sube su CV real, con nombre, teléfono y dirección. Decir que el archivo no se guarda y que sus datos de contacto no van a la IA responde a la pregunta que se hace antes de subirlo.
- Es verdad comprobada: no hay `FileField`, y `anonimizar.py` enmascara nombre, correo y teléfono.
- «Datos de contacto» es más preciso que «datos personales»: lo que se tapa es el nombre, el correo y el teléfono (y el encabezado no se envía), no todo dato personal posible.

**D2. El consejo pasa al placeholder.**
- El consejo sirve antes de pegar: le dice al usuario qué copiar.
- Después de pegar ya no cambia nada, porque el texto está puesto. El placeholder se ve exactamente en ese momento.
- Se pierde el anuncio por `aria-describedby`, pero el lector de pantalla también lee el placeholder de un campo vacío.
- *Alternativa descartada:* borrarlo del todo. Sin los títulos, `convocatoria.partir()` trata los deseables como obligatorios, y el resultado cambia.

## Risks / Trade-offs

- **[Riesgo]** Quien vuelve con texto ya pegado no ve el consejo. → **Mitigación:** ya lo vio la primera vez. Si su resultado mezcla deseables y obligatorios, «Frente a este aviso» ya separa obligatorias y deseables según lo que detectó.
