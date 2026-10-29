// Turns a Supabase/Postgres error into a message the admin can act on
export function dbErrorMessage(err: unknown, action = 'guardar') {
  const e = (err || {}) as { code?: string; message?: string }
  switch (e.code) {
    case '23503':
      return action === 'eliminar'
        ? 'No se puede eliminar porque tiene citas, facturas u otros registros asociados.'
        : 'Falta un dato relacionado (cliente, mascota o servicio) o ya no existe.'
    case '23505':
      return 'Ya existe un registro con esos datos.'
    case '23502':
      return 'Falta un campo obligatorio.'
    case '23514':
    case '22P02':
      return 'Algún valor no es válido. Revisa los campos del formulario.'
    case '42501':
      return 'No tienes permiso para hacer esto. Comprueba que has iniciado sesión con una cuenta de administrador.'
    case 'PGRST205':
    case '42P01':
    case '42703':
      return 'La base de datos no coincide con la aplicación. Avisa al desarrollador.'
  }
  if (e.message?.toLowerCase().includes('fetch')) {
    return 'No hay conexión. Comprueba internet e inténtalo de nuevo.'
  }
  return e.message ? `No se ha podido ${action}: ${e.message}` : `No se ha podido ${action}.`
}

// Shows the error to the admin and keeps the details in the console
export function alertDbError(err: unknown, action = 'guardar') {
  console.error(`Error al ${action}:`, err)
  alert(dbErrorMessage(err, action))
}
