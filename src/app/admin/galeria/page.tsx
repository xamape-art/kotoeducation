'use client'

import { useState, useEffect, useRef } from 'react'
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
import { Plus, Pencil, Trash2, Eye, EyeOff, Upload, Camera, Loader2, ImageIcon } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const BUCKET = 'gallery'

const categoryLabels: Record<string, string> = {
  walk: '🦮 Paseo',
  dog: '🐶 Perros',
  cat: '🐱 Gatos',
  care: '❤️ Cuidado',
  general: '📷 General',
}

export default function GaleriaAdminPage() {
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [photos, setPhotos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  // Upload dialog
  const [openUpload, setOpenUpload] = useState(false)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadCaption, setUploadCaption] = useState('')
  const [uploadCategory, setUploadCategory] = useState('general')
  const [uploadPublic, setUploadPublic] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadPreview, setUploadPreview] = useState<string | null>(null)

  // Edit dialog
  const [editingPhoto, setEditingPhoto] = useState<any>(null)
  const [editCaption, setEditCaption] = useState('')
  const [editCategory, setEditCategory] = useState('general')
  const [editSaving, setEditSaving] = useState(false)

  // ─── Fetch ───────────────────────────────────────────────────────────────────
  const fetchPhotos = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('photos')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching photos:', error)
    } else {
      setPhotos(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchPhotos()
  }, [])

  // ─── Upload ──────────────────────────────────────────────────────────────────
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadFile(file)
    setUploadPreview(URL.createObjectURL(file))
  }

  const resetUploadForm = () => {
    setUploadFile(null)
    setUploadCaption('')
    setUploadCategory('general')
    setUploadPublic(true)
    setUploadPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleUpload = async () => {
    if (!uploadFile) {
      alert('Selecciona una imagen primero.')
      return
    }

    setUploading(true)
    try {
      // 1. Upload to Storage
      const ext = uploadFile.name.split('.').pop()
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

      const { error: storageErr } = await supabase.storage
        .from(BUCKET)
        .upload(filename, uploadFile, { upsert: false })

      if (storageErr) throw storageErr

      // 2. Get public URL
      const { data: urlData } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(filename)

      const publicUrl = urlData.publicUrl

      // 3. Insert into photos table
      const { data, error: dbErr } = await supabase
        .from('photos')
        .insert([
          {
            url: publicUrl,
            caption: uploadCaption || null,
            category: uploadCategory,
            is_public: uploadPublic,
          },
        ])
        .select()

      if (dbErr) throw dbErr

      if (data && data[0]) {
        setPhotos((prev) => [data[0], ...prev])
      }

      setOpenUpload(false)
      resetUploadForm()
    } catch (err) {
      console.error('Error uploading photo:', err)
      alert('Error al subir la foto. Asegúrate de que el bucket "gallery" existe y es público.')
    } finally {
      setUploading(false)
    }
  }

  // ─── Toggle public ────────────────────────────────────────────────────────────
  const togglePublic = async (photo: any) => {
    try {
      const { data, error } = await supabase
        .from('photos')
        .update({ is_public: !photo.is_public })
        .eq('id', photo.id)
        .select()

      if (error) throw error
      if (data && data[0]) {
        setPhotos((prev) =>
          prev.map((p) => (p.id === photo.id ? data[0] : p))
        )
      }
    } catch (err) {
      console.error('Error toggling photo visibility:', err)
    }
  }

  // ─── Edit ────────────────────────────────────────────────────────────────────
  const openEditDialog = (photo: any) => {
    setEditingPhoto(photo)
    setEditCaption(photo.caption || '')
    setEditCategory(photo.category || 'general')
  }

  const handleSaveEdit = async () => {
    if (!editingPhoto) return

    setEditSaving(true)
    try {
      const { data, error } = await supabase
        .from('photos')
        .update({
          caption: editCaption || null,
          category: editCategory,
        })
        .eq('id', editingPhoto.id)
        .select()

      if (error) throw error
      if (data && data[0]) {
        setPhotos((prev) =>
          prev.map((p) => (p.id === editingPhoto.id ? data[0] : p))
        )
      }
      setEditingPhoto(null)
    } catch (err) {
      console.error('Error updating photo:', err)
      alert('Error al actualizar la foto.')
    } finally {
      setEditSaving(false)
    }
  }

  // ─── Delete ──────────────────────────────────────────────────────────────────
  const deletePhoto = async (photo: any) => {
    try {
      // Extract filename from URL to delete from Storage
      if (photo.url) {
        const urlParts = photo.url.split(`/${BUCKET}/`)
        if (urlParts.length > 1) {
          const filename = urlParts[1]
          await supabase.storage.from(BUCKET).remove([filename])
        }
      }

      const { error } = await supabase
        .from('photos')
        .delete()
        .eq('id', photo.id)

      if (error) throw error
      setPhotos((prev) => prev.filter((p) => p.id !== photo.id))
    } catch (err) {
      console.error('Error deleting photo:', err)
      alert('Error al eliminar la foto.')
    }
  }

  // ─── Render ──────────────────────────────────────────────────────────────────
  const filtered =
    filter === 'all' ? photos : photos.filter((p) => p.category === filter)
  const publicCount = photos.filter((p) => p.is_public).length

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Galería</h1>
          <p className="text-muted-foreground text-sm">
            {loading
              ? 'Cargando...'
              : `${photos.length} fotos · ${publicCount} visibles en la web`}
          </p>
        </div>
        <Dialog
          open={openUpload}
          onOpenChange={(o) => {
            setOpenUpload(o)
            if (!o) resetUploadForm()
          }}
        >
          <DialogTrigger asChild>
            <Button className="rounded-xl">
              <Upload className="h-4 w-4 mr-2" />
              Subir foto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Subir nueva foto</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              {/* File picker */}
              <div
                className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-6 text-center cursor-pointer hover:border-primary/40 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {uploadPreview ? (
                  <img
                    src={uploadPreview}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                ) : (
                  <>
                    <Camera className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Haz clic para seleccionar una foto
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PNG, JPG, WEBP — máx. 5 MB
                    </p>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Descripción</Label>
                <Input
                  placeholder="Ej: Koto en el parque de Vallparadís"
                  value={uploadCaption}
                  onChange={(e) => setUploadCaption(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Categoría</Label>
                  <Select
                    value={uploadCategory}
                    onValueChange={(val) => setUploadCategory(val || 'general')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
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
                    <input
                      type="checkbox"
                      id="upload-public"
                      className="rounded"
                      checked={uploadPublic}
                      onChange={(e) => setUploadPublic(e.target.checked)}
                    />
                    <label htmlFor="upload-public" className="text-sm">
                      Sí
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setOpenUpload(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleUpload} disabled={uploading || !uploadFile}>
                  {uploading ? (
                    <><Loader2 className="h-3 w-3 animate-spin mr-1" />Subiendo...</>
                  ) : (
                    'Subir'
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          className="h-7 px-3 text-xs rounded-full border-border/80"
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
              className="h-7 px-3 text-xs rounded-full border-border/80"
              onClick={() => setFilter(value)}
            >
              {label} ({count})
            </Button>
          )
        })}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary opacity-60 mr-3" />
          <p>Cargando galería...</p>
        </div>
      )}

      {/* Photo grid */}
      {!loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {filtered.map((photo) => (
            <div key={photo.id} className="group relative">
              <div className="rounded-xl aspect-square overflow-hidden border border-border/10 shadow-xs bg-muted">
                {photo.url ? (
                  <img
                    src={photo.url}
                    alt={photo.caption || 'Foto'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    <p className="text-xs text-center text-muted-foreground px-2 mt-1">
                      {photo.caption}
                    </p>
                  </div>
                )}
              </div>

              {/* Caption overlay at bottom */}
              {photo.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 rounded-b-xl opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-white text-[10px] truncate">{photo.caption}</p>
                </div>
              )}

              {/* Action overlay */}
              <div className="absolute inset-0 bg-black/60 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  {categoryLabels[photo.category] || photo.category}
                </Badge>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-7 px-2 text-xs rounded-lg"
                    onClick={() => openEditDialog(photo)}
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-7 px-2 text-xs rounded-lg"
                    onClick={() => togglePublic(photo)}
                    title={photo.is_public ? 'Ocultar de la web' : 'Mostrar en la web'}
                  >
                    {photo.is_public ? (
                      <Eye className="h-3 w-3" />
                    ) : (
                      <EyeOff className="h-3 w-3" />
                    )}
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="h-7 px-2 text-xs rounded-lg"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-xl">
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar foto?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta acción no se puede deshacer. La foto se eliminará
                          del almacenamiento y de la base de datos.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-lg">
                          Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deletePhoto(photo)}
                          className="rounded-lg"
                        >
                          Eliminar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>

              {/* Visibility indicator */}
              <div
                className={`absolute top-2 right-2 h-2 w-2 rounded-full ${
                  photo.is_public ? 'bg-green-500' : 'bg-gray-400'
                }`}
                title={photo.is_public ? 'Visible en la web' : 'Oculta'}
              />
            </div>
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Camera className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>
            {photos.length === 0
              ? 'No hay fotos aún. ¡Sube la primera!'
              : 'No hay fotos en esta categoría'}
          </p>
        </div>
      )}

      {/* Edit Photo Dialog */}
      <Dialog
        open={!!editingPhoto}
        onOpenChange={(o) => !o && setEditingPhoto(null)}
      >
        <DialogContent className="max-w-sm rounded-xl">
          <DialogHeader>
            <DialogTitle>Editar detalles de la foto</DialogTitle>
          </DialogHeader>
          {editingPhoto && (
            <div className="space-y-4 pt-2">
              {editingPhoto.url && (
                <img
                  src={editingPhoto.url}
                  alt="Foto"
                  className="w-full h-32 object-cover rounded-lg"
                />
              )}
              <div className="space-y-1.5">
                <Label>Descripción</Label>
                <Input
                  value={editCaption}
                  onChange={(e) => setEditCaption(e.target.value)}
                  placeholder="Descripción de la foto..."
                />
              </div>
              <div className="space-y-1.5">
                <Label>Categoría</Label>
                <Select
                  value={editCategory}
                  onValueChange={(val) =>
                    setEditCategory(val || 'general')
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoryLabels).map(([v, l]) => (
                      <SelectItem key={v} value={v}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setEditingPhoto(null)}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveEdit} disabled={editSaving}>
                  {editSaving ? (
                    <><Loader2 className="h-3 w-3 animate-spin mr-1" />Guardando...</>
                  ) : (
                    'Guardar cambios'
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
