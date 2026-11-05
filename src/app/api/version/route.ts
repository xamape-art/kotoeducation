// The stamp of the deployment that is serving right now; open tabs compare it with their own
export const dynamic = 'force-dynamic'

export function GET() {
  return Response.json(
    { stamp: process.env.NEXT_PUBLIC_BUILD_STAMP },
    { headers: { 'Cache-Control': 'no-store, max-age=0' } }
  )
}
