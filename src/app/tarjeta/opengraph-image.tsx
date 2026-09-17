import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

export const alt = 'Koto Education · Educación canina y paseos en Terrassa'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  const logo = await readFile(join(process.cwd(), 'public/logo.png'))
  const logoSrc = `data:image/png;base64,${logo.toString('base64')}`

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', backgroundColor: '#DDB9A6' }}>
        <div style={{ width: 460, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F7EDE4' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoSrc} width={430} height={430} alt="" />
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 64px', color: '#2C1008' }}>
          <div style={{ fontSize: 64, fontWeight: 700, letterSpacing: 1 }}>KOTO EDUCATION</div>
          <div style={{ fontSize: 34, marginTop: 20 }}>Educación canina y paseos</div>
          <div style={{ fontSize: 34, marginTop: 6 }}>Cuidado de mascotas a domicilio</div>
          <div style={{ fontSize: 30, marginTop: 48, color: '#FFFFFF' }}>Terrassa · Carla Martínez</div>
        </div>
      </div>
    ),
    { ...size }
  )
}
