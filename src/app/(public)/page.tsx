import Link from 'next/link'
import Image from 'next/image'
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
} from 'lucide-react'

const services = [
  {
    icon: Dog,
    title: 'Paseo de perros',
    price: '10€',
    unit: 'por paseo',
    description: 'Paseos en grupo o individuales por el barrio. Duración 30–60 min.',
    accent: 'border-l-primary',
  },
  {
    icon: Home,
    title: 'Visitas a domicilio',
    price: '10€',
    unit: 'por visita',
    description: 'Me desplazo a tu casa para cuidar, alimentar y hacer compañía a tu mascota.',
    accent: 'border-l-accent',
  },
  {
    icon: Heart,
    title: 'Cuidado a domicilio',
    price: '35€',
    unit: 'por noche',
    description: 'Me quedo en tu casa para que tu mascota no sufra el estrés de una guardería.',
    accent: 'border-l-primary',
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
      {/* ── Hero ── */}
      <section className="relative overflow-hidden" style={{ backgroundColor: '#F5EDE3' }}>
        <div className="max-w-6xl mx-auto px-4 py-20 md:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: copy */}
            <div className="order-2 lg:order-1">
              <Badge
                className="mb-6 rounded-full px-4 py-1.5 text-xs tracking-widest uppercase font-semibold"
                style={{ backgroundColor: '#2C1008', color: '#F5EDE3', border: 'none' }}
              >
                📍 Terrassa, Barcelona
              </Badge>
              <h1
                className="text-5xl md:text-6xl lg:text-7xl font-display font-bold leading-[1.1] mb-6"
                style={{ color: '#2C1008' }}
              >
                Paseos y
                <br />
                cuidados con{' '}
                <span style={{ color: '#8B3A1E' }}>amor</span>
              </h1>
              <p className="text-lg leading-relaxed mb-8" style={{ color: '#5C3520' }}>
                Soy Carla, paseadora y cuidadora de mascotas en Terrassa. Con 3 años de
                experiencia y formación en educación canina, tu peludito estará en las
                mejores manos.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mb-10">
                <Button
                  asChild
                  size="lg"
                  className="rounded-full px-8 text-base shadow-lg"
                  style={{ backgroundColor: '#8B3A1E', color: '#F5EDE3' }}
                >
                  <Link href="/contacto">
                    Solicitar cita
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="rounded-full px-8 text-base"
                  style={{ borderColor: '#8B3A1E', color: '#8B3A1E', backgroundColor: 'transparent' }}
                >
                  <Link href="/servicios">Ver servicios</Link>
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm" style={{ color: '#5C3520' }}>
                {[
                  'Disponibilidad diaria',
                  'Fotos e informes',
                  '100% de respuesta',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: '#C47A35' }} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: logo */}
            <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
              <div className="relative w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96">
                <Image
                  src="/logo.png"
                  alt="Koto Education"
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 256px, (max-width: 1024px) 320px, 384px"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="py-10" style={{ backgroundColor: '#2C1008' }}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map((stat) => (
              <div key={stat.label}>
                <div
                  className="text-4xl font-display font-bold mb-1"
                  style={{ color: '#C47A35' }}
                >
                  {stat.value}
                </div>
                <div className="text-sm" style={{ color: '#D4B49A' }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Services ── */}
      <section className="py-24 px-4 bg-background" id="servicios">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs tracking-widest uppercase font-semibold text-accent mb-3">
              Lo que ofrezco
            </p>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
              Mis servicios
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-base">
              Cada mascota es única. Adapto cada servicio a las necesidades específicas
              de tu compañero.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {services.map((service) => (
              <Card
                key={service.title}
                className={`border border-border border-l-4 ${service.accent} shadow-sm hover:shadow-md transition-shadow`}
              >
                <CardContent className="p-8">
                  <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-5">
                    <service.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-bold text-lg mb-1 text-foreground">{service.title}</h3>
                  <div className="text-3xl font-display font-bold text-primary mb-1">
                    {service.price}
                    <span className="text-sm font-sans font-normal text-muted-foreground ml-1">
                      {service.unit}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed mt-3">
                    {service.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-10">
            <Button asChild variant="outline" className="rounded-full px-8">
              <Link href="/servicios">
                Ver todos los servicios y tarifas
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── About ── */}
      <section className="py-24 px-4 bg-secondary/30">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div
                className="rounded-3xl overflow-hidden aspect-square relative shadow-md"
              >
                <Image
                  src="/carla-koto.jpg"
                  alt="Carla con Koto"
                  fill
                  sizes="(max-width: 1024px) 100vw, 500px"
                  className="object-cover"
                  priority
                />
              </div>
              <div
                className="absolute -bottom-5 -right-5 rounded-2xl p-4 shadow-xl"
                style={{ backgroundColor: '#C47A35' }}
              >
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 fill-white text-white" />
                  <span className="font-bold text-white text-lg">5.0</span>
                  <span className="text-sm text-white/80">· 14+ reseñas</span>
                </div>
              </div>
            </div>
            <div>
              <p className="text-xs tracking-widest uppercase font-semibold text-accent mb-4">
                Sobre mí
              </p>
              <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 text-foreground">
                Hola, soy Carla 👋
              </h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Llevo más de 3 años dedicándome al cuidado y paseo de mascotas en
                Terrassa. Actualmente me estoy formando como educadora canina, lo que me
                permite entender mejor el comportamiento de cada animal.
              </p>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Tengo experiencia con perros reactivos, perros senior y cachorros.
                También cuido gatos. Mi objetivo es que cada mascota se sienta cómoda,
                segura y feliz.
              </p>
              <ul className="space-y-3 mb-10">
                {[
                  'Formación en educación canina',
                  'Experiencia con perros de todos los tamaños',
                  'Disponibilidad prácticamente diaria',
                  'Fotos e informes durante el servicio',
                  'Zona de trabajo: Terrassa centro y alrededores',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-accent shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Button asChild className="rounded-full px-8">
                <Link href="/sobre-mi">
                  Conocerme mejor
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Reviews ── */}
      <section className="py-24 px-4 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs tracking-widest uppercase font-semibold text-accent mb-3">
              Opiniones
            </p>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
              Lo que dicen mis clientes
            </h2>
            <p className="text-muted-foreground">
              Opiniones reales de propietarios de mascotas en Terrassa
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((r) => (
              <Card key={r.name} className="border border-border shadow-sm">
                <CardContent className="p-8">
                  <div className="flex mb-4">
                    {[...Array(r.stars)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                    ))}
                  </div>
                  <p className="text-muted-foreground text-sm mb-6 leading-relaxed italic">
                    &ldquo;{r.text}&rdquo;
                  </p>
                  <div className="border-t border-border/50 pt-4">
                    <p className="font-semibold text-sm text-foreground">{r.name}</p>
                    <p className="text-muted-foreground text-xs">{r.pet}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA band ── */}
      <section className="py-20 px-4" style={{ backgroundColor: '#2C1008' }}>
        <div className="max-w-4xl mx-auto text-center">
          <h2
            className="text-4xl md:text-5xl font-display font-bold mb-4"
            style={{ color: '#F5EDE3' }}
          >
            ¿Listo para reservar?
          </h2>
          <p className="mb-8 text-base" style={{ color: '#D4B49A' }}>
            Respondo a todos los mensajes. Consulta disponibilidad sin compromiso.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-10">
            <div className="flex items-center gap-3" style={{ color: '#D4B49A' }}>
              <MapPin className="h-5 w-5" style={{ color: '#C47A35' }} />
              <span className="text-sm">Terrassa y alrededores</span>
            </div>
            <div className="flex items-center gap-3" style={{ color: '#D4B49A' }}>
              <Clock className="h-5 w-5" style={{ color: '#C47A35' }} />
              <span className="text-sm">Todos los días de la semana</span>
            </div>
          </div>
          <Button
            asChild
            size="lg"
            className="rounded-full px-10 text-base shadow-xl"
            style={{ backgroundColor: '#C47A35', color: '#fff' }}
          >
            <Link href="/contacto">
              Solicitar cita ahora
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  )
}
