import { EMAIL, INSTAGRAM_HREF, PHONE_NUMBER, SITE_URL } from '@/lib/contact'

export const dynamic = 'force-static'

export function GET() {
  const vcard = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    'N:Martínez;Carla;;;',
    'FN:Carla Martínez · Koto Education',
    'ORG:Koto Education',
    'TITLE:Educación canina y paseos · Cuidado de mascotas a domicilio',
    `TEL;TYPE=CELL,VOICE:${PHONE_NUMBER}`,
    `EMAIL;TYPE=INTERNET:${EMAIL}`,
    'ADR;TYPE=WORK:;;;Terrassa;Barcelona;;España',
    `URL:${SITE_URL}/tarjeta`,
    `X-SOCIALPROFILE;TYPE=instagram:${INSTAGRAM_HREF}`,
    'NOTE:Instagram @kotoeducation',
    'END:VCARD',
  ].join('\r\n')

  return new Response(vcard, {
    headers: {
      'Content-Type': 'text/vcard; charset=utf-8',
      'Content-Disposition': 'attachment; filename="Koto Education.vcf"',
    },
  })
}
