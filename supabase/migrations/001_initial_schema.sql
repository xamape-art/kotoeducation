-- ============================================================
-- Koto Education - Initial Schema
-- ============================================================
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard

-- Clients
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  name text NOT NULL,
  email text,
  phone text,
  address text,
  notes text
);

-- Pets
CREATE TABLE IF NOT EXISTS pets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name text NOT NULL,
  species text NOT NULL DEFAULT 'dog' CHECK (species IN ('dog', 'cat', 'other')),
  breed text,
  weight_kg numeric(5,2),
  age_years smallint,
  age_months smallint,
  sex text CHECK (sex IN ('male', 'female')),
  needs text,
  notes text,
  photo_url text
);

-- Services / Rates
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  name text NOT NULL,
  description text,
  price numeric(8,2) NOT NULL DEFAULT 0,
  duration_minutes smallint,
  category text NOT NULL CHECK (category IN ('walk', 'visit', 'care', 'training')),
  active boolean DEFAULT true
);

-- Default services
INSERT INTO services (name, description, price, duration_minutes, category) VALUES
  ('Paseo 30 min', 'Paseo individual o en grupo por el barrio', 10, 30, 'walk'),
  ('Paseo 60 min', 'Paseo extendido de una hora', 13, 60, 'walk'),
  ('Paseo individual', 'Paseo exclusivo para tu mascota', 15, 30, 'walk'),
  ('Visita a domicilio (30 min)', 'Visita, alimentación y compañía', 10, 30, 'visit'),
  ('Visita a domicilio (1 hora)', 'Visita extendida de una hora', 15, 60, 'visit'),
  ('Cuidado a domicilio (noche)', 'Pernoctación en tu hogar', 35, NULL, 'care'),
  ('Cuidado a domicilio (día)', 'Jornada completa sin pernoctación', 20, NULL, 'care'),
  ('Educación canina (sesión)', 'Sesión individual de adiestramiento', 0, 60, 'training');

-- Appointments
CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  pet_id uuid NOT NULL REFERENCES pets(id) ON DELETE RESTRICT,
  service_id uuid NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
  date date NOT NULL,
  time time NOT NULL,
  duration_minutes smallint NOT NULL DEFAULT 30,
  price numeric(8,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  notes text
);

-- Income
CREATE TABLE IF NOT EXISTS income (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  date date NOT NULL DEFAULT CURRENT_DATE,
  description text NOT NULL,
  amount numeric(8,2) NOT NULL,
  appointment_id uuid REFERENCES appointments(id) ON DELETE SET NULL,
  payment_method text NOT NULL DEFAULT 'cash' CHECK (payment_method IN ('cash', 'transfer', 'card'))
);

-- Expenses
CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  date date NOT NULL DEFAULT CURRENT_DATE,
  description text NOT NULL,
  amount numeric(8,2) NOT NULL,
  category text NOT NULL DEFAULT 'other'
);

-- Gallery photos
CREATE TABLE IF NOT EXISTS gallery_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  storage_path text NOT NULL,
  url text NOT NULL,
  caption text,
  category text NOT NULL DEFAULT 'general' CHECK (category IN ('dog', 'cat', 'walk', 'care', 'general')),
  is_public boolean DEFAULT true
);

-- Contact requests (from public website)
CREATE TABLE IF NOT EXISTS contact_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  pet_name text,
  pet_breed text,
  pet_weight numeric(5,2),
  pet_age numeric(4,1),
  service_type text NOT NULL,
  preferred_date date,
  message text,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'booked', 'closed'))
);

-- Walk reports
CREATE TABLE IF NOT EXISTS walk_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  appointment_id uuid REFERENCES appointments(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  duration_minutes smallint,
  notes text,
  photos text[] DEFAULT '{}'
);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE income ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE walk_reports ENABLE ROW LEVEL SECURITY;

-- Authenticated users (admin) can do everything
CREATE POLICY "Admin full access - clients" ON clients FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access - pets" ON pets FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access - services" ON services FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access - appointments" ON appointments FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access - income" ON income FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access - expenses" ON expenses FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access - gallery" ON gallery_photos FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access - contact_requests" ON contact_requests FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access - walk_reports" ON walk_reports FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Public (anon) can INSERT contact requests (from the website contact form)
CREATE POLICY "Public can insert contact requests" ON contact_requests FOR INSERT TO anon WITH CHECK (true);

-- Public can read public gallery photos
CREATE POLICY "Public can read public gallery" ON gallery_photos FOR SELECT TO anon USING (is_public = true);

-- Public can read active services
CREATE POLICY "Public can read active services" ON services FOR SELECT TO anon USING (active = true);

-- ============================================================
-- Storage (run after creating the bucket in Supabase dashboard)
-- ============================================================
-- 1. Create a bucket called "gallery" in Supabase Storage (make it public)
-- 2. Then run:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('gallery', 'gallery', true);
