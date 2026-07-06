import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Phone, Mail, MapPin, Dog, Calendar, Edit, Plus, FileText } from 'lucide-react'
import Link from 'next/link'

const mockClient = {
  id: '1',
  name: 'Xavier M.',
  email: 'xavier@email.com',
  phone: '+34 611 222 333',
  address: 'C/ Major, 12, Terrassa',
  notes: 'Prefiere paseos por la tarde. Koto es reactivo con perros desconocidos.',
  createdAt: 'Enero 2024',
}

const mockPets = [
  {
    id: '1',
    name: 'Koto',
    species: 'dog',
    breed: 'Galgo español',
    weight: 18,
    ageYears: 4,
    ageMonths: 3,
    sex: 'male',
    needs: 'Reactivo con perros desconocidos. Necesita paseos tranquilos. Le encanta correr.',
    notes: 'Come 2 veces al día. Pienso Hills Adult. Vacunas al día.',
  },
]

const mockAppointments = [
  { id: '1', date: '06/07/2025', time: '09:00', service: 'Paseo 30min', pet: 'Koto', price: 10, status: 'confirmed' },
  { id: '2', date: '03/07/2025', time: '09:00', service: 'Paseo 30min', pet: 'Koto', price: 10, status: 'completed' },
  { id: '3', date: '01/07/2025', time: '09:00', service: 'Paseo 30min', pet: 'Koto', price: 10, status: 'completed' },
  { id: '4', date: '28/06/2025', time: '16:30', service: 'Visita domicilio', pet: 'Koto', price: 10, status: 'completed' },
]

const statusBadge: Record<string, { label: string; className: string }> = {
  confirmed: { label: 'Confirmada', className: 'bg-green-100 text-green-700' },
  completed: { label: 'Completada', className: 'bg-gray-100 text-gray-600' },
  pending: { label: 'Pendiente', className: 'bg-yellow-100 text-yellow-700' },
  cancelled: { label: 'Cancelada', className: 'bg-red-100 text-red-600' },
}

export default function ClientDetailPage({ params }: { params: { id: string } }) {
  const totalSpent = mockAppointments
    .filter(a => a.status === 'completed')
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
              {mockClient.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight">{mockClient.name}</h1>
            <p className="text-muted-foreground text-sm">Cliente desde {mockClient.createdAt}</p>
          </div>
        </div>
        <Button variant="outline" size="sm">
          <Edit className="h-4 w-4 mr-2" />
          Editar
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total citas', value: mockAppointments.length },
          { label: 'Completadas', value: mockAppointments.filter(a => a.status === 'completed').length },
          { label: 'Mascotas', value: mockPets.length },
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
              {mockClient.email && (
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                  <a href={`mailto:${mockClient.email}`} className="hover:underline">{mockClient.email}</a>
                </div>
              )}
              {mockClient.phone && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                  <a href={`tel:${mockClient.phone}`} className="hover:underline">{mockClient.phone}</a>
                </div>
              )}
              {mockClient.address && (
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span>{mockClient.address}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mascotas" className="space-y-4 mt-4">
          <div className="flex justify-end">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Añadir mascota
            </Button>
          </div>
          {mockPets.map((pet) => (
            <Card key={pet.id}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 font-display text-lg">
                  <Dog className="h-4 w-4 text-primary" />
                  {pet.name}
                  <Badge variant="outline" className="text-xs">{pet.breed}</Badge>
                  <Badge variant="outline" className="text-xs">{pet.sex === 'male' ? '♂ Macho' : '♀ Hembra'}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex gap-6 text-muted-foreground">
                  <span>Peso: <strong className="text-foreground">{pet.weight} kg</strong></span>
                  <span>Edad: <strong className="text-foreground">{pet.ageYears} años {pet.ageMonths} meses</strong></span>
                </div>
                {pet.needs && (
                  <div>
                    <p className="font-medium text-xs uppercase tracking-wide text-muted-foreground mb-1">Necesidades especiales</p>
                    <p className="text-muted-foreground">{pet.needs}</p>
                  </div>
                )}
                {pet.notes && (
                  <div>
                    <p className="font-medium text-xs uppercase tracking-wide text-muted-foreground mb-1">Notas</p>
                    <p className="text-muted-foreground">{pet.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="historial" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {mockAppointments.map((apt) => (
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
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge[apt.status].className}`}>
                      {statusBadge[apt.status].label}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notas" className="mt-4">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <FileText className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <p className="text-sm text-muted-foreground">{mockClient.notes || 'Sin notas adicionales.'}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
