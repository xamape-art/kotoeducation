'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Plus, Trash2, Eye, EyeOff, Upload, Camera } from 'lucide-react'

const mockPhotos = [
  { id: '1', caption: 'Koto en el parque', category: 'walk', is_public: true, bg: 'bg-green-100' },
  { id: '2', caption: 'Max corriendo', category: 'dog', is_public: true, bg: 'bg-blue-100' },
  { id: '3', caption: 'Cuidando a Mochi', category: 'care', is_public: false, bg: 'bg-pink-100' },
  { id: '4', caption: 'Paseo grupal', category: 'walk', is_public: true, bg: 'bg-yellow-100' },
  { id: '5', caption: 'Luna en otoño', category: 'walk', is_public: true, bg: 'bg-orange-100' },
  { id: '6', caption: 'Rocky al atardecer', category: 'dog', is_public: false, bg: 'bg-red-100' },
  { id: '7', caption: 'Siesta de Mochi', category: 'care', is_public: true, bg: 'bg-purple-100' },
  { id: '8', caption: 'Grupo de amigos peludos', category: 'dog', is_public: true, bg: 'bg-teal-100' },
]

const categoryLabels: Record<string, string> = {
  walk: '🦮 Paseo',
  dog: '🐶 Perros',
  cat: '🐱 Gatos',
  care: '❤️ Cuidado',
  general: '📷 General',
}

export default function GaleriaAdminPage() {
  const [photos, setPhotos] = useState(mockPhotos)
  const [filter, setFilter] = useState('all')
  const [openUpload, setOpenUpload] = useState(false)

  const filtered = filter === 'all' ? photos : photos.filter((p) => p.category === filter)

  const togglePublic = (id: string) => {
    setPhotos((prev) => prev.map((p) => p.id === id ? { ...p, is_public: !p.is_public } : p))
  }

  const deletePhoto = (id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id))
  }

  const publicCount = photos.filter((p) => p.is_public).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Galería</h1>
          <p className="text-muted-foreground text-sm">
            {photos.length} fotos · {publicCount} visibles en la web
          </p>
        </div>
        <Dialog open={openUpload} onOpenChange={setOpenUpload}>
          <DialogTrigger asChild>
            <Button>
              <Upload className="h-4 w-4 mr-2" />
              Subir foto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle>Subir nueva foto</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-8 text-center">
                <Camera className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">Arrastra una foto aquí o haz click</p>
                <Button variant="outline" size="sm">Seleccionar archivo</Button>
                <p className="text-xs text-muted-foreground mt-2">
                  Conecta Supabase Storage para habilitar las subidas
                </p>
              </div>
              <div className="space-y-1.5">
                <Label>Descripción</Label>
                <Input placeholder="Ej: Koto en el parque de Vallparadís" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Categoría</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Categoría" /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(categoryLabels).map(([v, l]) => (
                        <SelectItem key={v} value={v}>{l}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5 flex flex-col justify-end">
                  <Label>Visible en web</Label>
                  <div className="flex items-center gap-2 h-9">
                    <input type="checkbox" id="public" className="rounded" defaultChecked />
                    <label htmlFor="public" className="text-sm">Sí</label>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setOpenUpload(false)}>Cancelar</Button>
                <Button onClick={() => setOpenUpload(false)}>Subir</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          Todas ({photos.length})
        </Button>
        {Object.entries(categoryLabels).map(([value, label]) => {
          const count = photos.filter((p) => p.category === value).length
          if (count === 0) return null
          return (
            <Button
              key={value}
              variant={filter === value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(value)}
            >
              {label} ({count})
            </Button>
          )
        })}
      </div>

      {/* Photo grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {filtered.map((photo) => (
          <div key={photo.id} className="group relative">
            <div className={`${photo.bg} rounded-xl aspect-square flex flex-col items-center justify-center`}>
              <Camera className="h-8 w-8 text-muted-foreground" />
              <p className="text-xs text-center text-muted-foreground px-2 mt-1">{photo.caption}</p>
            </div>
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/60 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {categoryLabels[photo.category]}
              </Badge>
              <div className="flex gap-1.5">
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-7 px-2 text-xs"
                  onClick={() => togglePublic(photo.id)}
                  title={photo.is_public ? 'Ocultar de la web' : 'Mostrar en la web'}
                >
                  {photo.is_public ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="destructive" className="h-7 px-2 text-xs">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Eliminar foto?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta acción no se puede deshacer.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => deletePhoto(photo.id)}>
                        Eliminar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
            {/* Public indicator */}
            <div className={`absolute top-1.5 right-1.5 h-2 w-2 rounded-full ${photo.is_public ? 'bg-green-500' : 'bg-gray-400'}`} title={photo.is_public ? 'Visible en la web' : 'Oculta'} />
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Camera className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>No hay fotos en esta categoría</p>
        </div>
      )}
    </div>
  )
}
