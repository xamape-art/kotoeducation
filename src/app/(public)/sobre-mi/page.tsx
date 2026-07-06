import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle2, MapPin, Clock, Star, Dog, Cat } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export const metadata = {
  title: 'Sobre mí | Koto Education',
  description: 'Conoce a Carla M., paseadora y cuidadora de mascotas en Terrassa con más de 3 años de experiencia.',
}

export default function SobreMiPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      {/* Header */}
      <div className="text-center mb-16">
        <Badge className="mb-4">Sobre mí</Badge>
        <h1 className="text-4xl font-display font-bold mb-4">Hola, soy Carla 🐾</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Paseadora y cuidadora de mascotas en Terrassa. Me apasiona el bienestar animal
          y me formo continuamente para dar el mejor servicio posible.
        </p>
      </div>

      {/* Photo + intro */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start mb-16">
        <div className="rounded-2xl bg-secondary/50 aspect-square flex items-center justify-center">
          <div className="text-center">
            <div className="text-7xl mb-3">🐾</div>
            <p className="text-muted-foreground text-sm">Carla con Koto, Galgo español</p>
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-display font-bold mb-4">Mi historia</h2>
          <p className="text-muted-foreground mb-4 leading-relaxed">
            Llevo más de 3 años dedicándome al cuidado y paseo de mascotas en Terrassa.
            Todo empezó con Koto, mi galgo español, que me enseñó lo importante que es
            entender las necesidades de cada animal.
          </p>
          <p className="text-muted-foreground mb-4 leading-relaxed">
            Actualmente me estoy formando como educadora canina a través de varios cursos,
            lo que me permite entender mejor el comportamiento de cada raza y situación.
            Tengo experiencia con perros reactivos, perros senior, cachorros y gatos.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            En un futuro, además de los servicios actuales, ofreceré también servicios
            de educación y adiestramiento canino.
          </p>
        </div>
      </div>

      {/* Skills */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        <Card>
          <CardContent className="p-6">
            <h3 className="font-display font-bold text-lg mb-4">Comunicación</h3>
            <ul className="space-y-3">
              {[
                'Índice de respuesta del 100%',
                'Suelo responder en pocos minutos',
                'Envío noticias y fotos durante el servicio',
                'Informes de cada paseo o visita',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <h3 className="font-display font-bold text-lg mb-4">Cuidado animal</h3>
            <ul className="space-y-3">
              {[
                '3+ años de experiencia',
                'Administración de medicamentos orales',
                'Experiencia con perros mayores',
                'Experiencia con perros con necesidades especiales',
                'Puede ofrecer ejercicio diario',
                'Formación en educación canina',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Pets accepted */}
      <div className="bg-secondary/40 rounded-2xl p-8 mb-16">
        <h2 className="text-2xl font-display font-bold mb-6">Mascotas que cuido</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Dog, label: 'Perros 0–7 kg' },
            { icon: Dog, label: 'Perros 7–18 kg' },
            { icon: Dog, label: 'Perros 18–45 kg' },
            { icon: Dog, label: 'Perros +45 kg' },
            { icon: Cat, label: 'Gatos' },
          ].map((item) => (
            <div
              key={item.label}
              className="flex flex-col items-center gap-2 bg-white rounded-xl p-4 text-center"
            >
              <item.icon className="h-8 w-8 text-primary" />
              <span className="text-sm font-medium">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Availability */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <Clock className="h-5 w-5 text-primary" />
              <h3 className="font-display font-bold">Disponibilidad</h3>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Actualmente tengo disponibilidad prácticamente diaria, tanto entre semana
              como en fin de semana. Sigo en formación como educadora canina, a través de
              varios cursos, que puedo combinar con los paseos y cuidados a domicilio.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <MapPin className="h-5 w-5 text-primary" />
              <h3 className="font-display font-bold">Zona de trabajo</h3>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Me centro principalmente en Terrassa y los barrios circundantes. Consulta
              disponibilidad si tu dirección está en los límites de la ciudad.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Reviews summary */}
      <div className="text-center mb-12">
        <div className="flex justify-center mb-2">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="h-6 w-6 fill-accent text-accent" />
          ))}
        </div>
        <p className="text-2xl font-bold mb-1">5.0 de valoración media</p>
        <p className="text-muted-foreground">Más de 14 reseñas de clientes satisfechos</p>
      </div>

      {/* CTA */}
      <div className="text-center bg-primary text-primary-foreground rounded-2xl p-10">
        <h2 className="text-2xl font-display font-bold mb-3">¿Quieres que cuide a tu mascota?</h2>
        <p className="text-primary-foreground/80 mb-6">
          Contáctame para una primera toma de contacto sin compromiso.
        </p>
        <Button asChild variant="secondary" size="lg">
          <Link href="/contacto">Solicitar información</Link>
        </Button>
      </div>
    </div>
  )
}
