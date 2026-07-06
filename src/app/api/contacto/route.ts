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

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (err) {
    console.error('Contact form error:', err)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
