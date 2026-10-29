# Copias de seguridad

| | Qué guarda | Cuándo | Dónde |
|---|---|---|---|
| **Supabase Pro** | Toda la base de datos | Cada día, automático | En Supabase (últimos 7 días) |
| **Correo nocturno** | Todos los datos (Excel + archivo para restaurar) y las fotos nuevas | Cada noche, automático | Gmail de kotoeducation@gmail.com |
| **Botón "Copia"** | Todos los datos en Excel | Cuando queráis | Se descarga en vuestro ordenador |
| **Papelera de fotos** | Las fotos borradas de la galería | 30 días | En Supabase |

> ⚠️ Las copias contienen datos personales de los clientes: nombres, teléfonos, direcciones y NIF. No reenviéis los correos de copia ni compartáis los archivos.

---

## Activar la copia por correo (una sola vez, unos 10 minutos)

Se hace en la web de Vercel, donde está publicada la app.

### Paso 1. Entrar en el proyecto

1. Entrad en **https://vercel.com** con la cuenta con la que se publicó la web.
2. En la lista de proyectos, pulsad **kotoeducation**.

### Paso 2. Añadir la clave de la copia (`CRON_SECRET`)

Es una contraseña inventada que solo conocen Vercel y la web. Sirve para que nadie más pueda pedir una copia.

1. Arriba, pulsad **Settings**. En el menú de la izquierda, **Environment Variables**.
2. Rellenad:
   - **Key**: `CRON_SECRET`
   - **Value**: una clave larga al azar, por ejemplo la que os haya dado Claude o 40 letras y números inventados. No hace falta apuntarla en ningún otro sitio.
   - **Environments**: dejad marcado **Production**, o todos.
3. Pulsad **Save**.

### Paso 3. Comprobar las demás variables

En esa misma lista de **Environment Variables** tienen que estar estas tres. Si falta alguna, añadidla igual que en el paso 2, copiando el valor del archivo `.env.local` del proyecto:

| Variable | Para qué |
|---|---|
| `GMAIL_USER` | La cuenta desde la que se envía el correo (kotoeducation@gmail.com) |
| `GMAIL_APP_PASSWORD` | La contraseña de aplicación de Gmail (no es la contraseña normal) |
| `SUPABASE_SERVICE_ROLE_KEY` | Permiso para leer todos los datos y fotos |

### Paso 4. Publicar la versión nueva

Las variables solo se aplican al publicar.

- Si Claude ya ha subido el código a GitHub después de añadir las variables, Vercel lo publica solo. Esperad a que en **Deployments** el último aparezca como **Ready**.
- Si el código ya estaba subido antes de añadir las variables: **Deployments** → en el primero de la lista, los tres puntos **⋯** → **Redeploy** → **Redeploy**.

### Paso 5. Probarlo sin esperar a la noche

1. **Settings** → en el menú de la izquierda, **Cron Jobs**.
2. Debe aparecer `/api/backup/cron` con el horario `0 2 * * *`, que es cada día a las 2:00 UTC: las 3:00 en invierno y las 4:00 en verano, hora de España.
3. Pulsad **Run**.
4. En uno o dos minutos llegará a kotoeducation@gmail.com un correo **"Copia de seguridad Koto Education · fecha"** con dos archivos, `.xlsx` y `.json`.

Si no llega:
- Mirad en **Spam**.
- En Vercel, pulsad **View Logs** junto al cron. Si pone `No autorizado`, falta `CRON_SECRET` o no se ha vuelto a publicar (paso 4). Si pone `No se pudo enviar el correo`, revisad `GMAIL_USER` y `GMAIL_APP_PASSWORD`.

### Paso 6 (recomendado). Ordenar los correos en Gmail

Para que las copias no llenen la bandeja de entrada:

1. En Gmail, buscad: `from:kotoeducation@gmail.com subject:(Copia de seguridad OR "Fotos nuevas")`
2. Pulsad el icono de opciones de búsqueda (a la derecha del buscador) → **Crear filtro**.
3. Marcad **Saltar Recibidos (Archivarlo)** y **Aplicar la etiqueta** → nueva etiqueta **Copias**. Pulsad **Crear filtro**.

Las copias quedarán en la etiqueta **Copias**, ordenadas por fecha.

---

## Qué llega cada noche

1. **"Copia de seguridad Koto Education · fecha"**, siempre:
   - `copia-AAAA-MM-DD.xlsx`: todos los datos, con una hoja por apartado (Clientes, Mascotas, Citas, Agenda, Tarifas, Facturas, Ingresos, Gastos...). Se abre con Excel o con Google Sheets.
   - `copia-AAAA-MM-DD.json`: lo mismo, para restaurar la base de datos.
2. **"Fotos nuevas Koto Education · fecha"**, solo si ese día se han subido fotos (galería, mascotas o tienda). Si pesan mucho, llegan en varios correos: "(1 de 2)", "(2 de 2)". Alguna foto puede llegar dos veces; es a propósito, para que ninguna se quede sin copia.

## Botón "Copia" del panel

En la barra de arriba del panel, junto a "Contraseña" y "Salir". Descarga al momento un Excel con todos los datos. Es útil antes de presentar el IVA o al cerrar el año.

## Papelera de fotos

Cuando se borra una foto de la galería, desaparece de la web, pero el archivo se guarda **30 días** en la papelera. Si fue un error, pedid a quien lleve la parte técnica que la recupere. También está en el correo "Fotos nuevas" del día en que se subió.

---

## Restaurar

**Unos pocos datos** (por ejemplo, un cliente borrado por error): abrid el Excel de la última copia y copiad los datos a mano en el panel.

**Una foto:** buscadla en Gmail, en los correos "Fotos nuevas", y volved a subirla.

**Todo, desde el archivo `.json`.** Lo hace alguien con el proyecto descargado en su ordenador:
```
node scripts/backup/restaurar.mjs "C:\ruta\a\copia-2026-10-30.json"              ← simulación, no escribe nada
node scripts/backup/restaurar.mjs "C:\ruta\a\copia-2026-10-30.json" --confirmar  ← restaura
```
Recupera o sobrescribe los registros de la copia, pero no borra los que se hayan creado después.

**Desastre total** (se ha borrado o estropeado mucho): en [supabase.com/dashboard](https://supabase.com/dashboard) → el proyecto → **Database** → **Backups** → elegid el día → **Restore**. Todo vuelve a ese día y **se pierde lo que se hizo después**. Durante unos minutos la web y el panel no funcionan. Las fotos no se ven afectadas: Supabase no las toca al restaurar.

## Seguridad de las claves

`SUPABASE_SERVICE_ROLE_KEY` es la llave maestra de la base de datos y `GMAIL_APP_PASSWORD` permite enviar correos desde vuestra cuenta. Solo deben estar en Vercel y en `.env.local`. Nunca las peguéis en un documento ni en un correo.
