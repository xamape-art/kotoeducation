import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/admin'
import { fetchBackupData, buildBackupWorkbook, todayInSpain } from '@/lib/backup'

export const maxDuration = 60

// Admin only: download a backup now. ?formato=json gives the file used to restore.
export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getUser()
  if (!isAdmin(auth.user)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const date = todayInSpain()
  const data = await fetchBackupData()

  if (new URL(request.url).searchParams.get('formato') === 'json') {
    return new NextResponse(JSON.stringify({ date, tables: data }), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="copia-${date}.json"`,
        'Cache-Control': 'no-store',
      },
    })
  }

  const xlsx = await buildBackupWorkbook(data, date)
  return new NextResponse(new Uint8Array(xlsx), {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="copia-${date}.xlsx"`,
      'Cache-Control': 'no-store',
    },
  })
}
