import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Camera } from 'lucide-react'

export const metadata = {
  title: 'Galería | Koto Education',
  description: 'Fotos de los paseos y cuidados de mascotas en Terrassa.',
}

const photos = [
  { id: 1, category: 'walk', caption: 'Paseo matutino con Koto', bg: 'bg-green-100' },
  { id: 2, category: 'dog', caption: 'Max disfrutando del parque', bg: 'bg-blue-100' },
  { id: 3, category: 'care', caption: 'Cuidado a domicilio', bg: 'bg-orange-100' },
  { id: 4, category: 'walk', caption: 'Tarde de paseo', bg: 'bg-green-50' },
  { id: 5, category: 'dog', caption: 'Luna en el parque', bg: 'bg-purple-100' },
  { id: 6, category: 'care', caption: 'Mochi en casa', bg: 'bg-pink-100' },
  { id: 7, category: 'walk', caption: 'Grupo de paseo', bg: 'bg-yellow-100' },
  { id: 8, category: 'dog', caption: 'Rocky feliz', bg: 'bg-red-100' },
  { id: 9, category: 'care', caption: 'Siesta de tarde', bg: 'bg-teal-100' },
]

const categories = [
  { value: 'all', label: 'Todos' },
  { value: 'walk', label: '🦮 Paseos' },
  { value: 'dog', label: '🐶 Perros' },
  { value: 'care', label: '❤️ Cuidados' },
]

export default function GaleriaPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <Badge className="mb-4">Galería</Badge>
        <h1 className="text-4xl font-bold mb-4">Momentos especiales 📸</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Cada paseo y cuidado es una aventura única. Aquí comparto algunos de los
          mejores momentos con mis peludos clientes.
        </p>
      </div>

      {/* Filter buttons (static for now) */}
      <div className="flex flex-wrap justify-center gap-2 mb-10">
        {categories.map((cat) => (
          <Button key={cat.value} variant="outline" size="sm" className="rounded-full">
            {cat.label}
          </Button>
        ))}
      </div>

      {/* Photo grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className={`${photo.bg} rounded-xl aspect-square flex flex-col items-center justify-center p-4 hover:opacity-90 transition-opacity`}
          >
            <Camera className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-xs text-center text-muted-foreground">{photo.caption}</p>
          </div>
        ))}
      </div>

      <div className="bg-secondary/50 rounded-2xl p-8 text-center">
        <p className="text-muted-foreground mb-2">
          ¿Quieres ver más? Sígueme en Instagram para fotos y vídeos diarios
        </p>
        <Button asChild variant="outline">
          <a href="https://instagram.com/kotoeducation" target="_blank" rel="noopener noreferrer">
            @kotoeducation en Instagram
          </a>
        </Button>
      </div>

      <div className="text-center mt-10">
        <h2 className="text-2xl font-bold mb-3">¿Te gustaría que cuidara a tu mascota?</h2>
        <Button asChild size="lg">
          <Link href="/contacto">Solicitar cita</Link>
        </Button>
      </div>
    </div>
  )
}
