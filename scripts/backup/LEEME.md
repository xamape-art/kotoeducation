# Copias de seguridad en Google Drive

Cada noche, a las 3:00, se guarda en Google Drive una copia completa de la base de datos de Koto Education. Incluye clientes, mascotas, citas, agenda, tarifas, facturas, contabilidad, tienda y pedidos, y también las fotos.

## Qué se guarda y dónde

En el Drive de **kotoeducation@gmail.com** se crea la carpeta **Koto Education - Copias de seguridad**:

| Qué | Para qué |
|---|---|
| `2026-10-30/` (una carpeta por día) | Un archivo `.json` por tabla y un `_resumen.txt` con cuántos registros hay. Es lo que se usa para restaurar. |
| `Copia 2026-10-30 (hoja)` | Los mismos datos en una hoja de cálculo, con una pestaña por tabla, para consultarlos a mano. |
| `Fotos/` | Las fotos de la galería y de las mascotas. Cada foto se copia una sola vez. |

Se guardan las copias de los **últimos 30 días** y, para siempre, la del **día 1 de cada mes**. Las demás van a la papelera de Drive.

> ⚠️ Esta carpeta contiene datos personales de los clientes: nombres, teléfonos, direcciones y NIF. **No la compartáis con nadie.**

## Instalación (una sola vez, unos 10 minutos)

Hacedlo con la cuenta **kotoeducation@gmail.com**, porque las copias se guardan en el Drive de quien instala el script.

1. Entrad en **https://script.google.com** y pulsad **Nuevo proyecto**.
2. Arriba a la izquierda, cambiad el nombre "Proyecto sin título" por **Copia de seguridad Koto**.
3. Borrad todo lo que haya en el editor y pegad el contenido completo de `scripts/backup/copia-seguridad-drive.gs`. Pulsad el icono de guardar 💾.
4. En el menú de la izquierda, entrad en **Configuración del proyecto** (⚙️). Al final de la página, en **Propiedades del script**, pulsad **Añadir propiedad del script** y cread estas dos:
   - `SUPABASE_URL`: el valor de `NEXT_PUBLIC_SUPABASE_URL` del archivo `.env.local`.
   - `SUPABASE_SERVICE_ROLE_KEY`: el valor de `SUPABASE_SERVICE_ROLE_KEY` del mismo archivo.

   También están en Supabase, en **Project Settings → API**. Pulsad **Guardar propiedades del script**.
5. Volved al **Editor** (`< >`). En el desplegable de funciones de la barra de arriba, elegid **instalar** y pulsad **Ejecutar**.
6. Google pedirá permisos. Pulsad **Revisar permisos**, elegid la cuenta y, si sale "Google no ha verificado esta aplicación", pulsad **Configuración avanzada → Ir a Copia de seguridad Koto** y después **Permitir**. Es normal: el script es vuestro y solo accede a vuestro Drive y a Supabase.
7. Esperad a que el registro de abajo diga "Copia ... hecha". Abrid Drive y comprobad que existe la carpeta **Koto Education - Copias de seguridad**.

A partir de ahí se ejecuta sola cada noche.

### Para enteraros si algún día falla

En el menú de la izquierda, entrad en **Activadores** (⏰), pulsad los tres puntos del activador `copiaDeSeguridad` → **Editar** y, en **Configuración de notificación de errores**, elegid **Notificarme inmediatamente**. Si una copia falla, llegará un correo a kotoeducation@gmail.com.

## Hacer una copia en cualquier momento

En script.google.com, abrid el proyecto, elegid **copiaDeSeguridad** en el desplegable y pulsad **Ejecutar**. Si ya había una copia de ese día, se sustituye.

## Restaurar una copia

Esto solo hace falta si se pierden o se estropean datos. Lo hace alguien con el proyecto descargado en su ordenador.

1. En Drive, descargad la carpeta del día que queráis recuperar (por ejemplo `2026-10-30`) y descomprimidla.
2. Desde la carpeta del proyecto, ejecutad primero la simulación, que no escribe nada:
   ```
   node scripts/backup/restaurar.mjs "C:\ruta\a\2026-10-30"
   ```
   Muestra cuántos registros hay de cada tabla.
3. Si todo cuadra, restaurad de verdad:
   ```
   node scripts/backup/restaurar.mjs "C:\ruta\a\2026-10-30" --confirmar
   ```

La restauración **recupera o sobrescribe** los registros que hay en la copia, pero **no borra** los que se hayan creado después. Las fotos se recuperan aparte, desde la carpeta `Fotos/` de Drive.

## Seguridad de la clave

`SUPABASE_SERVICE_ROLE_KEY` es la llave maestra de la base de datos. Solo debe estar en las propiedades del script, nunca pegada en el código ni en un documento compartido. Si alguna vez se filtra, cambiadla en Supabase (**Project Settings → API**) y actualizadla aquí y en la web.
