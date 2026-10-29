import { NextResponse } from 'next/server'
import { timingSafeEqual } from 'node:crypto'
import { fetchBackupData, buildBackupWorkbook, backupSummary, todayInSpain } from '@/lib/backup'
import { sendEmail, emailLayout, OWNER_EMAIL } from '@/lib/email'

export const maxDuration = 60

// Only Vercel Cron may call this: it sends "Authorization: Bearer <CRON_SECRET>"
function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  const given = Buffer.from(request.headers.get('authorization') || '')
  const expected = Buffer.from(`Bearer ${secret}`)
  return given.length === expected.length && timingSafeEqual(given, expected)
}

// Nightly backup: emails every table as Excel (to read) and JSON (to restore) to the business account
export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const date = todayInSpain()
  try {
    const data = await fetchBackupData()
    const xlsx = await buildBackupWorkbook(data, date)
    const json = JSON.stringify({ date, tables: data })
    const summary = backupSummary(data)

    const sent = await sendEmail({
      to: OWNER_EMAIL,
      subject: `Copia de seguridad Koto Education · ${date}`,
      html: emailLayout(
        `Copia de seguridad del ${date.split('-').reverse().join('/')}`,
        `<p>Adjunta va la copia de todos los datos del panel:</p>
         <ul>${summary.map((s) => `<li>${s}</li>`).join('')}</ul>
         <p><strong>copia-${date}.xlsx</strong>: para consultar los datos en Excel o Google Sheets.<br>
         <strong>copia-${date}.json</strong>: para restaurar la base de datos si hiciera falta.</p>
         <p style="color:#999;font-size:12px">Contiene datos personales de clientes: no reenvíes este correo.</p>`
      ),
      attachments: [
        {
          filename: `copia-${date}.xlsx`,
          content: xlsx,
          contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
        { filename: `copia-${date}.json`, content: json, contentType: 'application/json' },
      ],
    })
    if (!sent) throw new Error('No se pudo enviar el correo')
    return NextResponse.json({ ok: true, date, summary })
  } catch (err) {
    console.error('Backup failed:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
