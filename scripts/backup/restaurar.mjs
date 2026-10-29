// Restores a backup into Supabase. Accepts either:
//   - the copia-AAAA-MM-DD.json file from the nightly email or the "Copia" button, or
//   - a daily folder from Google Drive (one JSON file per table).
//
//   node scripts/backup/restaurar.mjs <archivo.json | carpeta>              -> only shows what it would do
//   node scripts/backup/restaurar.mjs <archivo.json | carpeta> --confirmar  -> writes to the database
//
// Rows are inserted or updated by id ("upsert"); rows that exist now but not in the backup are left alone.
// Needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local.
import { createClient } from '@supabase/supabase-js'
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs'
import { join } from 'node:path'

// Parents before children, so foreign keys are satisfied
const ORDER = [
  'clients', 'services', 'pets', 'appointments', 'income', 'expenses', 'invoices',
  'products', 'shop_settings', 'orders', 'gallery_photos', 'contact_requests', 'walk_reports', 'agenda_events',
]
// Columns the database generates itself and won't accept on insert/update
const GENERATED = { orders: ['number'] }

const [source, flag] = process.argv.slice(2)
if (!source || !existsSync(source)) {
  console.error('Uso: node scripts/backup/restaurar.mjs <archivo.json | carpeta> [--confirmar]')
  process.exit(1)
}
const write = flag === '--confirmar'

// { table: rows[] } from either backup format
function loadBackup(path) {
  if (statSync(path).isDirectory()) {
    return Object.fromEntries(
      readdirSync(path)
        .filter((f) => f.endsWith('.json'))
        .map((f) => [f.slice(0, -5), JSON.parse(readFileSync(join(path, f), 'utf8'))])
    )
  }
  const parsed = JSON.parse(readFileSync(path, 'utf8'))
  if (!parsed.tables) throw new Error('El archivo no parece una copia de Koto Education (falta "tables").')
  console.log(`Copia del ${parsed.date}`)
  return parsed.tables
}

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8')
    .split(/\r?\n/)
    .filter((l) => l.includes('=') && !l.startsWith('#'))
    .map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1).replace(/^"|"$/g, '')])
)
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

const backup = loadBackup(source)
const names = Object.keys(backup)
const tables = [...ORDER.filter((t) => names.includes(t)), ...names.filter((t) => !ORDER.includes(t))]

console.log(write ? 'Restaurando en la base de datos...' : 'Simulación (añade --confirmar para escribir):')
for (const table of tables) {
  const rows = backup[table].map((row) => {
    const copy = { ...row }
    for (const col of GENERATED[table] || []) delete copy[col]
    return copy
  })
  if (!write || rows.length === 0) {
    console.log(`  ${table}: ${rows.length} filas`)
    continue
  }
  for (let i = 0; i < rows.length; i += 500) {
    const { error } = await supabase.from(table).upsert(rows.slice(i, i + 500), { onConflict: 'id' })
    if (error) {
      console.error(`  ${table}: ERROR ${error.message}`)
      process.exit(1)
    }
  }
  console.log(`  ${table}: ${rows.length} filas restauradas`)
}
if (names.includes('orders')) {
  console.log('\nNota: los pedidos que no existan ahora recibirán un número de pedido nuevo (lo genera la base de datos).')
}
