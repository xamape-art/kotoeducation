// Deleted photos are moved here instead of being removed, and kept for TRASH_DAYS days
export const TRASH_PREFIX = 'papelera/'
export const TRASH_DAYS = 30

// papelera/<deletion time in ms>__<original path with / replaced by __>
export function trashPath(path: string) {
  return `${TRASH_PREFIX}${Date.now()}__${path.replace(/\//g, '__')}`
}

// When a trashed file was deleted, from its name (null if the name isn't ours)
export function trashedAt(name: string) {
  const ms = Number(name.split('__')[0])
  return Number.isFinite(ms) && ms > 0 ? new Date(ms) : null
}
