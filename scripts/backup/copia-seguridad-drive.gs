/**
 * Koto Education - Copia de seguridad diaria en Google Drive
 *
 * Runs inside Google Apps Script (script.google.com) with the kotoeducation@gmail.com account.
 * Every night it saves every table of the Supabase database (clients, pets, appointments,
 * invoices, accounting, agenda, shop...) into Drive, plus any new photo from Storage.
 *
 * Drive layout:
 *   Koto Education - Copias de seguridad/
 *     2026-10-30/                       one folder per day, JSON per table (used to restore)
 *     Copia 2026-10-30 (hoja)           the same data as a spreadsheet, one tab per table
 *     Fotos/                            photos from Storage, copied once
 *
 * Daily copies are kept for KEEP_DAYS days; the copy of the 1st of each month is kept forever.
 * Setup instructions: scripts/backup/LEEME.md
 */

const ROOT_FOLDER = 'Koto Education - Copias de seguridad'
const PHOTOS_FOLDER = 'Fotos'
const PHOTO_BUCKETS = ['gallery']
const KEEP_DAYS = 30
const TIME_ZONE = 'Europe/Madrid'
const PAGE_SIZE = 1000

function config_() {
  const props = PropertiesService.getScriptProperties()
  const url = props.getProperty('SUPABASE_URL')
  const key = props.getProperty('SUPABASE_SERVICE_ROLE_KEY')
  if (!url || !key) throw new Error('Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en las propiedades del script.')
  return { url: url.replace(/\/$/, ''), key }
}

function headers_(key, extra) {
  return Object.assign({ apikey: key, Authorization: 'Bearer ' + key }, extra || {})
}

function fetchJson_(url, options) {
  const res = UrlFetchApp.fetch(url, Object.assign({ muteHttpExceptions: true }, options))
  const code = res.getResponseCode()
  if (code >= 300) throw new Error(code + ' en ' + url + ': ' + res.getContentText().slice(0, 300))
  return JSON.parse(res.getContentText())
}

// Every table exposed by the API, so new tables are included automatically
function listTables_(cfg) {
  const spec = fetchJson_(cfg.url + '/rest/v1/', { headers: headers_(cfg.key) })
  return Object.keys(spec.definitions || {}).sort()
}

function fetchTable_(cfg, table) {
  const rows = []
  for (let from = 0; ; from += PAGE_SIZE) {
    const page = fetchJson_(cfg.url + '/rest/v1/' + encodeURIComponent(table) + '?select=*', {
      headers: headers_(cfg.key, { 'Range-Unit': 'items', Range: from + '-' + (from + PAGE_SIZE - 1) }),
    })
    rows.push.apply(rows, page)
    if (page.length < PAGE_SIZE) return rows
  }
}

function getOrCreateFolder_(parent, name) {
  const it = parent.getFoldersByName(name)
  return it.hasNext() ? it.next() : parent.createFolder(name)
}

function rootFolder_() {
  const it = DriveApp.getFoldersByName(ROOT_FOLDER)
  return it.hasNext() ? it.next() : DriveApp.createFolder(ROOT_FOLDER)
}

function cellValue_(v) {
  if (v === null || v === undefined) return ''
  if (typeof v === 'object') return JSON.stringify(v)
  return v
}

function writeSpreadsheet_(root, name, data) {
  const ss = SpreadsheetApp.create(name)
  const first = ss.getSheets()[0]
  Object.keys(data).forEach(function (table, i) {
    const rows = data[table]
    const sheet = i === 0 ? first.setName(table) : ss.insertSheet(table)
    const cols = rows.length ? Object.keys(rows[0]) : ['(vacía)']
    const values = [cols].concat(rows.map(function (r) { return cols.map(function (c) { return cellValue_(r[c]) }) }))
    sheet.getRange(1, 1, values.length, cols.length).setValues(values)
    sheet.setFrozenRows(1)
    sheet.getRange(1, 1, 1, cols.length).setFontWeight('bold')
  })
  DriveApp.getFileById(ss.getId()).moveTo(root)
}

