import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import ContactForm from '@/components/public/ContactForm'
import { MapPin, Phone, Mail, ExternalLink, Clock, MessageCircle } from 'lucide-react'

export const metadata = {
  title: 'Contacto | Koto Education',
  description: 'Solicita cita o información sobre los servicios de paseo y cuidado de mascotas en Terrassa.',
}

export default function ContactoPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <Badge className="mb-4">Contacto</Badge>
        <h1 className="text-4xl font-display font-bold mb-4">¿Hablamos? 🐾</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Rellena el formulario y te responderé lo antes posible, normalmente en minutos.
          También puedes escribirme directamente por WhatsApp.
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
                  <a href="tel:+34600000000" className="text-muted-foreground hover:text-foreground">
                    +34 600 000 000
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3 text-sm">
                <Mail className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium">Email</p>
                  <a href="mailto:hola@kotoeducation.com" className="text-muted-foreground hover:text-foreground">
                    hola@kotoeducation.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3 text-sm">
                <ExternalLink className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium">Instagram</p>
                  <a
                    href="https://instagram.com/kotoeducation"
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

          <Card className="bg-accent/10 border-accent/30">
            <CardContent className="p-5">
              <div className="flex items-start gap-3 text-sm">
                <MessageCircle className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold mb-1">¿Prefieres WhatsApp?</p>
                  <p className="text-muted-foreground">
                    ¡También puedes escribirme directamente!
                  </p>
                  <a
                    href="https://wa.me/34600000000"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-2 text-primary font-medium hover:underline"
                  >
                    Abrir WhatsApp →
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6 md:p-8">
              <ContactForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
