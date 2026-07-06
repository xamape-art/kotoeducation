import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Dog, Home, Heart, GraduationCap, Clock, HelpCircle } from 'lucide-react'
import Link from 'next/link'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

export const metadata = {
  title: 'Servicios y Tarifas | Koto Education',
  description: 'Paseo de perros 10€, visitas a domicilio 10€, cuidado a domicilio 35€/noche. Servicios de cuidado de mascotas en Terrassa.',
}

const services = [
  {
    id: 'paseo',
    icon: Dog,
    title: 'Paseo de perros',
    emoji: '🦮',
    price: '10€',
    unit: 'por paseo',
    description:
      'Paseo por el barrio adaptado a las necesidades de tu perro. Puedo hacerlo en grupo (máx. 3) o individual para perros que lo necesiten.',
    includes: [
      'Paseo de 30 a 60 minutos',
      'Foto o vídeo durante el paseo',
      'Informe al terminar',
      'Recogida y entrega a domicilio',
      'Agua y descansos necesarios',
    ],
    extras: ['Paseo 60 min: +3€', 'Paseo individual: +5€'],
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  {
    id: 'visita',
    icon: Home,
    title: 'Visitas a domicilio',
    emoji: '🏠',
    price: '10€',
    unit: 'por visita',
    description:
      'Me desplazo a tu casa para dar de comer, hacer compañía, jugar o administrar medicación. Ideal para gatos y perros que se quedan solos durante el día.',
    includes: [
      'Visita de 30 minutos',
      'Alimentación e hidratación',
      'Juego y compañía',
      'Administración de medicamentos (orales)',
      'Foto e informe al terminar',
    ],
    extras: ['Visita de 1 hora: +5€'],
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  {
    id: 'cuidado',
    icon: Heart,
    title: 'Cuidado a domicilio',
    emoji: '🛏️',
    price: '35€',
    unit: 'por noche',
    description:
      'Me quedo en tu casa para que tu mascota esté en su entorno habitual. Ideal para períodos de vacaciones o ausencias largas.',
    includes: [
      'Pernoctación en tu hogar',
      'Alimentación según rutina',
      'Paseos incluidos',
      'Actualizaciones diarias con fotos',
      'Administración de medicamentos',
    ],
    extras: ['Día completo (sin noche): 20€', 'Mascotas adicionales: +10€'],
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
  },
  {
    id: 'educacion',
    icon: GraduationCap,
    title: 'Educación canina',
    emoji: '🎓',
    price: 'Próximamente',
    unit: '',
    description:
      'Actualmente en formación como educadora canina. Pronto ofreceré sesiones de adiestramiento básico, trabajo con perros reactivos y socialización.',
    includes: [
      'Obediencia básica',
      'Trabajo con perros reactivos',
      'Socialización',
      'Sesiones individualizadas',
    ],
    extras: [],
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
  },
]

const faqs = [
  {
    q: '¿Cómo es la primera toma de contacto?',
    a: 'Antes de empezar cualquier servicio, me gusta quedar en persona para conocer a tu mascota y que me cuentes su rutina, necesidades y cualquier particularidad. Sin coste adicional.',
  },
  {
    q: '¿Con qué antelación debo reservar?',
    a: 'Intento ser flexible. Para servicios puntuales, con 24–48 horas suele ser suficiente. Para períodos de cuidado a domicilio (vacaciones), se recomienda reservar con más tiempo.',
  },
  {
    q: '¿Qué pasa si mi perro no se lleva bien con otros perros?',
    a: 'En ese caso optamos por paseos individuales. Tengo experiencia con perros reactivos y adapto el recorrido para que la experiencia sea positiva.',
  },
  {
    q: '¿Cómo me informas durante el servicio?',
    a: 'Envío fotos y/o vídeos durante el servicio y un pequeño informe al terminar. Siempre estoy disponible por WhatsApp si tienes alguna pregunta.',
  },
  {
    q: '¿Cuál es tu política de cancelación?',
    a: 'Para cancelaciones con más de 24 horas de antelación, no hay cargo. Para cancelaciones de último momento, puede aplicarse una parte del importe.',
  },
]

export default function ServiciosPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <Badge className="mb-4">Servicios y Tarifas</Badge>
        <h1 className="text-4xl font-display font-bold mb-4">¿En qué puedo ayudarte?</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Servicios adaptados a las necesidades de cada mascota y propietario.
          Todos los precios son transparentes, sin sorpresas.
        </p>
      </div>

      {/* Service cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
        {services.map((s) => (
          <Card key={s.id} id={s.id} className={`border-2 ${s.bgColor} ${s.borderColor}`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{s.emoji}</span>
                  <CardTitle className="font-display text-lg font-semibold">{s.title}</CardTitle>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">{s.price}</div>
                  {s.unit && (
                    <div className="text-xs text-muted-foreground">{s.unit}</div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm mb-4">{s.description}</p>
              <h4 className="font-semibold text-sm mb-2">Incluye:</h4>
              <ul className="space-y-1.5 mb-4">
                {s.includes.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              {s.extras.length > 0 && (
                <>
                  <h4 className="font-semibold text-sm mb-2">Extras opcionales:</h4>
                  <ul className="space-y-1">
                    {s.extras.map((e) => (
                      <li key={e} className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                        {e}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Availability */}
      <div className="bg-secondary/50 rounded-2xl p-8 mb-16 flex flex-col sm:flex-row items-center gap-6">
        <Clock className="h-12 w-12 text-primary shrink-0" />
        <div>
          <h2 className="text-xl font-display font-bold mb-2">Disponibilidad</h2>
          <p className="text-muted-foreground">
            Disponibilidad prácticamente diaria, entre semana y fines de semana.
            Contacta para confirmar disponibilidad en tu fecha.
          </p>
        </div>
        <Button asChild className="shrink-0">
          <Link href="/contacto">Comprobar disponibilidad</Link>
        </Button>
      </div>

      {/* FAQ */}
      <div>
        <div className="flex items-center gap-3 mb-8">
          <HelpCircle className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-display font-bold">Preguntas frecuentes</h2>
        </div>
        <Accordion multiple={false} className="space-y-2">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="border rounded-lg px-4">
              <AccordionTrigger className="text-left font-medium">{faq.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{faq.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  )
}
