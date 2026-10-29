import ExcelJS from 'exceljs'
import { createAdminClient } from '@/lib/supabase/admin'
import { TRASH_PREFIX, TRASH_DAYS, trashedAt } from '@/lib/photo-trash'

// Spanish sheet names for the known tables; any new table is included with its own name
const TABLE_LABELS: Record<string, string> = {
  clients: 'Clientes',
  pets: 'Mascotas',
  appointments: 'Citas',
  agenda_events: 'Agenda',
  services: 'Tarifas',
  invoices: 'Facturas',
  income: 'Ingresos',
  expenses: 'Gastos',
  products: 'Productos tienda',
  orders: 'Pedidos tienda',
  shop_settings: 'Ajustes tienda',
  gallery_photos: 'Galería',
  contact_requests: 'Solicitudes contacto',
  walk_reports: 'Informes paseos',
}

const PAGE_SIZE = 1000

export type BackupData = Record<string, Record<string, unknown>[]>

// Every table exposed by the API, read in full with the service role (bypasses RLS)
async function listTables() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`, {
    headers: {
      apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
    },
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`No se pudo leer la lista de tablas (${res.status})`)
  const spec = await res.json()
  return Object.keys(spec.definitions || {}).sort()
}

export async function fetchBackupData(): Promise<BackupData> {
  const supabase = createAdminClient()
  const data: BackupData = {}
  for (const table of await listTables()) {
    const rows: Record<string, unknown>[] = []
    for (let from = 0; ; from += PAGE_SIZE) {
      const { data: page, error } = await supabase
        .from(table)
        .select('*')
        .range(from, from + PAGE_SIZE - 1)
      if (error) throw new Error(`Error leyendo ${table}: ${error.message}`)
      rows.push(...(page || []))
      if (!page || page.length < PAGE_SIZE) break
    }
    data[table] = rows
  }
  return data
}

const cell = (v: unknown) => (v !== null && typeof v === 'object' ? JSON.stringify(v) : (v as ExcelJS.CellValue))

// One sheet per table, known tables first and in a sensible order
export async function buildBackupWorkbook(data: BackupData, date: string) {
  const wb = new ExcelJS.Workbook()
  wb.creator = 'Koto Education'
  wb.created = new Date()

  const tables = [
    ...Object.keys(TABLE_LABELS).filter((t) => t in data),
    ...Object.keys(data).filter((t) => !(t in TABLE_LABELS)),
  ]

  const summary = wb.addWorksheet('Resumen')
  summary.addRows([
    ['Copia de seguridad de Koto Education'],
    ['Fecha', date],
    [],
    ['Tabla', 'Registros'],
    ...tables.map((t) => [TABLE_LABELS[t] || t, data[t].length]),
  ])
  summary.getRow(1).font = { bold: true, size: 14 }
  summary.getRow(4).font = { bold: true }
  summary.getColumn(1).width = 24

  for (const table of tables) {
    const rows = data[table]
    const sheet = wb.addWorksheet((TABLE_LABELS[table] || table).slice(0, 31))
    const cols = rows.length ? Object.keys(rows[0]) : ['(sin datos)']
    sheet.addRow(cols).font = { bold: true }
    rows.forEach((r) => sheet.addRow(cols.map((c) => cell(r[c]))))
    sheet.views = [{ state: 'frozen', ySplit: 1 }]
    cols.forEach((c, i) => {
      sheet.getColumn(i + 1).width = Math.min(40, Math.max(10, c.length + 2))
    })
  }

  return Buffer.from(await wb.xlsx.writeBuffer())
}

export function backupSummary(data: BackupData) {
  return Object.keys(TABLE_LABELS)
    .filter((t) => t in data)
    .map((t) => `${TABLE_LABELS[t]}: ${data[t].length}`)
}

// ─── Photos (Storage is not included in Supabase's own backups) ─────────────

export const PHOTO_BUCKET = 'gallery'
// Gmail accepts up to 25 MB per email; attachments grow ~35% when encoded
const MAX_EMAIL_BYTES = 17 * 1024 * 1024

type StoredFile = { path: string; createdAt: string; size: number }

async function listFiles(prefix = ''): Promise<StoredFile[]> {
  const storage = createAdminClient().storage.from(PHOTO_BUCKET)
  const files: StoredFile[] = []
  for (let offset = 0; ; offset += 100) {
    const { data, error } = await storage.list(prefix, { limit: 100, offset, sortBy: { column: 'name', order: 'asc' } })
    if (error) throw new Error(`Error listando fotos: ${error.message}`)
    for (const item of data || []) {
      const path = prefix ? `${prefix}/${item.name}` : item.name
      if (!item.id) files.push(...(await listFiles(path))) // sub-folder
      else files.push({ path, createdAt: item.created_at || '', size: Number(item.metadata?.size) || 0 })
    }
    if (!data || data.length < 100) return files
  }
}

// Photos uploaded since `since`, grouped so each group fits in one email
export async function newPhotoBatches(since: Date) {
  const files = (await listFiles()).filter(
    (f) => !f.path.startsWith(TRASH_PREFIX) && new Date(f.createdAt) > since
  )
  const tooBig = files.filter((f) => f.size > MAX_EMAIL_BYTES)
  const batches: StoredFile[][] = []
  let current: StoredFile[] = []
  let currentSize = 0
  for (const f of files.filter((f) => f.size <= MAX_EMAIL_BYTES)) {
    if (current.length && currentSize + f.size > MAX_EMAIL_BYTES) {
      batches.push(current)
      current = []
      currentSize = 0
    }
    current.push(f)
    currentSize += f.size
  }
  if (current.length) batches.push(current)
  return { batches, tooBig }
}

export async function downloadPhoto(path: string) {
  const { data, error } = await createAdminClient().storage.from(PHOTO_BUCKET).download(path)
  if (error) throw new Error(`Error descargando ${path}: ${error.message}`)
  return Buffer.from(await data.arrayBuffer())
}

// Permanently delete trashed photos older than TRASH_DAYS
export async function emptyOldTrash() {
  const limit = Date.now() - TRASH_DAYS * 86400000
  const old = (await listFiles(TRASH_PREFIX.slice(0, -1))).filter((f) => {
    const at = trashedAt(f.path.slice(TRASH_PREFIX.length))
    return at && at.getTime() < limit
  })
  if (old.length) {
    const { error } = await createAdminClient().storage.from(PHOTO_BUCKET).remove(old.map((f) => f.path))
    if (error) throw new Error(`Error vaciando la papelera: ${error.message}`)
  }
  return old.length
}

export function todayInSpain() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Madrid' }).format(new Date())
}
