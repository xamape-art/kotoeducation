# Copias de seguridad

Koto Education tiene tres copias de seguridad que se complementan:

| | Qué guarda | Cuándo | Dónde |
|---|---|---|---|
| **1. Supabase Pro** | Toda la base de datos | Cada día, automático | En Supabase (últimos 7 días) |
| **2. Correo nocturno** | Todos los datos en Excel + archivo para restaurar | Cada noche, automático | Gmail de kotoeducation@gmail.com |
| **3. Botón "Copia"** | Todos los datos en Excel | Cuando queráis | Se descarga en vuestro ordenador |

> ⚠️ Las copias contienen datos personales de los clientes: nombres, teléfonos, direcciones y NIF. No reenviéis los correos de copia ni compartáis los archivos.

## 1. Copias automáticas de Supabase (ya activas)

Con el plan Pro, Supabase hace una copia diaria de la base de datos y guarda los últimos 7 días. No hay que hacer nada.

**Para restaurar:** en [supabase.com/dashboard](https://supabase.com/dashboard), entrad en el proyecto → **Database** → **Backups**, elegid el día y pulsad **Restore**. El proyecto vuelve al estado de ese día: **se pierde todo lo que se hizo después**, así que usadlo solo si se ha perdido algo importante.

Estas copias **no incluyen las fotos** (galería y mascotas). Mirad el apartado "Fotos" más abajo.

## 2. Copia diaria por correo

Cada noche, hacia las 3:00 o 4:00 (hora de España), la web envía a **kotoeducation@gmail.com** un correo titulado "Copia de seguridad Koto Education · fecha" con dos archivos:

- `copia-AAAA-MM-DD.xlsx`: todos los datos en Excel, con una hoja por apartado (Clientes, Mascotas, Citas, Agenda, Tarifas, Facturas, Ingresos, Gastos...). Se abre con Excel o con Google Sheets.
- `copia-AAAA-MM-DD.json`: el mismo contenido, para restaurar la base de datos si hiciera falta.

Consejo: en Gmail, cread un filtro para que estos correos vayan a una etiqueta "Copias" y no llenen la bandeja de entrada.

### Activarlo (una sola vez)

En [vercel.com](https://vercel.com), entrad en el proyecto **kotoeducation** → **Settings** → **Environment Variables**:

1. Añadid **`CRON_SECRET`** con una clave larga e inventada (por ejemplo, 40 letras y números al azar). Sirve para que solo Vercel pueda pedir la copia.
2. Comprobad que existen **`GMAIL_USER`** y **`GMAIL_APP_PASSWORD`**. Son los mismos que usa la tienda para enviar correos. Si no están, copiadlos del archivo `.env.local`.
3. Comprobad que existe **`SUPABASE_SERVICE_ROLE_KEY`**.
4. Volved a publicar la web (**Deployments** → los tres puntos del último → **Redeploy**) para que lea las variables nuevas.

Para comprobar que funciona sin esperar a la noche: **Settings** → **Cron Jobs** → en `/api/backup/cron`, pulsad **Run**. Debería llegar el correo en un minuto.

## 3. Botón "Copia" del panel

En la barra de arriba del panel, junto a "Contraseña" y "Salir", el botón **Copia** descarga al momento un Excel con todos los datos. Es útil antes de presentar el IVA, al cerrar el año o antes de un cambio grande. Solo funciona con sesión de administrador.

## Restaurar desde un archivo de copia

Si solo hay que recuperar unos pocos datos, lo más fácil es abrir el Excel y copiarlos a mano en el panel.

Para restaurar todo desde el archivo `.json` del correo, lo hace alguien con el proyecto descargado en su ordenador:

1. Simulación (no escribe nada, solo muestra cuántos registros hay):
   ```
   node scripts/backup/restaurar.mjs "C:\ruta\a\copia-2026-10-30.json"
   ```
2. Restauración de verdad:
   ```
   node scripts/backup/restaurar.mjs "C:\ruta\a\copia-2026-10-30.json" --confirmar
   ```

La restauración **recupera o sobrescribe** los registros que hay en la copia, pero **no borra** los que se hayan creado después.

## Fotos (opcional)

Las fotos están guardadas en Supabase Storage, pero ninguna de las copias anteriores las incluye. Si queréis una copia de las fotos en Google Drive, existe el script `copia-seguridad-drive.gs` (Google Apps Script). Se instala una vez desde la cuenta de Google, en script.google.com:

1. Nuevo proyecto → pegad el contenido de `copia-seguridad-drive.gs` → guardad.
2. **Configuración del proyecto** → **Propiedades del script** → añadid `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` (los valores de `.env.local`).
3. En el editor, elegid la función **instalar** → **Ejecutar** → aceptad los permisos. Si sale "Google no ha verificado esta aplicación", pulsad **Configuración avanzada** → **Ir a...** → **Permitir**.

Cada noche copia las fotos nuevas en la carpeta **Koto Education - Copias de seguridad/Fotos** de Drive y, de paso, guarda también una copia de los datos.

## Seguridad de la clave

`SUPABASE_SERVICE_ROLE_KEY` es la llave maestra de la base de datos. Solo debe estar en Vercel, en `.env.local` y, si usáis el script de fotos, en sus propiedades. Nunca la peguéis en un documento ni en un correo. Si alguna vez se filtra, cambiadla en Supabase (**Project Settings → API**) y actualizadla en todos esos sitios.
