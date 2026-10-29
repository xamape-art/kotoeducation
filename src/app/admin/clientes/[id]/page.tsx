'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowLeft, Phone, Mail, MapPin, Dog, Calendar, Edit, Plus, FileText, Trash2, Camera, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { alertDbError } from '@/lib/db-error'
import { STATUS_LABELS, STATUS_BADGE } from '@/lib/appointments'
import { formatEuro, formatDate } from '@/lib/invoice'

const SPECIES_LABELS: Record<string, string> = { dog: 'Perro', cat: 'Gato', other: 'Otro' }
const SEX_LABELS: Record<string, string> = { male: 'Macho', female: 'Hembra' }

const PHOTO_BUCKET = 'gallery'

// UUID validation helper
const validateUuid = (uuid: string) => {
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return regex.test(uuid);
}

export default function ClientDetailPage() {
  const supabase = createClient()
  const params = useParams()
  const router = useRouter()
  const clientId = params.id as string

  // Data states
  const [client, setClient] = useState<any>(null)
  const [pets, setPets] = useState<any[]>([])
  const [appointments, setAppointments] = useState<any[]>([])
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Edit Client dialog states
  const [openEditClient, setOpenEditClient] = useState(false)
  const [editName, setEditName] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editAddress, setEditAddress] = useState('')
  const [editNif, setEditNif] = useState('')
  const [editNotes, setEditNotes] = useState('')

  // Pet dialog states
  const [openPetDialog, setOpenPetDialog] = useState(false)
  const [editingPet, setEditingPet] = useState<any>(null)
  const [petName, setPetName] = useState('')
  const [petSpecies, setPetSpecies] = useState('dog')
  const [petBreed, setPetBreed] = useState('')
  const [petSex, setPetSex] = useState('male')
  const [petWeight, setPetWeight] = useState('')
  const [petAgeYears, setPetAgeYears] = useState('')
  const [petAgeMonths, setPetAgeMonths] = useState('')
  const [petNeeds, setPetNeeds] = useState('')
  const [petNotes, setPetNotes] = useState('')
  const [petPhoto, setPetPhoto] = useState<string | null>(null)
  const [petPhotoFile, setPetPhotoFile] = useState<File | null>(null)
  const [savingPet, setSavingPet] = useState(false)

  const fetchClientData = async () => {
    if (!validateUuid(clientId)) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true)
      const { data: clientData, error: clientErr } = await supabase
        .from('clients')
        .select('*, pets(*)')
        .eq('id', clientId)
        .single()

      if (clientErr) throw clientErr

      setClient(clientData)
      setPets(clientData?.pets || [])

      const [{ data: aptData, error: aptErr }, { data: invData, error: invErr }] = await Promise.all([
        supabase
          .from('appointments')
          .select('*, pets(name), services(name)')
          .eq('client_id', clientId)
          .order('date', { ascending: false })
          .order('time', { ascending: false }),
        supabase
          .from('invoices')
          .select('id, number, date, total, status')
          .eq('client_id', clientId)
          .order('date', { ascending: false }),
      ])
      if (aptErr) console.error('Error fetching appointments:', aptErr)
      if (invErr) console.error('Error fetching invoices:', invErr)

      setAppointments(aptData || [])
      setInvoices(invData || [])
    } catch (err) {
      console.error('Error fetching client details:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (clientId) {
      fetchClientData()
    }
  }, [clientId])

  if (loading) {
    return (
      <div className="text-center py-12 text-muted-foreground max-w-4xl">
        <Loader2 className="h-10 w-10 animate-spin mx-auto mb-3 text-primary opacity-70" />
        <p>Cargando detalles del cliente...</p>
      </div>
    )
  }

  if (!client) {
    return (
      <div className="text-center py-12 max-w-4xl space-y-4">
        <p className="text-muted-foreground">No se encontró el cliente o el ID no es válido.</p>
        <Button asChild variant="outline">
          <Link href="/admin/clientes">Volver a Clientes</Link>
        </Button>
      </div>
    )
  }

  const handleOpenEditClient = () => {
    setEditName(client.name)
    setEditPhone(client.phone || '')
    setEditEmail(client.email || '')
    setEditAddress(client.address || '')
    setEditNif(client.nif || '')
    setEditNotes(client.notes || '')
    setOpenEditClient(true)
  }

  const handleUpdateClient = async () => {
    if (!editName.trim()) {
      alert('El nombre es obligatorio.')
      return
    }
    try {
      const { data, error } = await supabase
        .from('clients')
        .update({
          name: editName.trim(),
          phone: editPhone.trim() || null,
          email: editEmail.trim() || null,
          address: editAddress.trim() || null,
          nif: editNif.trim().toUpperCase() || null,
          notes: editNotes.trim() || null,
        })
        .eq('id', clientId)
        .select()

      if (error) throw error
      if (data && data[0]) {
        setClient({ ...client, ...data[0] })
      }
      setOpenEditClient(false)
    } catch (err) {
      alertDbError(err, 'actualizar el cliente')
    }
  }

  const handleDeleteClient = async () => {
    if (appointments.length > 0) {
      alert(
        `${client.name} tiene ${appointments.length} cita(s) en el calendario, así que no se puede eliminar. ` +
          'Elimina antes sus citas si de verdad quieres borrar la ficha.'
      )
      return
    }
    const invoiceNote = invoices.length > 0 ? '\n\nSus facturas se conservarán con los datos del cliente.' : ''
    if (!confirm(`¿Eliminar a ${client.name} y sus mascotas?${invoiceNote}`)) return

    const { error } = await supabase.from('clients').delete().eq('id', clientId)
    if (error) {
      alertDbError(error, 'eliminar')
      return
    }
    router.push('/admin/clientes')
  }

  const handleOpenAddPet = () => {
    setEditingPet(null)
    setPetName('')
    setPetSpecies('dog')
    setPetBreed('')
    setPetSex('male')
    setPetWeight('')
    setPetAgeYears('')
    setPetAgeMonths('')
    setPetNeeds('')
    setPetNotes('')
    setPetPhoto(null)
    setPetPhotoFile(null)
    setOpenPetDialog(true)
  }

  const handleOpenEditPet = (pet: any) => {
    setEditingPet(pet)
    setPetName(pet.name)
    setPetSpecies(pet.species || 'dog')
    setPetBreed(pet.breed || '')
    setPetSex(pet.sex || 'male')
    setPetWeight(pet.weight_kg ? String(pet.weight_kg) : '')
    setPetAgeYears(pet.age_years ? String(pet.age_years) : '')
    setPetAgeMonths(pet.age_months ? String(pet.age_months) : '')
    setPetNeeds(pet.needs || '')
    setPetNotes(pet.notes || '')
    setPetPhoto(pet.photo_url || null)
    setPetPhotoFile(null)
    setOpenPetDialog(true)
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('La foto es demasiado grande (máximo 10 MB).')
        e.target.value = ''
        return
      }
      setPetPhotoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPetPhoto(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSavePet = async () => {
    if (!petName.trim()) {
      alert('El nombre de la mascota es obligatorio.')
      return
    }

    setSavingPet(true)
    try {
      // New photos go to Storage; the preview (data URL) is only for the dialog
      let photoUrl = editingPet?.photo_url || null
      if (petPhotoFile) {
        const ext = petPhotoFile.name.split('.').pop()
        const path = `pets/${clientId}/${Date.now()}.${ext}`
        const { error: upErr } = await supabase.storage.from(PHOTO_BUCKET).upload(path, petPhotoFile)
        if (upErr) throw upErr
        photoUrl = supabase.storage.from(PHOTO_BUCKET).getPublicUrl(path).data.publicUrl
      } else if (!petPhoto) {
        photoUrl = null
      }

      const numberOrNull = (v: string) => (v.trim() === '' ? null : Number(v))
      const petObj = {
        client_id: clientId,
        name: petName.trim(),
        species: petSpecies,
        breed: petBreed.trim() || null,
        sex: petSex,
        weight_kg: numberOrNull(petWeight),
        age_years: numberOrNull(petAgeYears),
        age_months: numberOrNull(petAgeMonths),
        needs: petNeeds.trim() || null,
        notes: petNotes.trim() || null,
        photo_url: photoUrl,
      }

      if (editingPet) {
        const { data, error } = await supabase
          .from('pets')
          .update(petObj)
          .eq('id', editingPet.id)
          .select()

        if (error) throw error
        if (data && data[0]) {
          setPets((prev) => prev.map((p) => (p.id === editingPet.id ? data[0] : p)))
        }
      } else {
        const { data, error } = await supabase
          .from('pets')
          .insert([petObj])
          .select()

        if (error) throw error
        if (data && data[0]) {
          setPets((prev) => [...prev, data[0]])
        }
      }
      setOpenPetDialog(false)
    } catch (err) {
      alertDbError(err, 'guardar la mascota')
    } finally {
      setSavingPet(false)
    }
  }

  const handleDeletePet = async (petId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta mascota?')) return

    const { error } = await supabase.from('pets').delete().eq('id', petId)
    if (error) {
      if (error.code === '23503') {
        alert('Esta mascota tiene citas en el calendario, así que no se puede eliminar.')
      } else {
        alertDbError(error, 'eliminar')
      }
      return
    }
    setPets((prev) => prev.filter((p) => p.id !== petId))
  }

  const totalSpent = appointments
    .filter((a) => a.status === 'completed')
    .reduce((sum, a) => sum + Number(a.price), 0)

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/admin/clientes">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex items-center gap-3 flex-1">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
              {client.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight">{client.name}</h1>
            <p className="text-muted-foreground text-sm">
              Cliente desde {new Date(client.created_at).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleOpenEditClient}>
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={handleDeleteClient}>
            <Trash2 className="h-4 w-4 mr-2" />
            Eliminar
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total citas', value: appointments.length },
          { label: 'Completadas', value: appointments.filter((a) => a.status === 'completed').length },
          { label: 'Mascotas', value: pets.length },
          { label: 'Total citas completadas', value: formatEuro(totalSpent) },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dashboard Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Info & Notes */}
        <div className="space-y-6">
          <Card className="border border-border/60 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-base font-semibold">Información de contacto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm pt-2">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                {client.email ? (
                  <a href={`mailto:${client.email}`} className="hover:underline truncate">{client.email}</a>
                ) : (
                  <span className="text-muted-foreground italic">Sin email</span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                {client.phone ? (
                  <a href={`tel:${client.phone}`} className="hover:underline">{client.phone}</a>
                ) : (
                  <span className="text-muted-foreground italic">Sin teléfono</span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                {client.address ? (
                  <span>{client.address}</span>
                ) : (
                  <span className="text-muted-foreground italic">Sin dirección</span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                {client.nif ? (
                  <span>NIF: {client.nif}</span>
                ) : (
                  <span className="text-muted-foreground italic">Sin NIF (necesario para facturas a empresas)</span>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border/60 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-base font-semibold">Notas adicionales</CardTitle>
            </CardHeader>
            <CardContent className="text-sm pt-2">
              {client.notes ? (
                <p className="text-muted-foreground whitespace-pre-wrap">{client.notes}</p>
              ) : (
                <p className="text-muted-foreground italic">Sin notas escritas.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Pets & Appointments */}
        <div className="md:col-span-2 space-y-6">
          {/* Pets section */}
          <Card className="border border-border/60 shadow-sm">
            <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <Dog className="h-5 w-5 text-primary" />
                Mascotas
              </CardTitle>
              <Button size="sm" onClick={handleOpenAddPet} className="h-8">
                <Plus className="h-4 w-4 mr-1" />
                Añadir mascota
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {pets.map((pet) => (
                <div key={pet.id} className="p-4 border rounded-xl hover:shadow-sm transition-shadow bg-muted/20">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-base">{pet.name}</p>
                      <Badge variant="outline" className="text-xs bg-background">{SPECIES_LABELS[pet.species] || 'Perro'}</Badge>
                      {pet.breed && <Badge variant="outline" className="text-xs bg-background">{pet.breed}</Badge>}
                      {pet.sex && (
                        <Badge variant="outline" className="text-xs bg-background">{pet.sex === 'male' ? '♂ Macho' : '♀ Hembra'}</Badge>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleOpenEditPet(pet)}>
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDeletePet(pet.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 text-sm">
                    {pet.photo_url && (
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0 border bg-muted">
                        <img src={pet.photo_url} alt={pet.name} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1 space-y-2">
                      <div className="flex gap-6 text-muted-foreground text-xs">
                        {pet.weight_kg != null && (
                          <span>Peso: <strong className="text-foreground">{pet.weight_kg} kg</strong></span>
                        )}
                        {(pet.age_years != null || pet.age_months != null) && (
                          <span>Edad: <strong className="text-foreground">{pet.age_years || 0} años {pet.age_months || 0} meses</strong></span>
                        )}
                      </div>
                      {pet.needs && (
                        <div>
                          <p className="font-medium text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">Necesidades especiales</p>
                          <p className="text-muted-foreground text-xs">{pet.needs}</p>
                        </div>
                      )}
                      {pet.notes && (
                        <div>
                          <p className="font-medium text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">Notas</p>
                          <p className="text-muted-foreground text-xs">{pet.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {pets.length === 0 && (
                <div className="text-center py-8 text-muted-foreground border border-dashed rounded-xl">
                  <Dog className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-xs">Sin mascotas registradas</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Appointments history section */}
          <Card className="border border-border/60 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Historial de citas
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {appointments.map((apt) => (
                  <div key={apt.id} className="flex items-center gap-4 p-4 text-xs">
                    <div className="flex items-center gap-1.5 text-muted-foreground w-24 shrink-0">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{formatDate(apt.date)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{apt.services?.name}</p>
                      <p className="text-muted-foreground text-[10px]">{apt.pets?.name} · {apt.time?.slice(0, 5)}</p>
                    </div>
                    <span className="font-semibold text-right w-16 shrink-0">{formatEuro(apt.price)}</span>
                    <Badge variant="outline" className={`text-[10px] px-2 py-0.5 font-medium ${STATUS_BADGE[apt.status] || ''}`}>
                      {STATUS_LABELS[apt.status] || apt.status}
                    </Badge>
                  </div>
                ))}
                {appointments.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p className="text-xs">Sin historial de citas</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Invoices section */}
          <Card className="border border-border/60 shadow-sm">
            <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Facturas
              </CardTitle>
              <Button asChild size="sm" variant="outline" className="h-8">
                <Link href={`/admin/facturas/nueva?cliente=${clientId}`}>
                  <Plus className="h-4 w-4 mr-1" />
                  Nueva factura
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {invoices.map((inv) => (
                  <Link
                    key={inv.id}
                    href={`/admin/facturas/${inv.id}`}
                    className="flex items-center gap-4 p-4 text-xs hover:bg-muted/20 transition-colors"
                  >
                    <span className="font-mono font-medium w-20 shrink-0">{inv.number}</span>
                    <span className="text-muted-foreground flex-1">{formatDate(inv.date)}</span>
                    <span className="font-semibold">{formatEuro(inv.total)}</span>
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${
                        inv.status === 'paid'
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                          : 'bg-amber-50 border-amber-200 text-amber-700'
                      }`}
                    >
                      {inv.status === 'paid' ? 'Cobrada' : 'Pendiente'}
                    </Badge>
                  </Link>
                ))}
                {invoices.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p className="text-xs">Sin facturas</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Client Dialog */}
      <Dialog open={openEditClient} onOpenChange={setOpenEditClient}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar cliente</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Nombre *</Label>
                <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Teléfono</Label>
                <Input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
            </div>
            <div className="grid grid-cols-[1fr_140px] gap-3">
              <div className="space-y-1.5">
                <Label>Dirección</Label>
                <Input value={editAddress} onChange={(e) => setEditAddress(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>DNI / NIF</Label>
                <Input value={editNif} onChange={(e) => setEditNif(e.target.value)} placeholder="Opcional" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Notas</Label>
              <Textarea placeholder="Notas adicionales..." rows={3} value={editNotes} onChange={(e) => setEditNotes(e.target.value)} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setOpenEditClient(false)}>Cancelar</Button>
              <Button onClick={handleUpdateClient}>Guardar cambios</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Pet Dialog (Add/Edit) */}
      <Dialog open={openPetDialog} onOpenChange={setOpenPetDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingPet ? 'Editar mascota' : 'Añadir mascota'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Nombre *</Label>
                <Input value={petName} onChange={(e) => setPetName(e.target.value)} placeholder="Nombre" />
              </div>
              <div className="space-y-1.5">
                <Label>Raza</Label>
                <Input value={petBreed} onChange={(e) => setPetBreed(e.target.value)} placeholder="Ej. Galgo, Mestizo" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label>Animal</Label>
                <Select items={SPECIES_LABELS} value={petSpecies} onValueChange={(val) => setPetSpecies(val || 'dog')}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(SPECIES_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Sexo</Label>
                <Select items={SEX_LABELS} value={petSex} onValueChange={(val) => setPetSex(val || 'male')}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(SEX_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Peso (kg)</Label>
                <Input type="number" min="0" step="0.1" value={petWeight} onChange={(e) => setPetWeight(e.target.value)} placeholder="Ej. 18" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Edad (Años)</Label>
                <Input type="number" min="0" value={petAgeYears} onChange={(e) => setPetAgeYears(e.target.value)} placeholder="0" />
              </div>
              <div className="space-y-1.5">
                <Label>Edad (Meses)</Label>
                <Input type="number" min="0" max="11" value={petAgeMonths} onChange={(e) => setPetAgeMonths(e.target.value)} placeholder="0" />
              </div>
            </div>

            {/* Pet Photo Input */}
            <div className="space-y-2">
              <Label>Foto de la mascota</Label>
              <div className="flex items-center gap-3">
                {petPhoto ? (
                  <div className="relative w-14 h-14 rounded-lg overflow-hidden border shrink-0 bg-muted">
                    <img src={petPhoto} alt="Previsualización" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-lg border border-dashed flex items-center justify-center text-muted-foreground shrink-0 bg-muted/40">
                    <Camera className="h-5 w-5" />
                  </div>
                )}
                <div className="flex-1 space-y-1">
                  <Input type="file" accept="image/*" onChange={handlePhotoChange} className="text-xs cursor-pointer" />
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] text-muted-foreground">Sube un archivo de imagen (PNG/JPG)</p>
                    {petPhoto && (
                      <button
                        type="button"
                        className="text-[10px] text-destructive hover:underline"
                        onClick={() => {
                          setPetPhoto(null)
                          setPetPhotoFile(null)
                        }}
                      >
                        Quitar foto
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Necesidades especiales</Label>
              <Textarea placeholder="Medicación, reactividad..." rows={2} value={petNeeds} onChange={(e) => setPetNeeds(e.target.value)} />
            </div>

            <div className="space-y-1.5">
              <Label>Notas</Label>
              <Textarea placeholder="Rutina, alimentación..." rows={2} value={petNotes} onChange={(e) => setPetNotes(e.target.value)} />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setOpenPetDialog(false)}>Cancelar</Button>
              <Button onClick={handleSavePet} disabled={savingPet}>
                {savingPet && <Loader2 className="h-3 w-3 animate-spin mr-1" />}
                Guardar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
