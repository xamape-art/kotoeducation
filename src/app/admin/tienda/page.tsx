'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Plus, Edit, Trash2, Loader2, PawPrint, ExternalLink, ImagePlus, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatEuro } from '@/lib/invoice'
import type { Product, ShopSettings } from '@/types'

const BUCKET = 'gallery'

const slugify = (text: string) =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

type ProductForm = {
  name: string
  description: string
  price: string
  colors: string
  measurement_label: string
  engraving_label: string
  production_days: string
  active: boolean
  images: string[]
}

const emptyForm: ProductForm = {
  name: '',
  description: '',
  price: '',
  colors: '',
  measurement_label: '',
  engraving_label: '',
  production_days: '7',
  active: false,
  images: [],
}

export default function TiendaAdminPage() {
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState<Product[]>([])
  const [settings, setSettings] = useState<ShopSettings | null>(null)
  const [shippingPrice, setShippingPrice] = useState('')
  const [freeFrom, setFreeFrom] = useState('')
  const [savingSettings, setSavingSettings] = useState(false)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [form, setForm] = useState<ProductForm>(emptyForm)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    const load = async () => {
      const [{ data: p, error: pErr }, { data: s }] = await Promise.all([
        supabase.from('products').select('*').order('sort_order'),
        supabase.from('shop_settings').select('*').eq('id', 1).maybeSingle(),
      ])
      if (pErr) console.error('Error fetching products:', pErr)
      setProducts(p || [])
      if (s) {
        setSettings(s)
        setShippingPrice(String(s.shipping_price))
        setFreeFrom(s.free_shipping_from !== null ? String(s.free_shipping_from) : '')
      }
      setLoading(false)
    }
    load()
  }, [])

  const saveSettings = async (patch: Partial<ShopSettings>) => {
    setSavingSettings(true)
    const { data, error } = await supabase.from('shop_settings').update(patch).eq('id', 1).select().single()
    setSavingSettings(false)
    if (error) {
      console.error('Error saving shop settings:', error)
      alert('Error al guardar los ajustes.')
      return
    }
    setSettings(data)
  }

  const handleToggleShop = () => {
    if (!settings) return
    if (!settings.enabled && !confirm('¿Activar la tienda? Será visible para todo el mundo en la web.')) return
    saveSettings({ enabled: !settings.enabled })
  }

  const openAdd = () => {
    setEditing(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  const openEdit = (p: Product) => {
    setEditing(p)
    setForm({
      name: p.name,
      description: p.description || '',
      price: String(p.price),
      colors: p.colors.join(', '),
      measurement_label: p.measurement_label || '',
      engraving_label: p.engraving_label || '',
      production_days: String(p.production_days),
      active: p.active,
      images: p.images,
    })
    setDialogOpen(true)
  }

  const handleUpload = async (files: FileList | null) => {
    if (!files?.length) return
    setUploading(true)
    try {
      const urls: string[] = []
      for (const file of Array.from(files)) {
        const ext = file.name.split('.').pop()
        const path = `products/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
        const { error } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: false })
        if (error) throw error
        urls.push(supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl)
      }
      setForm((prev) => ({ ...prev, images: [...prev.images, ...urls] }))
    } catch (err) {
      console.error('Error uploading product image:', err)
      alert('Error al subir la foto.')
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    if (!form.name.trim() || !form.price) {
      alert('El nombre y el precio son obligatorios.')
      return
    }
    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      price: Number(form.price) || 0,
      colors: form.colors
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean),
      measurement_label: form.measurement_label.trim() || null,
      engraving_label: form.engraving_label.trim() || null,
      production_days: Number(form.production_days) || 7,
      active: form.active,
      images: form.images,
    }

    if (editing) {
      const { data, error } = await supabase.from('products').update(payload).eq('id', editing.id).select().single()
      if (error) {
        console.error('Error saving product:', error)
        alert('Error al guardar el producto.')
        return
      }
      setProducts((prev) => prev.map((p) => (p.id === editing.id ? data : p)))
    } else {
      const { data, error } = await supabase
        .from('products')
        .insert([{ ...payload, slug: slugify(payload.name), sort_order: products.length + 1 }])
        .select()
        .single()
      if (error) {
        console.error('Error saving product:', error)
        alert(error.code === '23505' ? 'Ya existe un producto con ese nombre.' : 'Error al guardar el producto.')
        return
      }
      setProducts((prev) => [...prev, data])
    }
    setDialogOpen(false)
  }

  const handleDelete = async (p: Product) => {
    if (!confirm(`¿Eliminar "${p.name}"? Los pedidos anteriores no se ven afectados.`)) return
    const { error } = await supabase.from('products').delete().eq('id', p.id)
    if (error) {
      console.error('Error deleting product:', error)
      alert('Error al eliminar el producto.')
      return
    }
    setProducts((prev) => prev.filter((x) => x.id !== p.id))
  }

  if (loading) {
    return (
      <div className="text-center py-12 text-muted-foreground max-w-5xl">
        <Loader2 className="h-10 w-10 animate-spin mx-auto mb-3 text-primary opacity-70" />
        <p>Cargando tienda...</p>
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="max-w-5xl py-12 text-muted-foreground">
        Falta crear las tablas de la tienda: ejecuta <code>supabase/migrations/003_shop.sql</code> en el SQL Editor de Supabase.
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Tienda</h1>
          <a
            href="/tienda"
            target="_blank"
            className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
          >
            Ver la tienda <ExternalLink className="h-3 w-3" />
          </a>
        </div>
        <Button size="sm" className="rounded-xl" onClick={openAdd}>
          <Plus className="h-4 w-4 mr-1" />
          Producto
        </Button>
      </div>

      {/* Settings */}
      <Card className="border border-border/60 shadow-sm">
        <CardContent className="p-5 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-5 items-end">
          <div className="grid grid-cols-2 gap-3 max-w-md">
            <div className="space-y-1.5">
              <Label>Envío por correo (€)</Label>
              <Input type="number" step="0.01" value={shippingPrice} onChange={(e) => setShippingPrice(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Envío gratis desde (€)</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="Nunca"
                value={freeFrom}
                onChange={(e) => setFreeFrom(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              className="col-span-2 w-fit rounded-xl"
              disabled={savingSettings}
              onClick={() =>
                saveSettings({
                  shipping_price: Number(shippingPrice) || 0,
                  free_shipping_from: freeFrom === '' ? null : Number(freeFrom),
                })
              }
            >
              Guardar envío
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <Badge
              variant="outline"
              className={
                settings.enabled
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  : 'bg-neutral-50 border-neutral-200 text-neutral-500'
              }
            >
              {settings.enabled ? 'Tienda visible' : 'Tienda oculta (solo tú)'}
            </Badge>
            <Button
              size="sm"
              variant={settings.enabled ? 'outline' : 'default'}
              className="rounded-xl"
              disabled={savingSettings}
              onClick={handleToggleShop}
            >
              {settings.enabled ? 'Ocultar tienda' : 'Activar tienda'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Products */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((p) => (
          <Card key={p.id} className="border border-border/60 shadow-sm overflow-hidden group">
            <div className="aspect-[4/3] bg-muted/40 flex items-center justify-center overflow-hidden">
              {p.images[0] ? (
                <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover" />
              ) : (
                <PawPrint className="h-10 w-10 text-muted-foreground/30" />
              )}
            </div>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="font-display text-base font-semibold">{p.name}</CardTitle>
                {p.active ? (
                  <Badge variant="outline" className="text-[10px] bg-emerald-50 border-emerald-200 text-emerald-700">
                    Visible
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px] text-muted-foreground">
                    Oculto
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="font-semibold text-primary">{Number(p.price) > 0 ? formatEuro(p.price) : 'Sin precio'}</p>
              <p className="text-xs text-muted-foreground">
                {p.colors.length > 0 ? p.colors.join(', ') : 'Sin colores definidos'}
              </p>
              <div className="flex gap-1 pt-1">
                <Button variant="outline" size="sm" className="rounded-lg" onClick={() => openEdit(p)}>
                  <Edit className="h-3.5 w-3.5 mr-1" />
                  Editar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => handleDelete(p)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {products.length === 0 && <p className="text-muted-foreground text-sm py-8">Todavía no hay productos.</p>}
      </div>

      {/* Product dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:!max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? `Editar ${editing.name}` : 'Nuevo producto'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-[1fr_120px] gap-3">
              <div className="space-y-1.5">
                <Label>Nombre *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Precio (€, IVA incl.) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Descripción</Label>
              <Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Colores (separados por comas)</Label>
              <Input
                placeholder="Ej. Mostaza, Verde bosque, Rosa palo"
                value={form.colors}
                onChange={(e) => setForm({ ...form, colors: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Medida que pido al cliente</Label>
              <Input
                placeholder="Ej. Contorno del cuello (cm). Vacío = no pedir"
                value={form.measurement_label}
                onChange={(e) => setForm({ ...form, measurement_label: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Texto a grabar</Label>
              <Input
                placeholder="Ej. Texto a grabar (nombre y teléfono). Vacío = no pedir"
                value={form.engraving_label}
                onChange={(e) => setForm({ ...form, engraving_label: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3 items-end">
              <div className="space-y-1.5">
                <Label>Días de elaboración</Label>
                <Input
                  type="number"
                  value={form.production_days}
                  onChange={(e) => setForm({ ...form, production_days: e.target.value })}
                />
              </div>
              <label className="flex items-center gap-2 text-sm cursor-pointer h-9">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-primary"
                  checked={form.active}
                  onChange={(e) => setForm({ ...form, active: e.target.checked })}
                />
                Visible en la tienda
              </label>
            </div>

            <div className="space-y-1.5">
              <Label>Fotos</Label>
              <div className="flex flex-wrap gap-2">
                {form.images.map((src) => (
                  <div key={src} className="relative h-20 w-20 rounded-lg overflow-hidden border">
                    <img src={src} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, images: form.images.filter((i) => i !== src) })}
                      className="absolute top-1 right-1 h-5 w-5 rounded-full bg-black/60 text-white flex items-center justify-center"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <label className="h-20 w-20 rounded-lg border border-dashed flex flex-col items-center justify-center text-muted-foreground text-[10px] cursor-pointer hover:bg-muted/40">
                  {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5 mb-1" />}
                  {!uploading && 'Añadir'}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => handleUpload(e.target.files)}
                    disabled={uploading}
                  />
                </label>
              </div>
              <p className="text-[11px] text-muted-foreground">La primera foto es la principal.</p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={uploading}>
                Guardar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
