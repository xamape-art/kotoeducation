import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { MapPin, Phone, Mail, ExternalLink, Clock, MessageCircle } from 'lucide-react'
import {
  PHONE_DISPLAY,
  PHONE_HREF,
  WHATSAPP_HREF,
  EMAIL,
  INSTAGRAM_HREF,
} from '@/lib/contact'

export const metadata = {
  title: 'Contacto | Koto Education',
  description: 'Contacta por teléfono o WhatsApp para informarte sobre los servicios de paseo y cuidado de mascotas en Terrassa.',
}

export default function ContactoPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <Badge className="mb-4">Contacto</Badge>
        <h1 className="text-4xl font-display font-bold mb-4">¿Hablamos? 🐾</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Escríbeme por WhatsApp o llámame directamente y te responderé lo antes posible,
          normalmente en minutos.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact info */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-5 space-y-4">
              <h2 className="font-display font-semibold text-lg">Información de contacto</h2>

              <div className="flex items-start gap-3 text-sm">
                <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium">Ubicación</p>
                  <p className="text-muted-foreground">Terrassa, Barcelona</p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-sm">
                <Phone className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium">Teléfono / WhatsApp</p>
                  <a href={PHONE_HREF} className="text-muted-foreground hover:text-foreground">
                    {PHONE_DISPLAY}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3 text-sm">
                <Mail className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium">Email</p>
                  <a href={`mailto:${EMAIL}`} className="text-muted-foreground hover:text-foreground">
                    {EMAIL}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3 text-sm">
                <ExternalLink className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium">Instagram</p>
                  <a
                    href={INSTAGRAM_HREF}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    @kotoeducation
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-start gap-3 text-sm">
                <Clock className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold mb-1">Horario de respuesta</p>
                  <p className="text-muted-foreground">
                    Todos los días · 8:00 – 21:00
                  </p>
                  <p className="text-muted-foreground text-xs mt-1">
                    Normalmente respondo en menos de 30 minutos
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Direct contact */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6 md:p-10 text-center">
              <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-secondary mb-5">
                <MessageCircle className="h-7 w-7 text-primary" />
              </div>
              <h2 className="text-2xl font-display font-bold mb-3">
                Contáctame directamente
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto mb-8">
                Cuéntame qué necesitas para tu mascota (servicio, fechas, raza y edad) y
                te confirmo disponibilidad sin compromiso.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild size="lg" className="rounded-full px-8">
                  <a href={WHATSAPP_HREF} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Escríbeme por WhatsApp
                  </a>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-full px-8">
                  <a href={PHONE_HREF}>
                    <Phone className="mr-2 h-4 w-4" />
                    Llamar {PHONE_DISPLAY}
                  </a>
                </Button>
              </div>

              <p className="text-xs text-muted-foreground mt-8">
                También puedes escribirme a{' '}
                <a href={`mailto:${EMAIL}`} className="text-primary hover:underline">
                  {EMAIL}
                </a>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
