import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const supabase = await createClient()

    const { error } = await supabase.from('contact_requests').insert([
      {
        name: body.name,
        email: body.email,
        phone: body.phone || null,
        pet_name: body.petName || null,
        pet_breed: body.petBreed || null,
        pet_weight: body.petWeight ? Number(body.petWeight) : null,
        pet_age: body.petAge ? Number(body.petAge) : null,
        service_type: body.serviceType,
        preferred_date: body.preferredDate || null,
        message: body.message || null,
        status: 'new',
      },
    ])

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Error al guardar la solicitud' },
        { status: 500 }
      )
    }

    // Send email notification via Resend if API key is present
    const resendApiKey = process.env.RESEND_API_KEY
    if (resendApiKey) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: 'Koto Education <onboarding@resend.dev>',
            to: 'kotoeducation@gmail.com',
            subject: `Nueva solicitud de contacto: ${body.name}`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #38251e; border-bottom: 2px solid #C47A35; padding-bottom: 10px; margin-top: 0;">¡Nueva Solicitud de Contacto! 🐾</h2>
                <p>Has recibido una nueva consulta de un cliente potencial desde la web:</p>
                <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                  <tr style="background-color: #fcfbfa;">
                    <td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #eee; width: 180px;">Nombre</td>
                    <td style="padding: 10px; border-bottom: 1px solid #eee;">${body.name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #eee;">Email</td>
                    <td style="padding: 10px; border-bottom: 1px solid #eee;"><a href="mailto:${body.email}">${body.email}</a></td>
                  </tr>
                  <tr style="background-color: #fcfbfa;">
                    <td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #eee;">Teléfono</td>
                    <td style="padding: 10px; border-bottom: 1px solid #eee;">${body.phone || 'No indicado'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #eee;">Servicio solicitado</td>
                    <td style="padding: 10px; border-bottom: 1px solid #eee; text-transform: capitalize;">${body.serviceType}</td>
                  </tr>
                  <tr style="background-color: #fcfbfa;">
                    <td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #eee;">Fecha preferida</td>
                    <td style="padding: 10px; border-bottom: 1px solid #eee;">${body.preferredDate || 'No indicada'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #eee;">Nombre Mascota</td>
                    <td style="padding: 10px; border-bottom: 1px solid #eee;">${body.petName || 'No indicado'}</td>
                  </tr>
                  <tr style="background-color: #fcfbfa;">
                    <td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #eee;">Raza Mascota</td>
                    <td style="padding: 10px; border-bottom: 1px solid #eee;">${body.petBreed || 'No indicada'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #eee;">Peso Mascota</td>
                    <td style="padding: 10px; border-bottom: 1px solid #eee;">${body.petWeight ? `${body.petWeight} kg` : 'No indicado'}</td>
                  </tr>
                  <tr style="background-color: #fcfbfa;">
                    <td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #eee;">Edad Mascota</td>
                    <td style="padding: 10px; border-bottom: 1px solid #eee;">${body.petAge ? `${body.petAge} años` : 'No indicada'}</td>
                  </tr>
                </table>
                <div style="background-color: #fdfaf7; border-left: 4px solid #C47A35; padding: 15px; border-radius: 4px; margin-top: 20px;">
                  <h4 style="margin: 0 0 5px 0; color: #38251e;">Mensaje del cliente:</h4>
                  <p style="margin: 0; color: #555; font-style: italic;">"${body.message || 'Sin mensaje adicional.'}"</p>
                </div>
                <p style="margin-top: 30px; font-size: 11px; color: #999; text-align: center;">Este es un mensaje automático de Koto Education.</p>
              </div>
            `,
          }),
        })
      } catch (emailErr) {
        console.error('Failed to send email notification:', emailErr)
      }
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (err) {
    console.error('Contact form error:', err)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
