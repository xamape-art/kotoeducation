export interface Client {
  id: string
  created_at: string
  name: string
  email: string | null
  phone: string | null
  address: string | null
  nif?: string | null
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
  category: string // 'walk' | 'visit' | 'care' | 'training' or a custom one
  active: boolean
  is_extra?: boolean
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

export interface InvoiceItem {
  description: string
  quantity: number
  unit_price: number // sin IVA
}

export interface Invoice {
  id: string
  created_at: string
  year: number
  seq: number
  number: string
  date: string
  client_id: string | null
  client_name: string
  client_nif: string | null
  client_address: string | null
  items: InvoiceItem[]
  vat_rate: number
  subtotal: number
  vat_amount: number
  total: number
  status: 'pending' | 'paid'
  paid_at: string | null
  payment_method: 'cash' | 'transfer' | 'card' | null
  income_id: string | null
  notes: string | null
}

export interface Product {
  id: string
  created_at: string
  slug: string
  name: string
  description: string | null
  price: number // IVA incluido
  colors: string[]
  images: string[]
  measurement_label: string | null
  engraving_label: string | null
  production_days: number
  active: boolean
  sort_order: number
}

export interface ShopSettings {
  id: number
  enabled: boolean
  shipping_price: number
  free_shipping_from: number | null
}

export interface OrderItem {
  product_id: string
  name: string
  color: string | null
  measurement: string | null
  engraving: string | null
  quantity: number
  unit_price: number // IVA incluido
}

export type OrderStatus = 'pending_payment' | 'paid' | 'in_production' | 'shipped' | 'delivered' | 'cancelled'

export interface Order {
  id: string
  created_at: string
  number: number
  status: OrderStatus
  customer_name: string
  customer_email: string
  customer_phone: string | null
  address: string
  postal_code: string
  city: string
  province: string
  notes: string | null
  items: OrderItem[]
  subtotal: number
  shipping: number
  total: number
  stripe_session_id: string | null
  paid_at: string | null
  tracking_number: string | null
  invoice_id: string | null
  income_id: string | null
}

export interface AgendaEvent {
  id: string
  created_at: string
  title: string
  date: string
  time: string | null
  type: 'meeting' | 'reminder' | 'tax' | 'other'
  notes: string | null
  done: boolean
  done_at: string | null
}
