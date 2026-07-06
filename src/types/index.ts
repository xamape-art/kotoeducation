export interface Client {
  id: string
  created_at: string
  name: string
  email: string | null
  phone: string | null
  address: string | null
  notes: string | null
  pets?: Pet[]
}

export interface Pet {
  id: string
  client_id: string
  name: string
  species: 'dog' | 'cat' | 'other'
  breed: string | null
  weight_kg: number | null
  age_years: number | null
  age_months: number | null
  sex: 'male' | 'female' | null
  needs: string | null
  notes: string | null
  photo_url: string | null
}

export interface Service {
  id: string
  name: string
  description: string | null
  price: number
  duration_minutes: number | null
  category: 'walk' | 'visit' | 'care' | 'training'
  active: boolean
}

export interface Appointment {
  id: string
  created_at: string
  client_id: string
  pet_id: string
  service_id: string
  date: string
  time: string
  duration_minutes: number
  price: number
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  notes: string | null
  client?: Client
  pet?: Pet
  service?: Service
}

export interface Income {
  id: string
  created_at: string
  date: string
  description: string
  amount: number
  appointment_id: string | null
  payment_method: 'cash' | 'transfer' | 'card'
}

export interface Expense {
  id: string
  created_at: string
  date: string
  description: string
  amount: number
  category: string
}

export interface GalleryPhoto {
  id: string
  created_at: string
  url: string
  caption: string | null
  category: 'dog' | 'cat' | 'walk' | 'care' | 'general'
  is_public: boolean
  storage_path: string
}

export interface ContactRequest {
  id: string
  created_at: string
  name: string
  email: string
  phone: string | null
  pet_name: string | null
  pet_breed: string | null
  pet_weight: number | null
  pet_age: number | null
  service_type: string
  preferred_date: string | null
  message: string | null
  status: 'new' | 'contacted' | 'booked' | 'closed'
}

export interface Rate {
  id: string
  name: string
  description: string | null
  price: number
  category: string
  active: boolean
}

export interface WalkReport {
  id: string
  appointment_id: string
  date: string
  duration_minutes: number
  notes: string | null
  photos: string[]
  created_at: string
}
