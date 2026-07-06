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
import { ArrowLeft, Phone, Mail, MapPin, Dog, Calendar, Edit, Plus, FileText, Trash2, Camera } from 'lucide-react'
import Link from 'next/link'

const mockClientsData = [
  { id: '1', name: 'Xavier M.', email: 'xavier@email.com', phone: '+34 611 222 333', address: 'C/ Major, 12, Terrassa', notes: 'Prefiere paseos por la tarde. Koto es reactivo con perros desconocidos.', createdAt: 'Enero 2024' },
  { id: '2', name: 'Laura G.', email: 'laura@email.com', phone: '+34 622 333 444', address: 'Av. Barcelona, 45, Terrassa', notes: 'Max es muy amigable.', createdAt: 'Febrero 2024' },
  { id: '3', name: 'Marc T.', email: 'marc@email.com', phone: '+34 633 444 555', address: 'C/ del Vent, 8, Terrassa', notes: 'Luna corre mucho.', createdAt: 'Marzo 2024' },
  { id: '4', name: 'Ana R.', email: 'ana@email.com', phone: '+34 644 555 666', address: 'C/ Nou, 15, Terrassa', notes: 'Mochi es tímido.', createdAt: 'Abril 2024' },
  { id: '5', name: 'Pedro L.', email: 'pedro@email.com', phone: '+34 655 666 777', address: 'C/ Ample, 88, Terrassa', notes: 'Rocky y Nala se llevan genial.', createdAt: 'Mayo 2024' },
]

const mockPetsData: Record<string, any[]> = {
  '1': [
    { id: 'p1', name: 'Koto', breed: 'Galgo español', sex: 'male', weight: 18, ageYears: 4, ageMonths: 3, needs: 'Reactivo con perros desconocidos. Necesita paseos tranquilos. Le encanta correr.', notes: 'Come 2 veces al día. Pienso Hills Adult. Vacunas al día.', photo: null }
  ],
  '2': [
    { id: 'p2', name: 'Max', breed: 'Golden Retriever', sex: 'male', weight: 32, ageYears: 2, ageMonths: 6, needs: '', notes: 'Muy juguetón.', photo: null }
  ],
  '3': [
    { id: 'p3', name: 'Luna', breed: 'Galgo', sex: 'female', weight: 20, ageYears: 3, ageMonths: 0, needs: '', notes: 'Le gusta perseguir pelotas.', photo: null }
  ],
  '4': [
    { id: 'p4', name: 'Mochi', breed: 'Gato Siamés', sex: 'male', weight: 4.5, ageYears: 1, ageMonths: 2, needs: '', notes: 'Le gusta que le cepillen.', photo: null }
  ],
  '5': [
    { id: 'p5', name: 'Rocky', breed: 'Labrador', sex: 'male', weight: 35, ageYears: 5, ageMonths: 8, needs: '', notes: 'Tiene mucha energía.', photo: null },
    { id: 'p6', name: 'Nala', breed: 'Mestiza', sex: 'female', weight: 12, ageYears: 2, ageMonths: 1, needs: '', notes: 'Muy cariñosa.', photo: null }
  ],
}

const mockAppointmentsData = [
  { id: '1', clientId: '1', date: '06/07/2025', time: '09:00', service: 'Paseo 30min', pet: 'Koto', price: 10, status: 'confirmed' },
  { id: '2', clientId: '1', date: '03/07/2025', time: '09:00', service: 'Paseo 30min', pet: 'Koto', price: 10, status: 'completed' },
  { id: '3', clientId: '1', date: '01/07/2025', time: '09:00', service: 'Paseo 30min', pet: 'Koto', price: 10, status: 'completed' },
  { id: '4', clientId: '1', date: '28/06/2025', time: '16:30', service: 'Visita domicilio', pet: 'Koto', price: 10, status: 'completed' },
]

const statusBadge: Record<string, { label: string; className: string }> = {
  confirmed: { label: 'Confirmada', className: 'bg-green-100 text-green-700' },
  completed: { label: 'Completada', className: 'bg-gray-100 text-gray-600' },
  pending: { label: 'Pendiente', className: 'bg-yellow-100 text-yellow-700' },
  cancelled: { label: 'Cancelada', className: 'bg-red-100 text-red-600' },
}

export default function ClientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const clientId = (params.id as string) || '1'

  // Data states
  const [client, setClient] = useState<any>(null)
  const [pets, setPets] = useState<any[]>([])
  const [appointments, setAppointments] = useState<any[]>([])

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

  useEffect(() => {
    const foundClient = mockClientsData.find((c) => c.id === clientId) || mockClientsData[0]
    setClient(foundClient)

    const foundPets = mockPetsData[clientId] || []
    setPets(foundPets)

    const foundApts = mockAppointmentsData.filter((a) => a.clientId === clientId)
    setAppointments(foundApts)
  }, [clientId])

  if (!client) {
    return <div className="text-center py-12">Cargando detalles del cliente...</div>
  }

  const handleOpenEditClient = () => {
    setEditName(client.name)
    setEditPhone(client.phone || '')
    setEditEmail(client.email || '')
    setEditAddress(client.address || '')
    setEditNotes(client.notes || '')
    setOpenEditClient(true)
  }

  const handleUpdateClient = () => {
    if (!editName) {
      alert('El nombre es obligatorio.')
      return
    }
    setClient({
      ...client,
      name: editName,
      phone: editPhone,
      email: editEmail,
      address: editAddress,
      notes: editNotes,
    })
    setOpenEditClient(false)
  }

  const handleDeleteClient = () => {
    if (confirm('¿Estás seguro de que deseas eliminar este cliente?')) {
      router.push('/admin/clientes')
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
    setPetBreed(pet.breed)
    setPetSex(pet.sex)
    setPetWeight(String(pet.weight))
    setPetAgeYears(String(pet.ageYears))
    setPetAgeMonths(String(pet.ageMonths))
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

  const handleSavePet = () => {
    if (!petName) {
      alert('El nombre de la mascota es obligatorio.')
      return
    }

    const petObj = {
      id: editingPet ? editingPet.id : String(Date.now()),
      name: petName,
      breed: petBreed,
      sex: petSex,
      weight: Number(petWeight) || 0,
      ageYears: Number(petAgeYears) || 0,
      ageMonths: Number(petAgeMonths) || 0,
      needs: petNeeds,
      notes: petNotes,
      photo: petPhoto,
    }

    if (editingPet) {
      setPets((prev) => prev.map((p) => (p.id === editingPet.id ? petObj : p)))
    } else {
      setPets((prev) => [...prev, petObj])
    }
    setOpenPetDialog(false)
  }

  const handleDeletePet = (petId: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar esta mascota?')) {
      setPets((prev) => prev.filter((p) => p.id !== petId))
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
            <p className="text-muted-foreground text-sm">Cliente desde {client.createdAt || 'Enero 2024'}</p>
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
                    <Badge variant="outline" className="text-xs">{pet.breed}</Badge>
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
                    <span>Peso: <strong className="text-foreground">{pet.weight} kg</strong></span>
                    <span>Edad: <strong className="text-foreground">{pet.ageYears} años {pet.ageMonths} meses</strong></span>
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
                      <span>{apt.date}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{apt.service}</p>
                      <p className="text-muted-foreground text-xs">{apt.pet} · {apt.time}</p>
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