function backupPhotos_(cfg, root) {
  const photos = getOrCreateFolder_(root, PHOTOS_FOLDER)
  let copied = 0
  PHOTO_BUCKETS.forEach(function (bucket) {
    const folder = getOrCreateFolder_(photos, bucket)
    const walk = function (prefix) {
      for (let offset = 0; ; offset += 100) {
        const items = fetchJson_(cfg.url + '/storage/v1/object/list/' + bucket, {
          method: 'post',
          contentType: 'application/json',
          headers: headers_(cfg.key),
          payload: JSON.stringify({ prefix: prefix, limit: 100, offset: offset, sortBy: { column: 'name', order: 'asc' } }),
        })
        items.forEach(function (item) {
          const path = prefix + item.name
          if (!item.id) return walk(path + '/') // sub-folder
          const fileName = path.replace(/\//g, '__')
          if (folder.getFilesByName(fileName).hasNext()) return
          const res = UrlFetchApp.fetch(cfg.url + '/storage/v1/object/' + bucket + '/' + path, {
            headers: headers_(cfg.key),
            muteHttpExceptions: true,
          })
          if (res.getResponseCode() === 200) {
            folder.createFile(res.getBlob().setName(fileName))
            copied++
          }
        })
        if (items.length < 100) return
      }
    }
    walk('')
  })
  return copied
}

// Keep the last KEEP_DAYS daily copies and every copy from the 1st of a month
function cleanOldCopies_(root) {
  const limit = Utilities.formatDate(new Date(Date.now() - KEEP_DAYS * 86400000), TIME_ZONE, 'yyyy-MM-dd')
  const isOld = function (day) { return day < limit && day.slice(8) !== '01' }

  const folders = root.getFolders()
  while (folders.hasNext()) {
    const f = folders.next()
    if (/^\d{4}-\d{2}-\d{2}$/.test(f.getName()) && isOld(f.getName())) f.setTrashed(true)
  }
  const files = root.getFiles()
  while (files.hasNext()) {
    const f = files.next()
    const m = f.getName().match(/^Copia (\d{4}-\d{2}-\d{2})/)
    if (m && isOld(m[1])) f.setTrashed(true)
  }
}

/** Main job: run by the daily trigger (or by hand to test). */
function copiaDeSeguridad() {
  const cfg = config_()
  const root = rootFolder_()
  const day = Utilities.formatDate(new Date(), TIME_ZONE, 'yyyy-MM-dd')

  // Re-running the same day replaces that day's copy
  const existing = root.getFoldersByName(day)
  while (existing.hasNext()) existing.next().setTrashed(true)
  const sameDaySheets = root.getFilesByName('Copia ' + day + ' (hoja)')
  while (sameDaySheets.hasNext()) sameDaySheets.next().setTrashed(true)

  const dayFolder = root.createFolder(day)
  const data = {}
  const summary = []
  listTables_(cfg).forEach(function (table) {
    const rows = fetchTable_(cfg, table)
    data[table] = rows
    dayFolder.createFile(table + '.json', JSON.stringify(rows, null, 1), 'application/json')
    summary.push(table + ': ' + rows.length)
  })
  dayFolder.createFile(
    '_resumen.txt',
    'Copia de seguridad de Koto Education\nFecha: ' + new Date().toISOString() + '\n\n' + summary.join('\n'),
    'text/plain'
  )

  writeSpreadsheet_(root, 'Copia ' + day + ' (hoja)', data)
  const photos = backupPhotos_(cfg, root)
  cleanOldCopies_(root)
  console.log('Copia ' + day + ' hecha. ' + summary.join(', ') + '. Fotos nuevas: ' + photos)
}

/** Run once after pasting the script: creates the nightly trigger and makes a first copy. */
function instalar() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'copiaDeSeguridad') ScriptApp.deleteTrigger(t)
  })
  ScriptApp.newTrigger('copiaDeSeguridad').timeBased().everyDays(1).atHour(3).inTimezone(TIME_ZONE).create()
  copiaDeSeguridad()
}
