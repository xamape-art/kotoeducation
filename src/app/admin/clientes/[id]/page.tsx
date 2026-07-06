'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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

const statusBadge: Record<string, { label: string; className: string }> = {
  confirmed: { label: 'Confirmada', className: 'bg-green-100 text-green-700' },
  completed: { label: 'Completada', className: 'bg-gray-100 text-gray-600' },
  pending: { label: 'Pendiente', className: 'bg-yellow-100 text-yellow-700' },
  cancelled: { label: 'Cancelada', className: 'bg-red-100 text-red-600' },
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
  const [loading, setLoading] = useState(true)

  // Edit Client dialog states
  const [openEditClient, setOpenEditClient] = useState(false)
  const [editName, setEditName] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editAddress, setEditAddress] = useState('')
  const [editNotes, setEditNotes] = useState('')

  // Pet dialog states
  const [openPetDialog, setOpenPetDialog] = useState(false)
  const [editingPet, setEditingPet] = useState<any>(null)
  const [petName, setPetName] = useState('')
  const [petBreed, setPetBreed] = useState('')
  const [petSex, setPetSex] = useState('male')
  const [petWeight, setPetWeight] = useState('')
  const [petAgeYears, setPetAgeYears] = useState('')
  const [petAgeMonths, setPetAgeMonths] = useState('')
  const [petNeeds, setPetNeeds] = useState('')
  const [petNotes, setPetNotes] = useState('')
  const [petPhoto, setPetPhoto] = useState<string | null>(null)

  const fetchClientData = async () => {
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

      // Safe fetch for appointments if the table exists
      const { data: aptData } = await supabase
        .from('appointments')
        .select('*')
        .eq('client_id', clientId)
      
      setAppointments(aptData || [])
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
        <p className="text-muted-foreground">No se encontró el cliente o no existe.</p>
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
    setEditNotes(client.notes || '')
    setOpenEditClient(true)
  }

  const handleUpdateClient = async () => {
    if (!editName) {
      alert('El nombre es obligatorio.')
      return
    }
    try {
      const { data, error } = await supabase
        .from('clients')
        .update({
          name: editName,
          phone: editPhone || null,
          email: editEmail || null,
          address: editAddress || null,
          notes: editNotes || null,
        })
        .eq('id', clientId)
        .select()

      if (error) throw error
      if (data && data[0]) {
        setClient({ ...client, ...data[0] })
      }
      setOpenEditClient(false)
    } catch (err) {
      console.error('Error updating client:', err)
      alert('Error al actualizar el cliente.')
    }
  }

  const handleDeleteClient = async () => {
    if (confirm('¿Estás seguro de que deseas eliminar este cliente?')) {
      try {
        const { error } = await supabase
          .from('clients')
          .delete()
          .eq('id', clientId)

        if (error) throw error
        router.push('/admin/clientes')
      } catch (err) {
        console.error('Error deleting client:', err)
        alert('Error al eliminar el cliente.')
      }
    }
  }

  const handleOpenAddPet = () => {
    setEditingPet(null)
    setPetName('')
    setPetBreed('')
    setPetSex('male')
    setPetWeight('')
    setPetAgeYears('')
    setPetAgeMonths('')
    setPetNeeds('')
    setPetNotes('')
    setPetPhoto(null)
    setOpenPetDialog(true)
  }

  const handleOpenEditPet = (pet: any) => {
    setEditingPet(pet)
    setPetName(pet.name)
    setPetBreed(pet.breed || '')
    setPetSex(pet.sex || 'male')
    setPetWeight(pet.weight ? String(pet.weight) : '')
    setPetAgeYears(pet.age_years ? String(pet.age_years) : '')
    setPetAgeMonths(pet.age_months ? String(pet.age_months) : '')
    setPetNeeds(pet.needs || '')
    setPetNotes(pet.notes || '')
    setPetPhoto(pet.photo || null)
    setOpenPetDialog(true)
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPetPhoto(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSavePet = async () => {
    if (!petName) {
      alert('El nombre de la mascota es obligatorio.')
      return
    }

    try {
      const petObj = {
        client_id: clientId,
        name: petName,
        breed: petBreed || null,
        sex: petSex,
        weight: Number(petWeight) || 0,
        age_years: Number(petAgeYears) || 0,
        age_months: Number(petAgeMonths) || 0,
        needs: petNeeds || null,
        notes: petNotes || null,
        photo: petPhoto || null,
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
      console.error('Error saving pet:', err)
      alert('Error al guardar la mascota.')
    }
  }

  const handleDeletePet = async (petId: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar esta mascota?')) {
      try {
        const { error } = await supabase
          .from('pets')
          .delete()
          .eq('id', petId)

        if (error) throw error
        setPets((prev) => prev.filter((p) => p.id !== petId))
      } catch (err) {
        console.error('Error deleting pet:', err)
        alert('Error al eliminar la mascota.')
      }
    }
  }

  const totalSpent = appointments
    .filter((a) => a.status === 'completed')
    .reduce((sum, a) => sum + a.price, 0)

  return (
    <div className="space-y-6 max-w-4xl">
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
              Cliente desde {client.created_at ? new Date(client.created_at).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }) : 'Enero 2024'}
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

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total citas', value: appointments.length },
          { label: 'Completadas', value: appointments.filter((a) => a.status === 'completed').length },
          { label: 'Mascotas', value: pets.length },
          { label: 'Total gastado', value: `${totalSpent}€` },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="info">
        <TabsList>
          <TabsTrigger value="info">Info</TabsTrigger>
          <TabsTrigger value="mascotas">Mascotas</TabsTrigger>
          <TabsTrigger value="historial">Historial</TabsTrigger>
          <TabsTrigger value="notas">Notas</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-4 mt-4">
          <Card>
            <CardContent className="p-5 space-y-4">
              {client.email && (
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                  <a href={`mailto:${client.email}`} className="hover:underline">{client.email}</a>
                </div>
              )}
              {client.phone && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                  <a href={`tel:${client.phone}`} className="hover:underline">{client.phone}</a>
                </div>
              )}
              {client.address && (
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span>{client.address}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mascotas" className="space-y-4 mt-4">
          <div className="flex justify-end">
            <Button size="sm" onClick={handleOpenAddPet}>
              <Plus className="h-4 w-4 mr-2" />
              Añadir mascota
            </Button>
          </div>
          {pets.map((pet) => (
            <Card key={pet.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 font-display text-lg">
                    <Dog className="h-4 w-4 text-primary" />
                    {pet.name}
                    <Badge variant="outline" className="text-xs">{pet.breed || 'Sin raza'}</Badge>
                    <Badge variant="outline" className="text-xs">{pet.sex === 'male' ? '♂ Macho' : '♀ Hembra'}</Badge>
                  </CardTitle>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleOpenEditPet(pet)}>
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDeletePet(pet.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col sm:flex-row gap-4 text-sm pb-4">
                {pet.photo && (
                  <div className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0 border bg-muted">
                    <img src={pet.photo} alt={pet.name} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1 space-y-2">
                  <div className="flex gap-6 text-muted-foreground">
                    <span>Peso: <strong className="text-foreground">{pet.weight || 0} kg</strong></span>
                    <span>Edad: <strong className="text-foreground">{pet.age_years || 0} años {pet.age_months || 0} meses</strong></span>
                  </div>
                  {pet.needs && (
                    <div>
                      <p className="font-medium text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Necesidades especiales</p>
                      <p className="text-muted-foreground">{pet.needs}</p>
                    </div>
                  )}
                  {pet.notes && (
                    <div>
                      <p className="font-medium text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Notas</p>
                      <p className="text-muted-foreground">{pet.notes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          {pets.length === 0 && (
            <div className="text-center py-8 text-muted-foreground border border-dashed rounded-xl">
              <Dog className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Sin mascotas registradas</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="historial" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {appointments.map((apt) => (
                  <div key={apt.id} className="flex items-center gap-4 p-4 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground w-28 shrink-0">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(apt.date).toLocaleDateString('es-ES')}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{apt.service}</p>
                      <p className="text-muted-foreground text-xs">{apt.pet_name} · {apt.time}</p>
                    </div>
                    <span className="font-medium">{apt.price}€</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge[apt.status]?.className || ''}`}>
                      {statusBadge[apt.status]?.label || apt.status}
                    </span>
                  </div>
                ))}
                {appointments.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Sin historial de citas</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notas" className="mt-4">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <FileText className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <p className="text-sm text-muted-foreground">{client.notes || 'Sin notas adicionales.'}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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
            <div className="space-y-1.5">
              <Label>Dirección</Label>
              <Input value={editAddress} onChange={(e) => setEditAddress(e.target.value)} />
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

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Sexo</Label>
                <Select value={petSex} onValueChange={(val) => setPetSex(val || 'male')}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Macho</SelectItem>
                    <SelectItem value="female">Hembra</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Peso (kg)</Label>
                <Input type="number" value={petWeight} onChange={(e) => setPetWeight(e.target.value)} placeholder="Ej. 18" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Edad (Años)</Label>
                <Input type="number" value={petAgeYears} onChange={(e) => setPetAgeYears(e.target.value)} placeholder="0" />
              </div>
              <div className="space-y-1.5">
                <Label>Edad (Meses)</Label>
                <Input type="number" value={petAgeMonths} onChange={(e) => setPetAgeMonths(e.target.value)} placeholder="0" />
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
                  <p className="text-[10px] text-muted-foreground">Sube un archivo de imagen (PNG/JPG)</p>
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
              <Button onClick={handleSavePet}>Guardar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
