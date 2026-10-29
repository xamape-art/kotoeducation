// Restores a daily backup folder (one JSON file per table, downloaded from Drive) into Supabase.
//
//   node scripts/backup/restaurar.mjs <carpeta-de-la-copia>              -> only shows what it would do
//   node scripts/backup/restaurar.mjs <carpeta-de-la-copia> --confirmar  -> writes to the database
//
// Rows are inserted or updated by id ("upsert"); rows that exist now but not in the backup are left alone.
// Needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local.
import { createClient } from '@supabase/supabase-js'
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'

// Parents before children, so foreign keys are satisfied
const ORDER = [
  'clients', 'services', 'pets', 'appointments', 'income', 'expenses', 'invoices',
  'products', 'shop_settings', 'orders', 'gallery_photos', 'contact_requests', 'walk_reports', 'agenda_events',
]
// Columns the database generates itself and won't accept on insert/update
const GENERATED = { orders: ['number'] }

const [dir, flag] = process.argv.slice(2)
if (!dir || !existsSync(dir)) {
  console.error('Uso: node scripts/backup/restaurar.mjs <carpeta-de-la-copia> [--confirmar]')
  process.exit(1)
}
const write = flag === '--confirmar'

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8')
    .split(/\r?\n/)
    .filter((l) => l.includes('=') && !l.startsWith('#'))
    .map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1).replace(/^"|"$/g, '')])
)
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

const files = readdirSync(dir).filter((f) => f.endsWith('.json')).map((f) => f.slice(0, -5))
const tables = [...ORDER.filter((t) => files.includes(t)), ...files.filter((t) => !ORDER.includes(t))]

console.log(write ? 'Restaurando en la base de datos...' : 'Simulación (añade --confirmar para escribir):')
for (const table of tables) {
  const rows = JSON.parse(readFileSync(join(dir, table + '.json'), 'utf8')).map((row) => {
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
if (files.includes('orders')) {
  console.log('\nNota: los pedidos que no existan ahora recibirán un número de pedido nuevo (lo genera la base de datos).')
}
