import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dog,
  Home,
  Star,
  CheckCircle2,
  Heart,
  Clock,
  MapPin,
  ArrowRight,
  PawPrint,
} from 'lucide-react'

const services = [
  {
    icon: Dog,
    title: 'Paseo de perros',
    price: '10€',
    unit: 'por paseo',
    description: 'Paseos en grupo o individuales por el barrio. Duración 30–60 min.',
    color: 'bg-green-50 border-green-200',
    iconColor: 'text-primary',
  },
  {
    icon: Home,
    title: 'Visitas a domicilio',
    price: '10€',
    unit: 'por visita',
    description: 'Me desplazo a tu casa para cuidar, alimentar y hacer compañía a tu mascota.',
    color: 'bg-blue-50 border-blue-200',
    iconColor: 'text-blue-500',
  },
  {
    icon: Heart,
    title: 'Cuidado a domicilio',
    price: '35€',
    unit: 'por noche',
    description: 'Me quedo en tu casa para que tu mascota no sufra el estrés de una guardería.',
    color: 'bg-orange-50 border-orange-200',
    iconColor: 'text-accent',
  },
]

const stats = [
  { value: '3+', label: 'Años de experiencia' },
  { value: '100%', label: 'Tasa de respuesta' },
  { value: '5.0', label: 'Valoración media' },
  { value: '7/7', label: 'Días disponible' },
]

const reviews = [
  {
    name: 'Laura G.',
    pet: 'Max (Golden Retriever)',
    text: 'Carla es increíble con Max. Siempre puntual, cariñosa y nos manda fotos durante el paseo. ¡Totalmente recomendable!',
    stars: 5,
  },
  {
    name: 'Marc T.',
    pet: 'Luna (Galgo)',
    text: 'Llevamos más de un año con Carla y no cambiaríamos por nada. Conoce perfectamente las necesidades de Luna.',
    stars: 5,
  },
  {
    name: 'Ana R.',
    pet: 'Mochi (Gato)',
    text: 'Se ocupó de Mochi durante nuestras vacaciones. Casa perfecta y gato feliz. ¡La más confiable!',
    stars: 5,
  },
]

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-secondary via-white to-secondary/50 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 py-20 md:py-28">
          <div className="max-w-2xl">
            <Badge className="mb-4 bg-accent text-accent-foreground hover:bg-accent">
              🐾 Terrassa, Barcelona
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              Paseos y cuidados con{' '}
              <span className="text-primary">amor</span> 🐾
            </h1>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Soy Carla, paseadora y cuidadora de mascotas en Terrassa. Con 3 años de
              experiencia y formación en educación canina, tu peludito estará en las
              mejores manos.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild size="lg">
                <Link href="/contacto">
                  Solicitar cita
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/servicios">Ver servicios</Link>
              </Button>
            </div>
            <div className="flex items-center gap-4 mt-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>Disponibilidad diaria</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>Fotos e informes</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>100% respuesta</span>
              </div>
            </div>
          </div>
        </div>
        {/* Decorative paw */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-5 hidden lg:block">
          <PawPrint className="w-96 h-96 text-primary" />
        </div>
      </section>

      {/* Stats */}
      <section className="bg-primary text-primary-foreground py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-primary-foreground/80 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20 px-4" id="servicios">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Mis servicios</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Cada mascota es única. Adapto cada servicio a las necesidades específicas
              de tu compañero.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {services.map((service) => (
              <Card key={service.title} className={`border-2 ${service.color}`}>
                <CardContent className="p-6">
                  <service.icon className={`h-10 w-10 mb-4 ${service.iconColor}`} />
                  <h3 className="font-bold text-lg mb-1">{service.title}</h3>
                  <div className="text-2xl font-bold text-primary mb-3">
                    {service.price}{' '}
                    <span className="text-sm font-normal text-muted-foreground">
                      {service.unit}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-sm">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button asChild variant="outline">
              <Link href="/servicios">
                Ver todos los servicios y tarifas
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="py-20 px-4 bg-secondary/40">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="rounded-2xl overflow-hidden bg-primary/10 aspect-square flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="text-8xl mb-4">🐾</div>
                  <p className="text-muted-foreground text-sm">Foto de Carla con Koto</p>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 bg-accent text-accent-foreground rounded-xl p-4 shadow-lg">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 fill-current" />
                  <span className="font-bold">5.0</span>
                  <span className="text-sm">· 14+ reseñas</span>
                </div>
              </div>
            </div>
            <div>
              <Badge className="mb-4">Sobre mí</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Hola, soy Carla 👋
              </h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Llevo más de 3 años dedicándome al cuidado y paseo de mascotas en
                Terrassa. Actualmente me estoy formando como educadora canina, lo que me
                permite entender mejor el comportamiento de cada animal.
              </p>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Tengo experiencia con perros reactivos, perros senior y cachorros.
                También cuido gatos. Mi objetivo es que cada mascota se sienta cómoda,
                segura y feliz.
              </p>
              <ul className="space-y-2 mb-8">
                {[
                  'Formación en educación canina',
                  'Experiencia con perros de todos los tamaños',
                  'Disponibilidad prácticamente diaria',
                  'Fotos e informes durante el servicio',
                  'Zona de trabajo: Terrassa centro y alrededores',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Button asChild>
                <Link href="/sobre-mi">
                  Conocerme mejor
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Lo que dicen mis clientes</h2>
            <p className="text-muted-foreground">Opiniones reales de propietarios de mascotas en Terrassa</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((r) => (
              <Card key={r.name}>
                <CardContent className="p-6">
                  <div className="flex mb-3">
                    {[...Array(r.stars)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                    ))}
                  </div>
                  <p className="text-muted-foreground text-sm mb-4 italic">&ldquo;{r.text}&rdquo;</p>
                  <div>
                    <p className="font-semibold text-sm">{r.name}</p>
                    <p className="text-muted-foreground text-xs">{r.pet}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Zone */}
      <section className="py-12 px-4 bg-secondary/40">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center gap-4 justify-between">
          <div className="flex items-center gap-3">
            <MapPin className="h-8 w-8 text-primary shrink-0" />
            <div>
              <p className="font-semibold">Zona de trabajo</p>
              <p className="text-muted-foreground text-sm">Terrassa y alrededores, Barcelona</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="h-8 w-8 text-primary shrink-0" />
            <div>
              <p className="font-semibold">Disponibilidad</p>
              <p className="text-muted-foreground text-sm">Todos los días de la semana</p>
            </div>
          </div>
          <Button asChild size="lg">
            <Link href="/contacto">Solicitar cita ahora</Link>
          </Button>
        </div>
      </section>
    </>
  )
}
