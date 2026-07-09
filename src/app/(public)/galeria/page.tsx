import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Camera } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export const metadata = {
  title: 'Galería | Koto Education',
  description: 'Fotos de los paseos y cuidados de mascotas en Terrassa.',
}

const categoryLabels: Record<string, string> = {
  all: 'Todos',
  walk: '🦮 Paseos',
  dog: '🐶 Perros',
  cat: '🐱 Gatos',
  care: '❤️ Cuidados',
  general: '📷 General',
}

export default async function GaleriaPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const { category } = await searchParams
  const activeCategory = category || 'all'

  // Fetch public photos from Supabase (server-side)
  const supabase = await createClient()
  const query = supabase
    .from('photos')
    .select('id, url, caption, category, is_public')
    .eq('is_public', true)
    .order('created_at', { ascending: false })

  if (activeCategory !== 'all') {
    query.eq('category', activeCategory)
  }

  const { data: photos = [] } = await query

  // Compute which categories actually have photos (for filter buttons)
  const { data: allPhotos = [] } = await supabase
    .from('photos')
    .select('category')
    .eq('is_public', true)

  const usedCategories = ['all', ...new Set((allPhotos || []).map((p) => p.category))]

  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      {/* Header */}
      <div className="text-center mb-12">
        <Badge className="mb-4">Galería</Badge>
        <h1 className="text-4xl font-display font-bold mb-4">Momentos especiales 📸</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Cada paseo y cuidado es una aventura única. Aquí comparto algunos de los
          mejores momentos con mis peludos clientes.
        </p>
      </div>

      {/* Filter buttons */}
      <div className="flex flex-wrap justify-center gap-2 mb-10">
        {usedCategories.map((cat) => (
          <Button
            key={cat}
            asChild
            variant={activeCategory === cat ? 'default' : 'outline'}
            size="sm"
            className="rounded-full"
          >
            <Link href={cat === 'all' ? '/galeria' : `/galeria?category=${cat}`}>
              {categoryLabels[cat] || cat}
            </Link>
          </Button>
        ))}
      </div>

      {/* Photo grid */}
      {photos && photos.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="rounded-xl aspect-square overflow-hidden bg-muted hover:opacity-95 transition-opacity relative group"
            >
              {photo.url ? (
                <img
                  src={photo.url}
                  alt={photo.caption || 'Foto'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-secondary/30">
                  <Camera className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-xs text-center text-muted-foreground px-3">
                    {photo.caption}
                  </p>
                </div>
              )}
              {/* Caption on hover */}
              {photo.caption && photo.url && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 translate-y-full group-hover:translate-y-0 transition-transform">
                  <p className="text-white text-xs truncate">{photo.caption}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-muted-foreground mb-12">
          <Camera className="h-16 w-16 mx-auto mb-4 opacity-25" />
          <p className="font-medium">
            {activeCategory !== 'all'
              ? 'No hay fotos en esta categoría todavía'
              : 'La galería está vacía de momento'}
          </p>
          <p className="text-sm mt-1">¡Vuelve pronto!</p>
        </div>
      )}

      {/* Instagram CTA */}
      <div className="bg-secondary/50 rounded-2xl p-8 text-center">
        <p className="text-muted-foreground mb-2">
          ¿Quieres ver más? Sígueme en Instagram para fotos y vídeos diarios
        </p>
        <Button asChild variant="outline">
          <a
            href="https://instagram.com/kotoeducation"
            target="_blank"
            rel="noopener noreferrer"
          >
            @kotoeducation en Instagram
          </a>
        </Button>
      </div>

      {/* Bottom CTA */}
      <div className="text-center mt-10">
        <h2 className="text-2xl font-display font-bold mb-3">
          ¿Te gustaría que cuidara a tu mascota?
        </h2>
        <Button asChild size="lg">
          <Link href="/contacto">Solicitar cita</Link>
        </Button>
      </div>
    </div>
  )
}
