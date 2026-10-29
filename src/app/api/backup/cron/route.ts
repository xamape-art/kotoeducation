import { NextResponse } from 'next/server'
import { timingSafeEqual } from 'node:crypto'
import {
  fetchBackupData,
  buildBackupWorkbook,
  backupSummary,
  todayInSpain,
  newPhotoBatches,
  downloadPhoto,
  emptyOldTrash,
} from '@/lib/backup'
import { sendEmail, emailLayout, OWNER_EMAIL } from '@/lib/email'

export const maxDuration = 300

// Photos uploaded in this window are emailed. A bit more than a day, so a cron that runs
// late never leaves a gap (a photo may arrive twice, never zero times).
const PHOTO_WINDOW_HOURS = 26

// Only Vercel Cron may call this: it sends "Authorization: Bearer <CRON_SECRET>"
function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  const given = Buffer.from(request.headers.get('authorization') || '')
  const expected = Buffer.from(`Bearer ${secret}`)
  return given.length === expected.length && timingSafeEqual(given, expected)
}

const uiDate = (date: string) => date.split('-').reverse().join('/')

async function emailData(date: string) {
  const data = await fetchBackupData()
  const xlsx = await buildBackupWorkbook(data, date)
  const summary = backupSummary(data)

  const sent = await sendEmail({
    to: OWNER_EMAIL,
    subject: `Copia de seguridad Koto Education · ${date}`,
    html: emailLayout(
      `Copia de seguridad del ${uiDate(date)}`,
      `<p>Adjunta va la copia de todos los datos del panel:</p>
       <ul>${summary.map((s) => `<li>${s}</li>`).join('')}</ul>
       <p><strong>copia-${date}.xlsx</strong>: para consultar los datos en Excel o Google Sheets.<br>
       <strong>copia-${date}.json</strong>: para restaurar la base de datos si hiciera falta.</p>
       <p>Si hoy se han subido fotos, llegan en otro correo "Fotos nuevas".</p>
       <p style="color:#999;font-size:12px">Contiene datos personales de clientes: no reenvíes este correo.</p>`
    ),
    attachments: [
      {
        filename: `copia-${date}.xlsx`,
        content: xlsx,
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
      { filename: `copia-${date}.json`, content: JSON.stringify({ date, tables: data }), contentType: 'application/json' },
    ],
  })
  if (!sent) throw new Error('No se pudo enviar el correo con los datos')
  return summary
}

async function emailNewPhotos(date: string) {
  const since = new Date(Date.now() - PHOTO_WINDOW_HOURS * 3600000)
  const { batches, tooBig } = await newPhotoBatches(since)

  for (const [i, batch] of batches.entries()) {
    const attachments = []
    for (const f of batch) {
      // Keep the folder in the name (e.g. pets__<client>__foto.jpg) so it can be put back in place
      attachments.push({ filename: f.path.replace(/\//g, '__'), content: await downloadPhoto(f.path) })
    }
    const part = batches.length > 1 ? ` (${i + 1} de ${batches.length})` : ''
    const note =
      i === 0 && tooBig.length
        ? `<p>Estas fotos pesan demasiado para el correo y no van adjuntas (siguen guardadas en Supabase): ${tooBig
            .map((f) => f.path)
            .join(', ')}</p>`
        : ''
    const sent = await sendEmail({
      to: OWNER_EMAIL,
      subject: `Fotos nuevas Koto Education · ${date}${part}`,
      html: emailLayout(
        `Fotos nuevas del ${uiDate(date)}${part}`,
        `<p>Copia de las ${batch.length} foto(s) subidas a la galería, a las mascotas o a la tienda.</p>${note}`
      ),
      attachments,
    })
    if (!sent) throw new Error(`No se pudo enviar el correo de fotos${part}`)
  }
  return { emails: batches.length, photos: batches.flat().length, tooBig: tooBig.length }
}

// Nightly backup: data as Excel + JSON, new photos, and emptying the photo trash
export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const date = todayInSpain()
  try {
    // Data first: a problem with the photos must never cost us the data copy
    const summary = await emailData(date)
    const photos = await emailNewPhotos(date)
    const trashEmptied = await emptyOldTrash()
    return NextResponse.json({ ok: true, date, summary, photos, trashEmptied })
  } catch (err) {
    console.error('Backup failed:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
